#!/bin/bash

source opt/venv/bin/activate

cd /app
RUN_PORT=${PORT:-8000}
RUN_HOST=${HOST:-0.0.0.0}

gunicorn -k uvicorn.workers.UvicornWorker -w 4 -b ${RUN_HOST}:${RUN_PORT} src.main:app --timeout 120 --log-level info