.PHONY: help setup up down restart logs shell-php shell-node install-backend install-frontend migrate fresh seed test

# Cores para output
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
WHITE  := $(shell tput -Txterm setaf 7)
RESET  := $(shell tput -Txterm sgr0)

help: ## Mostra esta ajuda
	@echo ''
	@echo 'Uso:'
	@echo '  ${YELLOW}make${RESET} ${GREEN}<target>${RESET}'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} { \
		if (/^[a-zA-Z_-]+:.*?##.*$$/) {printf "    ${YELLOW}%-20s${GREEN}%s${RESET}\n", $$1, $$2} \
		else if (/^## .*$$/) {printf "  ${WHITE}%s${RESET}\n", substr($$1,4)} \
		}' $(MAKEFILE_LIST)

## Setup e Instalação
setup: ## Configuração inicial completa do projeto
	@echo "${GREEN}Copiando arquivo .env...${RESET}"
	@cp .env.example .env
	@echo "${GREEN}Subindo containers...${RESET}"
	@docker-compose up -d --build
	@echo "${GREEN}Aguardando MySQL inicializar...${RESET}"
	@sleep 10
	@echo "${GREEN}Instalando dependências do Laravel...${RESET}"
	@docker-compose exec php composer install
	@echo "${GREEN}Gerando chave da aplicação Laravel...${RESET}"
	@docker-compose exec php php artisan key:generate
	@echo "${GREEN}Executando migrations...${RESET}"
	@docker-compose exec php php artisan migrate
	@echo "${GREEN}Instalando dependências do Next.js...${RESET}"
	@docker-compose exec frontend npm install
	@echo "${GREEN}Setup completo!${RESET}"

install-backend: ## Instala dependências do Laravel
	docker-compose exec php composer install

install-frontend: ## Instala dependências do Next.js
	docker-compose exec frontend npm install

## Docker
up: ## Sobe os containers
	docker-compose up -d

down: ## Para os containers
	docker-compose down

restart: ## Reinicia os containers
	docker-compose restart

build: ## Reconstrói as imagens
	docker-compose up -d --build

logs: ## Mostra logs de todos os containers
	docker-compose logs -f

logs-php: ## Mostra logs do PHP
	docker-compose logs -f php

logs-frontend: ## Mostra logs do Frontend
	docker-compose logs -f frontend

logs-nginx: ## Mostra logs do Nginx
	docker-compose logs -f nginx

## Shell
shell-php: ## Acessa shell do container PHP
	docker-compose exec php bash

shell-node: ## Acessa shell do container Node
	docker-compose exec frontend sh

shell-mysql: ## Acessa shell do MySQL
	docker-compose exec mysql mysql -u booking -proot booking_system

## Laravel
migrate: ## Executa migrations
	docker-compose exec php php artisan migrate

migrate-fresh: ## Limpa banco e executa migrations
	docker-compose exec php php artisan migrate:fresh

seed: ## Executa seeders
	docker-compose exec php php artisan db:seed

fresh: ## Limpa banco, executa migrations e seeders
	docker-compose exec php php artisan migrate:fresh --seed

artisan: ## Executa comando artisan (use: make artisan cmd="route:list")
	docker-compose exec php php artisan $(cmd)

test: ## Executa testes do Laravel
	docker-compose exec php php artisan test

## Limpeza
clear-cache: ## Limpa todos os caches do Laravel
	docker-compose exec php php artisan cache:clear
	docker-compose exec php php artisan config:clear
	docker-compose exec php php artisan route:clear
	docker-compose exec php php artisan view:clear

optimize: ## Otimiza a aplicação
	docker-compose exec php php artisan config:cache
	docker-compose exec php php artisan route:cache
	docker-compose exec php php artisan view:cache

clean: ## Remove containers e volumes
	docker-compose down -v
