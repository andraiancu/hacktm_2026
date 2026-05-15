from fastapi import FastAPI
from fastapi.testclient import TestClient

from spiderfoot_ingestion_models import (
    BreachedData,
    DigitalFootprint,
    ParsedSpiderFootData,
    PersonalInfo,
    SpiderFootRawEvent,
)
from spiderfoot_ingestion_router import router
from spiderfoot_parser import parse_spiderfoot_events


def test_parse_emailaddr_compromised() -> None:
    parsed = parse_spiderfoot_events(
        [
            SpiderFootRawEvent(
                module="sfp_haveibeenpwned",
                type="EMAILADDR_COMPROMISED",
                data="munteandarius2005@gmail.com [underarmour.com]",
            )
        ]
    )
    assert len(parsed.breached_data) == 1
    assert parsed.breached_data[0].email == "munteandarius2005@gmail.com"
    assert parsed.breached_data[0].breach_source == "underarmour.com"


def test_parse_account_external_owned() -> None:
    parsed = parse_spiderfoot_events(
        [
            SpiderFootRawEvent(
                module="sfp_accounts",
                type="ACCOUNT_EXTERNAL_OWNED",
                data="TikTok (Category: social)https://www.tiktok.com/@munteandarius2005?lang=en",
            )
        ]
    )
    assert len(parsed.digital_footprint) == 1
    assert parsed.digital_footprint[0].platform == "TikTok"
    assert parsed.digital_footprint[0].category == "social"
    assert parsed.digital_footprint[0].url == "https://www.tiktok.com/@munteandarius2005?lang=en"


def test_parse_numverify_raw_rir_data() -> None:
    parsed = parse_spiderfoot_events(
        [
            SpiderFootRawEvent(
                module="sfp_numverify",
                type="RAW_RIR_DATA",
                data=(
                    "{'valid': True, 'number': '40799797079', 'international_format': '+40799797079', "
                    "'country_name': 'Romania', 'carrier': 'Vodafone Romania SA', 'line_type': 'mobile'}"
                ),
            )
        ]
    )
    assert len(parsed.personal_info) == 1
    assert parsed.personal_info[0].phone == "+40799797079"
    assert parsed.personal_info[0].location == "Romania"
    assert parsed.personal_info[0].carrier == "Vodafone Romania SA"
    assert parsed.personal_info[0].line_type == "mobile"


def test_parse_gravatar_raw_rir_data_and_social_media() -> None:
    parsed = parse_spiderfoot_events(
        [
            SpiderFootRawEvent(
                module="sfp_gravatar",
                type="RAW_RIR_DATA",
                data=(
                    "{'displayName': 'Oprea Tudor Alex', 'aboutMe': 'Sef la femei', "
                    "'currentLocation': 'Romania, Timisoara', 'job_title': 'Engineer', "
                    "'thumbnailUrl': 'https://1.gravatar.com/avatar/e281e1cbf5847ab8f107f6c69762c2a5', "
                    "'accounts': [{'name': 'LinkedIn', "
                    "'url': 'https://www.linkedin.com/in/tudor-oprea-26bb93342'}]}"
                ),
            ),
            SpiderFootRawEvent(
                module="sfp_gravatar",
                type="SOCIAL_MEDIA",
                data="Linkedin: <SFURL>https://www.linkedin.com/in/tudor-oprea-26bb93342</SFURL>",
            ),
        ]
    )
    assert len(parsed.personal_info) == 1
    assert parsed.personal_info[0].display_name == "Oprea Tudor Alex"
    assert parsed.personal_info[0].about_me == "Sef la femei"
    assert parsed.personal_info[0].location == "Romania, Timisoara"
    assert parsed.personal_info[0].job_title == "Engineer"
    assert parsed.personal_info[0].avatar_url == "https://1.gravatar.com/avatar/e281e1cbf5847ab8f107f6c69762c2a5"
    assert len(parsed.digital_footprint) == 2
    assert parsed.digital_footprint[1].platform == "Linkedin"
    assert parsed.digital_footprint[1].url == "https://www.linkedin.com/in/tudor-oprea-26bb93342"


