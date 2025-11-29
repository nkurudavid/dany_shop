#!/bin/sh

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Applying database migrations..."
python manage.py migrate --noinput

echo "Starting Gunicorn..."
python -m gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 3
