FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml poetry.lock* ./

RUN pip install poetry \
    && poetry config virtualenvs.create false \
    && poetry install --without dev --no-root --no-interaction --no-ansi

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate --fake-initial && gunicorn core.wsgi:application --bind 0.0.0.0:8000"]