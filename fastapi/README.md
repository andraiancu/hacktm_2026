# SpiderFoot FastAPI

Install dependencies with `uv` from `fastapi/`:

```
uv sync
```

If you also need SpiderFoot runtime dependencies:

```
uv sync --group spiderfoot
```

Dev run:

```
uv run uvicorn app:app --reload --port 8000
```

Run tests:

```
uv run pytest -q test_deepfake_vulnerability.py
```

SpiderFoot ingestion endpoint:

```
POST /spiderfoot/ingest
```

Group ingestion endpoints (module not required):

```
POST /spiderfoot/ingest/breached-data
POST /spiderfoot/ingest/digital-footprint
POST /spiderfoot/ingest/personal-info
```

Each group endpoint automatically runs SpiderFoot with its module set, waits for completion, then parses and returns normalized output for that category.

Accepted payload shapes:

```
{
  "scan_id": "optional-scan-id",
  "results": [
    {"module": "...", "type": "...", "data": "..."}
  ]
}
```

or single event:

```
{"module": "...", "type": "...", "data": "..."}
```

For group scan endpoints, send target input and target type:

```
{
  "target": "value to scan",
  "target_type": "EMAILADDR",
  "timeout_seconds": 120,
  "poll_interval_seconds": 2.0
}
```

Optional:

```
set SPIDERFOOT_CORS_ORIGINS=http://localhost:5173
```
