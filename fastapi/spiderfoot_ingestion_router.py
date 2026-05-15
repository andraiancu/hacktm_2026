from __future__ import annotations

import logging
import multiprocessing as mp
import os
import sys
import threading
import time
from functools import lru_cache
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import ValidationError

from spiderfoot_ingestion_models import (
    BreachedDataIngestionResponse,
    DigitalFootprintIngestionResponse,
    PersonalInfoIngestionResponse,
    SpiderFootGroupScanRequest,
    SpiderFootIngestionResponse,
    SpiderFootRawEvent,
    normalize_ingestion_payload,
)
from spiderfoot_parser import parse_spiderfoot_events

router = APIRouter(prefix="/spiderfoot", tags=["spiderfoot-ingestion"])
log = logging.getLogger("fastapi.spiderfoot.ingestion")

logging_queue = mp.Queue()
log_listener = None

ALLOWED_TARGET_TYPES = {
    "IP_ADDRESS",
    "IPV6_ADDRESS",
    "NETBLOCK_OWNER",
    "NETBLOCKV6_OWNER",
    "INTERNET_NAME",
    "EMAILADDR",
    "HUMAN_NAME",
    "BGP_AS_OWNER",
    "PHONE_NUMBER",
    "USERNAME",
    "BITCOIN_ADDRESS",
}
GROUP_MODULES = {
    "breached_data": ["sfp__stor_db", "sfp_citadel", "sfp_haveibeenpwned"],
    "digital_footprint": ["sfp__stor_db", "sfp_accounts", "sfp_gravatar"],
    "personal_info": ["sfp__stor_db", "sfp_numverify", "sfp_gravatar"],
}
RUNNING_STATUSES = {"CREATED", "RUNNING", "STARTING"}


def resolve_spiderfoot_dir() -> Path:
    env_override = os.getenv("SPIDERFOOT_DIR")
    if env_override:
        return Path(env_override).resolve()

    for parent in Path(__file__).resolve().parents:
        candidate = parent / "fastapi" / "spiderfoot"
        if candidate.exists():
            return candidate

    return Path(__file__).resolve().parents[1] / "fastapi" / "spiderfoot"


def _load_spiderfoot_runtime() -> tuple[Any, Any, Any, Any, Any]:
    spiderfoot_dir = resolve_spiderfoot_dir()
    if not spiderfoot_dir.exists():
        raise RuntimeError(f"SpiderFoot directory not found: {spiderfoot_dir}")
    if str(spiderfoot_dir) not in sys.path:
        sys.path.insert(0, str(spiderfoot_dir))

    from spiderfoot import SpiderFootDb, SpiderFootHelpers  # noqa: WPS433
    from spiderfoot.logger import logListenerSetup, logWorkerSetup  # noqa: WPS433
    from sfscan import SpiderFootScanner  # noqa: WPS433

    return SpiderFootDb, SpiderFootHelpers, SpiderFootScanner, logListenerSetup, logWorkerSetup


@lru_cache(maxsize=1)
def get_spiderfoot_config() -> dict[str, Any]:
    _, SpiderFootHelpers, _, _, _ = _load_spiderfoot_runtime()
    spiderfoot_dir = resolve_spiderfoot_dir()
    modules = SpiderFootHelpers.loadModulesAsDict(str(spiderfoot_dir / "modules"), ["sfp_template.py"])
    if not modules:
        raise RuntimeError(f"No modules loaded from {spiderfoot_dir / 'modules'}")

    return {
        "_debug": False,
        "_maxthreads": 5,
        "__logging": True,
        "__outputfilter": None,
        "_useragent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:62.0) Gecko/20100101 Firefox/62.0",
        "_dnsserver": "",
        "_fetchtimeout": 5,
        "_internettlds": "https://publicsuffix.org/list/effective_tld_names.dat",
        "_internettlds_cache": 72,
        "_genericusers": ",".join(SpiderFootHelpers.usernamesFromWordlists(["generic-usernames"])),
        "__database": f"{SpiderFootHelpers.dataPath()}/spiderfoot.db",
        "__modules__": modules,
        "__correlationrules__": [],
        "_socks1type": "",
        "_socks2addr": "",
        "_socks3port": "",
        "_socks4user": "",
        "_socks5pwd": "",
    }


def _run_scan(scan_id: str, target: str, target_type: str, modules: list[str]) -> None:
    try:
        _, _, SpiderFootScanner, logListenerSetup, logWorkerSetup = _load_spiderfoot_runtime()
        config = get_spiderfoot_config()
        global log_listener
        if log_listener is None:
            log_listener = logListenerSetup(logging_queue, config)
        logWorkerSetup(logging_queue)
        SpiderFootScanner(f"group-scan-{scan_id[:8]}", scan_id, target, target_type, modules, config, start=True)
    except Exception:
        log.exception("Group scan failed", extra={"scanId": scan_id})


def _start_scan(target: str, target_type: str, modules: list[str]) -> str:
    _, SpiderFootHelpers, _, _, _ = _load_spiderfoot_runtime()
    scan_id = SpiderFootHelpers.genScanInstanceId()
    thread = threading.Thread(
        target=_run_scan,
        args=(scan_id, target, target_type, modules),
        daemon=True,
    )
    thread.start()
    return scan_id


