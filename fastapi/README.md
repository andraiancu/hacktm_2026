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

Optional:

```
set SPIDERFOOT_CORS_ORIGINS=http://localhost:5173
```