def test_ingestion_endpoint_normalizes_payload() -> None:
    app = FastAPI()
    app.include_router(router)
    client = TestClient(app)

    payload = {
        "scan_id": "abc123",
        "results": [
            {
                "module": "sfp_citadel",
                "type": "EMAILADDR_COMPROMISED",
                "data": "munteandarius2005@gmail.com [underarmour.com]",
            },
            {
                "module": "sfp_numverify",
                "type": "PROVIDER_TELCO",
                "data": "Vodafone Romania SA",
            },
        ],
    }
    response = client.post("/spiderfoot/ingest", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["scan_id"] == "abc123"
    assert body["counts"]["breached_data"] == 1
    assert body["counts"]["personal_info"] == 1


def test_breached_group_endpoint_scans_then_parses(monkeypatch) -> None:
    app = FastAPI()
    app.include_router(router)
    client = TestClient(app)

    def fake_runner(payload, modules):
        assert payload.target == "munteandarius2005@gmail.com"
        assert "sfp_citadel" in modules
        return (
            "scan-breached",
            "FINISHED",
            ParsedSpiderFootData(
                breached_data=[
                    BreachedData(
                        email="munteandarius2005@gmail.com",
                        breach_source="underarmour.com",
                        source_type="EMAILADDR_COMPROMISED",
                    )
                ]
            ),
        )

    monkeypatch.setattr("spiderfoot_ingestion_router.run_group_scan_and_parse", fake_runner)
    payload = {
        "target": "munteandarius2005@gmail.com",
        "target_type": "EMAILADDR",
    }
    response = client.post("/spiderfoot/ingest/breached-data", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["scan_id"] == "scan-breached"
    assert body["status"] == "FINISHED"
    assert body["count"] == 1
    assert body["breached_data"][0]["email"] == "munteandarius2005@gmail.com"
    assert body["breached_data"][0]["breach_source"] == "underarmour.com"


def test_digital_group_endpoint_scans_then_parses(monkeypatch) -> None:
    app = FastAPI()
    app.include_router(router)
    client = TestClient(app)

    def fake_runner(payload, modules):
        assert payload.target == "munteandarius2005"
        assert "sfp_accounts" in modules
        return (
            "scan-digital",
            "FINISHED",
            ParsedSpiderFootData(
                digital_footprint=[
                    DigitalFootprint(
                        platform="TikTok",
                        url="https://www.tiktok.com/@munteandarius2005?lang=en",
                        category="social",
                        source_type="ACCOUNT_EXTERNAL_OWNED",
                    ),
                    DigitalFootprint(
                        platform="Linkedin",
                        url="https://www.linkedin.com/in/tudor-oprea-26bb93342",
                        category="social",
                        source_type="SOCIAL_MEDIA",
                    ),
                ]
            ),
        )

    monkeypatch.setattr("spiderfoot_ingestion_router.run_group_scan_and_parse", fake_runner)
    payload = {
        "target": "munteandarius2005",
        "target_type": "USERNAME",
    }
    response = client.post("/spiderfoot/ingest/digital-footprint", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["scan_id"] == "scan-digital"
    assert body["status"] == "FINISHED"
    assert body["count"] == 2
    assert body["digital_footprint"][0]["platform"] == "TikTok"
    assert body["digital_footprint"][0]["category"] == "social"
    assert body["digital_footprint"][1]["platform"] == "Linkedin"
    assert body["digital_footprint"][1]["url"] == "https://www.linkedin.com/in/tudor-oprea-26bb93342"


def test_personal_info_group_endpoint_scans_then_parses(monkeypatch) -> None:
    app = FastAPI()
    app.include_router(router)
    client = TestClient(app)

    def fake_runner(payload, modules):
        assert payload.target == "+40799797079"
        assert "sfp_numverify" in modules
        return (
            "scan-personal",
            "FINISHED",
            ParsedSpiderFootData(
                personal_info=[
                    PersonalInfo(
                        phone="+40799797079",
                        carrier="Vodafone Romania SA",
                        location="Romania",
                        line_type="mobile",
                        source_type="RAW_RIR_DATA",
                    ),
                    PersonalInfo(
                        display_name="Oprea Tudor Alex",
                        about_me="Sef la femei",
                        location="Romania, Timisoara",
                        job_title="Engineer",
                        avatar_url="https://1.gravatar.com/avatar/e281e1cbf5847ab8f107f6c69762c2a5",
                        source_type="RAW_RIR_DATA",
                    ),
                ]
            ),
        )

    monkeypatch.setattr("spiderfoot_ingestion_router.run_group_scan_and_parse", fake_runner)
    payload = {
        "target": "+40799797079",
        "target_type": "PHONE_NUMBER",
    }
    response = client.post("/spiderfoot/ingest/personal-info", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["scan_id"] == "scan-personal"
    assert body["status"] == "FINISHED"
    assert body["count"] == 2
    assert body["personal_info"][0]["phone"] == "+40799797079"
    assert body["personal_info"][0]["carrier"] == "Vodafone Romania SA"
    assert body["personal_info"][1]["display_name"] == "Oprea Tudor Alex"
