# Sistema SAAS de Agendamento de Serviços

Sistema SAAS multi-tenant para agendamento de serviços (barbearias, técnicos, manicures, etc.) com frontend React + TypeScript e backend Laravel 12 (API).

## Estrutura do Projeto

```
booking-system/
├── backend/              # Laravel 12 API
├── frontend/             # React + TypeScript
└── docker-compose.yml    # Configuração Docker
```

## Tecnologias

### Backend
- Laravel 12
- Laravel Sanctum (autenticação)
- Laravel Socialite (login social)
- Spatie Laravel Multitenancy (multi-tenancy)
- Laravel Cashier (pagamentos)

### Frontend
- React 18+ com TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- FullCalendar
- Tailwind CSS
- Shadcn/ui
- React Hook Form
- Zod

## Instalação

### Pré-requisitos
- PHP 8.2+
- Composer
- Node.js 18+
- Docker e Docker Compose (opcional)

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker-compose up -d
```

## Funcionalidades

- ✅ Autenticação (email/senha + social)
- ✅ Multi-tenancy
- ✅ Calendário responsivo
- ✅ Gestão de agendamentos
- ✅ Gestão de serviços
- ✅ Gestão de clientes
- ✅ Sistema de temas personalizáveis
- ✅ Sistema de pagamentos
- ✅ Notificações e lembretes
- ✅ Relatórios

## Licença

Proprietário

