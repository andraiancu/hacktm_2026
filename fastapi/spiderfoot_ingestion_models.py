from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class SpiderFootRawEvent(BaseModel):
    module: str
    type: str
    data: str
    source_data: str | None = None
    generated: str | None = None
    confidence: int | None = None
    visibility: int | None = None
    risk: int | None = None
    hash: str | None = None
    source_event_hash: str | None = None
    event_descr: str | None = None
    event_type: str | None = None
    false_positive: bool = False


class SpiderFootIngestionRequest(BaseModel):
    scan_id: str | None = None
    results: list[SpiderFootRawEvent] = Field(default_factory=list)


class BreachedData(BaseModel):
    email: str
    breach_source: str | None = None
    source_module: str | None = None
    source_type: str


class DigitalFootprint(BaseModel):
    platform: str
    url: str
    category: str | None = None
    source_module: str | None = None
    source_type: str


class PersonalInfo(BaseModel):
    phone: str | None = None
    carrier: str | None = None
    location: str | None = None
    display_name: str | None = None
    about_me: str | None = None
    job_title: str | None = None
    avatar_url: str | None = None
    line_type: str | None = None
    source_module: str | None = None
    source_type: str


class ParsedSpiderFootData(BaseModel):
    breached_data: list[BreachedData] = Field(default_factory=list)
    digital_footprint: list[DigitalFootprint] = Field(default_factory=list)
    personal_info: list[PersonalInfo] = Field(default_factory=list)
    ignored_events: list[SpiderFootRawEvent] = Field(default_factory=list)


class SpiderFootIngestionResponse(BaseModel):
    scan_id: str | None = None
    parsed: ParsedSpiderFootData
    counts: dict[str, int]


class SpiderFootGroupEvent(BaseModel):
    type: str
    data: str


class SpiderFootGroupIngestionRequest(BaseModel):
    scan_id: str | None = None
    events: list[SpiderFootGroupEvent] = Field(default_factory=list)


class BreachedDataIngestionResponse(BaseModel):
    scan_id: str | None = None
    status: str | None = None
    breached_data: list[BreachedData] = Field(default_factory=list)
    ignored_events: list[SpiderFootRawEvent] = Field(default_factory=list)
    count: int


class DigitalFootprintIngestionResponse(BaseModel):
    scan_id: str | None = None
    status: str | None = None
    digital_footprint: list[DigitalFootprint] = Field(default_factory=list)
    ignored_events: list[SpiderFootRawEvent] = Field(default_factory=list)
    count: int


class PersonalInfoIngestionResponse(BaseModel):
    scan_id: str | None = None
    status: str | None = None
    personal_info: list[PersonalInfo] = Field(default_factory=list)
    ignored_events: list[SpiderFootRawEvent] = Field(default_factory=list)
    count: int


class SpiderFootGroupScanRequest(BaseModel):
    target: str = Field(..., min_length=2, max_length=2048)
    target_type: str = Field("INTERNET_NAME")
    timeout_seconds: int = Field(120, ge=5, le=1800)
    poll_interval_seconds: float = Field(2.0, ge=0.5, le=10.0)


def normalize_ingestion_payload(payload: dict[str, Any]) -> SpiderFootIngestionRequest:
    if "results" in payload:
        results_raw = payload.get("results")
        if isinstance(results_raw, dict):
            payload = {**payload, "results": [results_raw]}
        return SpiderFootIngestionRequest.model_validate(payload)

    if {"module", "type", "data"} <= set(payload.keys()):
        return SpiderFootIngestionRequest(results=[SpiderFootRawEvent.model_validate(payload)])

    raise ValueError("Payload must include a results array or a single event with module/type/data")


def normalize_group_ingestion_payload(payload: dict[str, Any]) -> SpiderFootGroupIngestionRequest:
    if "events" in payload:
        events_raw = payload.get("events")
        if isinstance(events_raw, dict):
            payload = {**payload, "events": [events_raw]}
        return SpiderFootGroupIngestionRequest.model_validate(payload)

    if {"type", "data"} <= set(payload.keys()):
        return SpiderFootGroupIngestionRequest(events=[SpiderFootGroupEvent.model_validate(payload)])

    raise ValueError("Payload must include an events array or a single event with type/data")
