FROM php:8.3-fpm

# Argumentos
ARG user=booking
ARG uid=1000

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar extensões PHP
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Instalar Redis
RUN pecl install redis && docker-php-ext-enable redis

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Criar usuário do sistema
RUN useradd -G www-data,root -u $uid -d /home/$user -m $user && \
    mkdir -p /home/$user/.composer && \
    chown -R $user:$user /home/$user

# Configurar diretório de trabalho
WORKDIR /var/www/html

# Trocar para o usuário criado
USER $user
