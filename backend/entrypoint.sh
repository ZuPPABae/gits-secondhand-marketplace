#!/bin/sh
set -e

# Copy .env if not exists
if [ ! -f /var/www/.env ]; then
    cp /var/www/.env.example /var/www/.env
fi

# Ensure storage directories exist and permissions are set
mkdir -p /var/www/storage/framework/cache/data \
         /var/www/storage/framework/sessions \
         /var/www/storage/framework/views \
         /var/www/storage/logs \
         /var/www/storage/app/public \
         /var/www/bootstrap/cache
chmod -R 777 /var/www/storage /var/www/bootstrap/cache 2>/dev/null || true

# Generate app key if not set
if grep -q "APP_KEY=$" /var/www/.env || grep -q "APP_KEY=\"\"" /var/www/.env; then
    php artisan key:generate --force --quiet
fi

# Create storage link (ignore if already exists)
php artisan storage:link --quiet 2>/dev/null || true

# Run migrations (--force skips the production check)
echo "Running migrations..."
php artisan migrate --force --no-interaction

echo "Starting Laravel server on 0.0.0.0:8000..."
exec php artisan serve --host=0.0.0.0 --port=8000
