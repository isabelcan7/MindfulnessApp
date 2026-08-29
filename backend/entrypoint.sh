#!/bin/sh
set -e

echo "Esperando a la base de datos..."
until python -c "
import os, sys, psycopg
try:
    psycopg.connect(
        dbname=os.environ['DB_NAME'], user=os.environ['DB_USER'],
        password=os.environ['DB_PASSWORD'], host=os.environ['DB_HOST'],
        port=os.environ.get('DB_PORT', '5432'), connect_timeout=3,
    ).close()
except Exception:
    sys.exit(1)
" 2>/dev/null; do
    sleep 1
done

if [ "$DEBUG" != "True" ]; then
    echo "Recolectando ficheros estaticos..."
    python manage.py collectstatic --noinput
fi

echo "Aplicando migraciones..."
python manage.py migrate --noinput

exec "$@"
