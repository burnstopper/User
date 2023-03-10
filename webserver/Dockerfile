FROM python:3.11 as requirements-stage

ENV PYTHONDONTWRITEBYTECODE 1

#
WORKDIR /tmp

#
RUN pip install poetry

#
COPY code/pyproject.toml code/poetry.lock* /tmp/

#
RUN poetry export -f requirements.txt --output requirements.txt --without-hashes

#
FROM tiangolo/uvicorn-gunicorn-fastapi:python3.10-slim as production

#
WORKDIR /code
COPY ./code /code

#
COPY --from=requirements-stage /tmp/requirements.txt /code/requirements.txt

#
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Устанавливаем выполняемую при запуске контейнера команду по умолчанию

ENV PYTHONPATH=/code

RUN chmod +x run.sh
CMD  ["./run.sh"]

