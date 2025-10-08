# Booking System - Sistema de Agendamento SaaS

Sistema multi-tenant de agendamento de serviços onde clientes podem cadastrar suas lojas, configurar serviços e compartilhar links para seus clientes agendarem.

## 🏗️ Arquitetura

- **Backend**: Laravel 12 (API REST)
- **Frontend**: Next.js 15 (TypeScript + Tailwind CSS)
- **Banco de Dados**: MySQL 8.0
- **Cache/Sessão**: Redis
- **Container**: Docker

## 📁 Estrutura do Projeto

```
booking-system/
├── docker/              # Configurações Docker
│   ├── nginx/          # Configuração Nginx
│   ├── php/            # Dockerfile PHP-FPM
│   └── node/           # Dockerfile Node.js
├── backend/            # Laravel API
├── frontend/           # Next.js App
├── docker-compose.yml  # Orquestração dos containers
├── Makefile           # Comandos facilitadores
└── .env.example       # Variáveis de ambiente
```

## 🚀 Como Começar

### Pré-requisitos

- Docker
- Docker Compose
- Make (opcional, mas recomendado)

### Instalação Rápida

1. **Clone o repositório e entre no diretório**
```bash
cd booking-system
```

2. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

3. **Execute o setup completo** (usando Make)
```bash
make setup
```

Ou manualmente:
```bash
# Subir containers
docker-compose up -d --build

# Aguardar MySQL inicializar (~10s)
sleep 10

# Instalar dependências do Laravel
docker-compose exec php composer install

# Gerar chave da aplicação
docker-compose exec php php artisan key:generate

# Executar migrations
docker-compose exec php php artisan migrate

# Instalar dependências do Next.js
docker-compose exec frontend npm install
```

4. **Acessar aplicação**
- Frontend: http://localhost:3000
- API: http://localhost:8080
- phpMyAdmin: http://localhost:8081

## 🛠️ Comandos Úteis (Makefile)

### Docker
```bash
make up              # Subir containers
make down            # Parar containers
make restart         # Reiniciar containers
make build           # Reconstruir imagens
make logs            # Ver logs de todos os containers
make logs-php        # Ver logs do PHP
make logs-frontend   # Ver logs do Frontend
```

### Shell
```bash
make shell-php       # Acessar shell do container PHP
make shell-node      # Acessar shell do container Node
make shell-mysql     # Acessar MySQL CLI
```

### Laravel
```bash
make migrate         # Executar migrations
make migrate-fresh   # Limpar banco e executar migrations
make seed            # Executar seeders
make fresh           # Limpar banco, migrations e seeders
make test            # Executar testes
make artisan cmd="route:list"  # Executar comando artisan
```

### Limpeza e Otimização
```bash
make clear-cache     # Limpar todos os caches
make optimize        # Otimizar aplicação (cache configs)
make clean           # Remover containers e volumes
```

## 🏗️ Funcionalidades Planejadas

### Backend (Laravel API)
- [ ] Autenticação multi-tipo (clientes, prestadores, admin)
- [ ] Sistema multi-tenant
- [ ] Gestão de lojas/empresas
- [ ] Gestão de serviços e preços
- [ ] Sistema de agendamento com slots de horário
- [ ] Gestão de disponibilidade
- [ ] Sistema de notificações (email, push)
- [ ] Integração com gateways de pagamento
- [ ] Dashboard administrativo
- [ ] Relatórios e analytics

### Frontend Web (Next.js)
- [ ] Portal do cliente (dono da loja)
  - [ ] Cadastro e login
  - [ ] Gestão de serviços
  - [ ] Gestão de horários
  - [ ] Dashboard de agendamentos
  - [ ] Configurações
- [ ] Portal do cliente final
  - [ ] Visualização de serviços disponíveis
  - [ ] Agendamento de serviços
  - [ ] Histórico de agendamentos
- [ ] Landing page pública

## 🔧 Configuração

### Variáveis de Ambiente

#### Raiz (.env)
```env
DB_DATABASE=booking_system
DB_USERNAME=booking
DB_PASSWORD=root
APP_PORT=8080
FRONTEND_PORT=3000
```

#### Backend (backend/.env)
```env
APP_NAME="Booking System"
APP_URL=http://localhost:8080
DB_CONNECTION=mysql
DB_HOST=mysql
DB_DATABASE=booking_system
REDIS_HOST=redis
CACHE_STORE=redis
SESSION_DRIVER=redis
```

#### Frontend (frontend/.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## 🐛 Troubleshooting

### Erro de conexão com MySQL
```bash
# Reiniciar containers
make restart

# Verificar se MySQL está rodando
docker-compose ps

# Ver logs do MySQL
docker-compose logs mysql
```

### Erro de permissão no Laravel
```bash
# Dentro do container PHP
docker-compose exec php chmod -R 777 storage bootstrap/cache
```

### Frontend não carrega
```bash
# Reinstalar dependências
docker-compose exec frontend rm -rf node_modules
docker-compose exec frontend npm install

# Reiniciar container
docker-compose restart frontend
```

## 📝 Próximos Passos

1. Implementar models e migrations para multi-tenancy
2. Criar sistema de autenticação com Laravel Sanctum
3. Implementar CRUD de lojas/empresas
4. Implementar CRUD de serviços
5. Criar sistema de agendamento
6. Desenvolver interfaces do Next.js
7. Implementar notificações
8. Integrar sistema de pagamentos

## 📄 Licença

Este projeto está sob a licença MIT.
