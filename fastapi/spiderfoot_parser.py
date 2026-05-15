from __future__ import annotations

import ast
import re
from typing import Any

from spiderfoot_ingestion_models import (
    BreachedData,
    DigitalFootprint,
    ParsedSpiderFootData,
    PersonalInfo,
    SpiderFootGroupEvent,
    SpiderFootRawEvent,
)

EMAIL_BREACH_RE = re.compile(r"^\s*(?P<email>[^\s\[]+)\s*\[(?P<breach_source>[^\]]+)\]\s*$")
CATEGORY_RE = re.compile(r"\(Category:\s*(?P<category>[^)]+)\)")
SOCIAL_MEDIA_RE = re.compile(r"^\s*(?P<platform>[^:]+):\s*(?P<payload>.+?)\s*$")
URL_RE = re.compile(r"https?://[^\s<>()]+")


def safe_parse_dict(raw_value: str) -> dict[str, Any] | None:
    try:
        parsed = ast.literal_eval(raw_value)
    except (SyntaxError, ValueError):
        return None
    if not isinstance(parsed, dict):
        return None
    return parsed


def extract_url(value: str) -> str | None:
    match = URL_RE.search(value)
    if not match:
        return None
    return match.group(0).strip()


def parse_email_compromised(event: SpiderFootRawEvent) -> BreachedData | None:
    match = EMAIL_BREACH_RE.match(event.data)
    if not match:
        return None
    return BreachedData(
        email=match.group("email").strip(),
        breach_source=match.group("breach_source").strip(),
        source_module=event.module,
        source_type=event.type,
    )


def parse_account_external_owned(event: SpiderFootRawEvent) -> DigitalFootprint | None:
    url = extract_url(event.data)
    if not url:
        return None

    prefix = event.data[: event.data.find(url)].strip()
    category_match = CATEGORY_RE.search(prefix)
    category = category_match.group("category").strip() if category_match else None

    platform = prefix.split("(")[0].strip()
    if not platform:
        return None

    return DigitalFootprint(
        platform=platform,
        url=url,
        category=category,
        source_module=event.module,
        source_type=event.type,
    )


def parse_numverify_raw_rir(event: SpiderFootRawEvent) -> PersonalInfo | None:
    parsed = safe_parse_dict(event.data)
    if not parsed:
        return None

    phone = parsed.get("international_format")
    country_name = parsed.get("country_name")
    carrier = parsed.get("carrier")
    line_type = parsed.get("line_type")

    if not any([phone, country_name, carrier, line_type]):
        return None

    return PersonalInfo(
        phone=str(phone) if phone else None,
        carrier=str(carrier) if carrier else None,
        location=str(country_name) if country_name else None,
        line_type=str(line_type) if line_type else None,
        source_module=event.module,
        source_type=event.type,
    )


def parse_provider_telco(event: SpiderFootRawEvent) -> PersonalInfo | None:
    provider = event.data.strip()
    if not provider:
        return None
    return PersonalInfo(
        carrier=provider,
        source_module=event.module,
        source_type=event.type,
    )


def parse_geoinfo(event: SpiderFootRawEvent) -> PersonalInfo | None:
    location = event.data.strip()
    if not location:
        return None
    return PersonalInfo(
        location=location,
        source_module=event.module,
        source_type=event.type,
    )


def parse_gravatar_raw_rir(event: SpiderFootRawEvent) -> tuple[PersonalInfo | None, list[DigitalFootprint]]:
    parsed = safe_parse_dict(event.data)
    if not parsed:
        return None, []

    personal_info = PersonalInfo(
        display_name=str(parsed.get("displayName")) if parsed.get("displayName") else None,
        about_me=str(parsed.get("aboutMe")) if parsed.get("aboutMe") else None,
        location=str(parsed.get("currentLocation")) if parsed.get("currentLocation") else None,
        job_title=str(parsed.get("job_title")) if parsed.get("job_title") else None,
        avatar_url=str(parsed.get("thumbnailUrl")) if parsed.get("thumbnailUrl") else None,
        source_module=event.module,
        source_type=event.type,
    )

    accounts = parsed.get("accounts") if isinstance(parsed.get("accounts"), list) else []
    footprints: list[DigitalFootprint] = []
    for account in accounts:
        if not isinstance(account, dict):
            continue
        name = str(account.get("name") or account.get("display") or account.get("domain") or "").strip()
        url = str(account.get("url") or "").strip()
        if not name or not url:
            continue
        footprints.append(
            DigitalFootprint(
                platform=name,
                url=url,
                category="social",
                source_module=event.module,
                source_type=event.type,
            )
        )

    if not any(
        [
            personal_info.display_name,
            personal_info.about_me,
            personal_info.location,
            personal_info.job_title,
            personal_info.avatar_url,
        ]
    ):
        personal_info = None

    return personal_info, footprints


def parse_social_media(event: SpiderFootRawEvent) -> DigitalFootprint | None:
    match = SOCIAL_MEDIA_RE.match(event.data)
    if not match:
        return None
    platform = match.group("platform").strip()
    payload = match.group("payload").replace("<SFURL>", "").replace("</SFURL>", "").strip()
    url = extract_url(payload)
    if not platform or not url:
        return None
    return DigitalFootprint(
        platform=platform,
        url=url,
        category="social",
        source_module=event.module,
        source_type=event.type,
    )