def _get_scan_info(scan_id: str) -> tuple[Any, ...] | None:
    SpiderFootDb, _, _, _, _ = _load_spiderfoot_runtime()
    dbh = SpiderFootDb(get_spiderfoot_config())
    try:
        return dbh.scanInstanceGet(scan_id)
    finally:
        dbh.close()


def _get_scan_results(scan_id: str) -> list[SpiderFootRawEvent]:
    def optional_str(value: Any) -> str | None:
        return None if value is None else str(value)

    def optional_int(value: Any) -> int | None:
        if value is None:
            return None
        try:
            return int(value)
        except (TypeError, ValueError):
            return None

    SpiderFootDb, _, _, _, _ = _load_spiderfoot_runtime()
    dbh = SpiderFootDb(get_spiderfoot_config())
    try:
        results_raw = dbh.scanResultEvent(scan_id)
        return [
            SpiderFootRawEvent(
                generated=optional_str(row[0]),
                data=str(row[1]),
                source_data=optional_str(row[2]),
                module=str(row[3]),
                type=str(row[4]),
                confidence=optional_int(row[5]),
                visibility=optional_int(row[6]),
                risk=optional_int(row[7]),
                hash=optional_str(row[8]),
                source_event_hash=optional_str(row[9]),
                event_descr=optional_str(row[10]),
                event_type=optional_str(row[11]),
                false_positive=bool(row[13]),
            )
            for row in results_raw
        ]
    finally:
        dbh.close()


def _wait_until_scan_finishes(scan_id: str, timeout_seconds: int, poll_interval_seconds: float) -> str:
    start = time.monotonic()
    while True:
        info = _get_scan_info(scan_id)
        if info:
            status = str(info[5]).upper()
            if info[4] is not None or status not in RUNNING_STATUSES:
                return status
        if (time.monotonic() - start) >= timeout_seconds:
            raise TimeoutError(f"Timed out waiting for scan {scan_id}")
        time.sleep(poll_interval_seconds)


def run_group_scan_and_parse(
    payload: SpiderFootGroupScanRequest,
    modules: list[str],
) -> tuple[str, str, Any]:
    target_type = payload.target_type.strip().upper()
    if target_type not in ALLOWED_TARGET_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported target_type")

    target = payload.target.strip()
    if not target:
        raise HTTPException(status_code=400, detail="Target is required")

    scan_id = _start_scan(target=target, target_type=target_type, modules=modules)
    try:
        status = _wait_until_scan_finishes(scan_id, payload.timeout_seconds, payload.poll_interval_seconds)
    except TimeoutError as exc:
        raise HTTPException(status_code=504, detail=str(exc)) from exc

    parsed = parse_spiderfoot_events(_get_scan_results(scan_id))
    return scan_id, status, parsed


@router.post("/ingest", response_model=SpiderFootIngestionResponse)
def ingest_spiderfoot_results(payload: dict[str, Any]) -> SpiderFootIngestionResponse:
    try:
        ingestion_payload = normalize_ingestion_payload(payload)
    except (ValueError, ValidationError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    parsed = parse_spiderfoot_events(ingestion_payload.results)

    return SpiderFootIngestionResponse(
        scan_id=ingestion_payload.scan_id,
        parsed=parsed,
        counts={
            "breached_data": len(parsed.breached_data),
            "digital_footprint": len(parsed.digital_footprint),
            "personal_info": len(parsed.personal_info),
            "ignored_events": len(parsed.ignored_events),
        },
    )


@router.post("/ingest/breached-data", response_model=BreachedDataIngestionResponse)
def ingest_breached_data(payload: SpiderFootGroupScanRequest) -> BreachedDataIngestionResponse:
    scan_id, status, parsed = run_group_scan_and_parse(payload, GROUP_MODULES["breached_data"])
    return BreachedDataIngestionResponse(
        scan_id=scan_id,
        status=status,
        breached_data=parsed.breached_data,
        ignored_events=parsed.ignored_events,
        count=len(parsed.breached_data),
    )


@router.post("/ingest/digital-footprint", response_model=DigitalFootprintIngestionResponse)
def ingest_digital_footprint(payload: SpiderFootGroupScanRequest) -> DigitalFootprintIngestionResponse:
    scan_id, status, parsed = run_group_scan_and_parse(payload, GROUP_MODULES["digital_footprint"])
    return DigitalFootprintIngestionResponse(
        scan_id=scan_id,
        status=status,
        digital_footprint=parsed.digital_footprint,
        ignored_events=parsed.ignored_events,
        count=len(parsed.digital_footprint),
    )


@router.post("/ingest/personal-info", response_model=PersonalInfoIngestionResponse)
def ingest_personal_info(payload: SpiderFootGroupScanRequest) -> PersonalInfoIngestionResponse:
    scan_id, status, parsed = run_group_scan_and_parse(payload, GROUP_MODULES["personal_info"])
    return PersonalInfoIngestionResponse(
        scan_id=scan_id,
        status=status,
        personal_info=parsed.personal_info,
        ignored_events=parsed.ignored_events,
        count=len(parsed.personal_info),
    )
