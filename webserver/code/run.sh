#!/bin/sh


# -- Create actual revision (run only once to avoid redundant revisions)
# -- Run inside container for prepared db url
# alembic revision --autogenerate -m 'Create DB'

# -- Apply revisions
# alembic upgrade head


export APP_MODULE=${APP_MODULE-app.main:app}
export HOST=${HOST:-0.0.0.0}
export PORT=${PORT:-8001}

exec gunicorn --bind $HOST:$PORT "$APP_MODULE" -k uvicorn.workers.UvicornWorker