def parse_breached_group_event(event: SpiderFootGroupEvent) -> BreachedData | None:
    event_type = event.type.strip().upper()
    if event_type != "EMAILADDR_COMPROMISED":
        return None
    match = EMAIL_BREACH_RE.match(event.data)
    if not match:
        return None
    return BreachedData(
        email=match.group("email").strip(),
        breach_source=match.group("breach_source").strip(),
        source_module="group_ingestion",
        source_type=event_type,
    )


def parse_digital_group_event(event: SpiderFootGroupEvent) -> list[DigitalFootprint]:
    event_type = event.type.strip().upper()
    raw_event = SpiderFootRawEvent(module="group_ingestion", type=event_type, data=event.data)

    if event_type == "ACCOUNT_EXTERNAL_OWNED":
        parsed = parse_account_external_owned(raw_event)
        return [parsed] if parsed else []

    if event_type == "SOCIAL_MEDIA":
        parsed = parse_social_media(raw_event)
        return [parsed] if parsed else []

    if event_type == "RAW_RIR_DATA":
        parsed_data = safe_parse_dict(event.data)
        if not parsed_data:
            return []
        accounts = parsed_data.get("accounts")
        if not isinstance(accounts, list):
            return []
        footprints: list[DigitalFootprint] = []
        for account in accounts:
            if not isinstance(account, dict):
                continue
            name = str(account.get("name") or account.get("display") or account.get("domain") or "").strip()
            url = str(account.get("url") or "").strip()
            if not name or not url:
                continue
            footprints.append(
                DigitalFootprint(
                    platform=name,
                    url=url,
                    category="social",
                    source_module="group_ingestion",
                    source_type=event_type,
                )
            )
        return footprints

    return []


def parse_personal_info_group_event(event: SpiderFootGroupEvent) -> PersonalInfo | None:
    event_type = event.type.strip().upper()
    raw_event = SpiderFootRawEvent(module="group_ingestion", type=event_type, data=event.data)

    if event_type == "PROVIDER_TELCO":
        parsed = parse_provider_telco(raw_event)
        if parsed:
            parsed.source_module = "group_ingestion"
        return parsed

    if event_type == "GEOINFO":
        parsed = parse_geoinfo(raw_event)
        if parsed:
            parsed.source_module = "group_ingestion"
        return parsed

    if event_type != "RAW_RIR_DATA":
        return None

    parsed_data = safe_parse_dict(event.data)
    if not parsed_data:
        return None

    if any(key in parsed_data for key in ("international_format", "country_name", "carrier", "line_type")):
        parsed = parse_numverify_raw_rir(raw_event)
        if parsed:
            parsed.source_module = "group_ingestion"
        return parsed

    if any(key in parsed_data for key in ("displayName", "aboutMe", "currentLocation", "job_title", "thumbnailUrl")):
        parsed, _ = parse_gravatar_raw_rir(raw_event)
        if parsed:
            parsed.source_module = "group_ingestion"
        return parsed

    return None


def parse_spiderfoot_events(events: list[SpiderFootRawEvent]) -> ParsedSpiderFootData:
    normalized = ParsedSpiderFootData()

    for event in events:
        event_type = event.type.strip().upper()
        module = event.module.strip().lower()

        if event_type == "EMAILADDR_COMPROMISED" and module in {"sfp_citadel", "sfp_haveibeenpwned"}:
            parsed = parse_email_compromised(event)
            if parsed:
                normalized.breached_data.append(parsed)
            else:
                normalized.ignored_events.append(event)
            continue

        if event_type == "ACCOUNT_EXTERNAL_OWNED" and module == "sfp_accounts":
            parsed = parse_account_external_owned(event)
            if parsed:
                normalized.digital_footprint.append(parsed)
            else:
                normalized.ignored_events.append(event)
            continue

        if event_type == "RAW_RIR_DATA" and module == "sfp_numverify":
            parsed = parse_numverify_raw_rir(event)
            if parsed:
                normalized.personal_info.append(parsed)
            else:
                normalized.ignored_events.append(event)
            continue

        if event_type == "PROVIDER_TELCO" and module == "sfp_numverify":
            parsed = parse_provider_telco(event)
            if parsed:
                normalized.personal_info.append(parsed)
            else:
                normalized.ignored_events.append(event)
            continue

        if event_type == "GEOINFO" and module == "sfp_numverify":
            parsed = parse_geoinfo(event)
            if parsed:
                normalized.personal_info.append(parsed)
            else:
                normalized.ignored_events.append(event)
            continue

        if event_type == "RAW_RIR_DATA" and module == "sfp_gravatar":
            personal_info, footprints = parse_gravatar_raw_rir(event)
            if personal_info:
                normalized.personal_info.append(personal_info)
            normalized.digital_footprint.extend(footprints)
            if not personal_info and not footprints:
                normalized.ignored_events.append(event)
            continue

        if event_type == "SOCIAL_MEDIA" and module == "sfp_gravatar":
            parsed = parse_social_media(event)
            if parsed:
                normalized.digital_footprint.append(parsed)
            else:
                normalized.ignored_events.append(event)
            continue

        normalized.ignored_events.append(event)

    return normalized
