FROM python:3.10

ENV PYTHONDONTWRITEBYTECODE 1

WORKDIR /code/
COPY ./code /code

RUN curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/master/install-poetry.py | \
    POETRY_HOME=/opt/poetry python && \
    cd /usr/local/bin && \
    ln -s /opt/poetry/bin/poetry && \
    poetry config virtualenvs.create false
RUN bash -c "poetry install --no-root --no-dev"

ENV PYTHONPATH=/code

RUN chmod +x run.sh
CMD  ["./run.sh"]
