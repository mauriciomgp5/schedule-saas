FROM php:8.4-fpm

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd intl

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar diretório de trabalho
WORKDIR /var/www/html

# Copiar apenas composer files primeiro
COPY composer.json composer.lock* ./

# Instalar dependências (sem scripts durante build)
RUN composer install --optimize-autoloader --no-scripts --no-interaction || true

# Copiar resto dos arquivos
COPY . .

# Executar scripts do composer agora que os arquivos estão presentes (sem scripts que precisam do artisan)
RUN composer dump-autoload --optimize --no-scripts || true

# Configurar permissões
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage

EXPOSE 8000

# Usar PHP built-in server (o Laravel será configurado depois)
CMD php -S 0.0.0.0:8000 -t public public/index.php

