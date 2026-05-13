import logging
import multiprocessing as mp
import os
import sys
import threading
from functools import lru_cache
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

def resolve_spiderfoot_dir() -> Path:
    env_override = os.getenv("SPIDERFOOT_DIR")
    if env_override:
        return Path(env_override).resolve()

    for parent in Path(__file__).resolve().parents:
        candidate = parent / "fastapi" / "spiderfoot"
        if candidate.exists():
            return candidate

    return Path(__file__).resolve().parents[1] / "fastapi" / "spiderfoot"


SPIDERFOOT_DIR = resolve_spiderfoot_dir()
if SPIDERFOOT_DIR.exists() and str(SPIDERFOOT_DIR) not in sys.path:
    sys.path.insert(0, str(SPIDERFOOT_DIR))

if not SPIDERFOOT_DIR.exists():
    raise RuntimeError(f"SpiderFoot directory not found: {SPIDERFOOT_DIR}")

from spiderfoot import SpiderFootDb, SpiderFootHelpers  # noqa: E402
from sfscan import SpiderFootScanner  # noqa: E402
from spiderfoot.logger import logListenerSetup, logWorkerSetup  # noqa: E402

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("fastapi.spiderfoot")

logging_queue = mp.Queue()
log_listener = None

DEFAULT_MODULES = ["sfp__stor_db", "sfp_whois"]
ALLOWED_MODULES = {
    "sfp__stor_db",
    "sfp_whois",
    "sfp_accounts",
}
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
DEFAULT_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app = FastAPI(title="SpiderFoot API", version="0.1.0")

cors_env = os.getenv("SPIDERFOOT_CORS_ORIGINS")
cors_origins = (
    [origin.strip() for origin in cors_env.split(",") if origin.strip()]
    if cors_env
    else DEFAULT_ORIGINS
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScanRequest(BaseModel):
    target: str = Field(..., min_length=2, max_length=2048)
    target_type: str = Field("INTERNET_NAME")
    modules: list[str] | None = None


@lru_cache(maxsize=1)
def get_spiderfoot_config() -> dict[str, Any]:
    if not SPIDERFOOT_DIR.exists():
        raise RuntimeError(f"SpiderFoot directory not found: {SPIDERFOOT_DIR}")

    mod_dir = SPIDERFOOT_DIR / "modules"
    modules = SpiderFootHelpers.loadModulesAsDict(str(mod_dir), ["sfp_template.py"])
    if not modules:
        raise RuntimeError(f"No modules loaded from {mod_dir}")

    config = {
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
    return config


def run_scan(scan_id: str, target: str, target_type: str, modules: list[str]) -> None:
    try:
        scan_name = f"api-scan-{scan_id[:8]}"
        config = get_spiderfoot_config()
        global log_listener
        if log_listener is None:
            log_listener = logListenerSetup(logging_queue, config)
        logWorkerSetup(logging_queue)
        SpiderFootScanner(scan_name, scan_id, target, target_type, modules, config, start=True)
    except Exception:
        log.exception("Scan failed", extra={"scanId": scan_id})


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/scan")
def start_scan(payload: ScanRequest) -> dict[str, str]:
    target_type = payload.target_type.strip().upper()
    if target_type not in ALLOWED_TARGET_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported target_type")

    target = payload.target.strip()
    if not target:
        raise HTTPException(status_code=400, detail="Target is required")

    requested_modules = payload.modules or DEFAULT_MODULES
    modules = [module for module in requested_modules if module in ALLOWED_MODULES]
    if "sfp__stor_db" not in modules:
        modules.insert(0, "sfp__stor_db")

    if not modules:
        raise HTTPException(status_code=400, detail="No valid modules selected")

    scan_id = SpiderFootHelpers.genScanInstanceId()
    thread = threading.Thread(
        target=run_scan,
        args=(scan_id, target, target_type, modules),
        daemon=True,
    )
    thread.start()

    return {"scan_id": scan_id}


@app.get("/scan/{scan_id}")
def get_scan(scan_id: str, limit: int = 200) -> dict[str, Any]:
    config = get_spiderfoot_config()
    dbh = SpiderFootDb(config)
    try:
        info = dbh.scanInstanceGet(scan_id)
        if not info:
            raise HTTPException(status_code=404, detail="Scan not found")

        results_raw = dbh.scanResultEvent(scan_id)
        capped = results_raw[: max(1, min(limit, 500))]
        results = [
            {
                "generated": row[0],
                "data": row[1],
                "source_data": row[2],
                "module": row[3],
                "type": row[4],
                "confidence": row[5],
                "visibility": row[6],
                "risk": row[7],
                "hash": row[8],
                "source_event_hash": row[9],
                "event_descr": row[10],
                "event_type": row[11],
                "false_positive": bool(row[13]),
            }
            for row in capped
        ]

        return {
            "scan_id": scan_id,
            "name": info[0],
            "target": info[1],
            "created": info[2],
            "started": info[3],
            "ended": info[4],
            "status": info[5],
            "result_count": len(results_raw),
            "results": results,
        }
    finally:
        dbh.close()


@app.get("/scan/{scan_id}/logs")
def get_scan_logs(
    scan_id: str,
    limit: int = 200,
    from_row_id: int = 0,
    reverse: bool = False,
) -> dict[str, Any]:
    config = get_spiderfoot_config()
    dbh = SpiderFootDb(config)
    try:
        info = dbh.scanInstanceGet(scan_id)
        if not info:
            raise HTTPException(status_code=404, detail="Scan not found")

        logs_raw = dbh.scanLogs(scan_id, limit=max(1, min(limit, 500)), fromRowId=from_row_id, reverse=reverse)
        logs = [
            {
                "generated": row[0],
                "component": row[1],
                "type": row[2],
                "message": row[3],
                "rowid": row[4],
            }
            for row in logs_raw
        ]

        return {
            "scan_id": scan_id,
            "count": len(logs),
            "logs": logs,
        }
    finally:
        dbh.close()
