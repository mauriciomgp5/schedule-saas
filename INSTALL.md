# Guia de Instalação - Sistema SAAS de Agendamento

## Pré-requisitos

- PHP 8.2 ou superior
- Composer
- Node.js 18+ e npm
- MySQL 8.0 ou superior
- (Opcional) Docker e Docker Compose

## Instalação do Backend (Laravel 12)

1. Entre no diretório do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
composer install
```

3. Configure o arquivo `.env`:
```bash
cp .env.example .env
php artisan key:generate
```

4. Configure as variáveis de ambiente no `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=booking_system
DB_USERNAME=root
DB_PASSWORD=sua_senha
```

5. Execute as migrations:
```bash
php artisan migrate
```

6. Crie o link simbólico para storage:
```bash
php artisan storage:link
```

7. Inicie o servidor:
```bash
php artisan serve
```

O backend estará disponível em `http://localhost:8000`

## Instalação do Frontend (React + TypeScript)

1. Entre no diretório do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env`:
```bash
cp .env.example .env
```

4. Configure a URL da API no `.env`:
```env
VITE_API_URL=http://localhost:8000/api
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

## Instalação com Docker

1. Na raiz do projeto, execute:
```bash
docker-compose up -d
```

2. Execute as migrations no container do backend:
```bash
docker exec -it booking_backend php artisan migrate
```

3. Crie o link simbólico para storage:
```bash
docker exec -it booking_backend php artisan storage:link
```

## Primeiro Acesso

1. Acesse `http://localhost:3000`
2. Clique em "Registrar"
3. Preencha os dados:
   - Nome do Negócio
   - Domínio (único)
   - Seu Nome
   - Email
   - Senha

4. Após o registro, você será redirecionado para o dashboard

## Estrutura do Projeto

```
booking-system/
├── backend/          # API Laravel 12
├── frontend/         # React + TypeScript
├── docker-compose.yml
└── README.md
```

## Funcionalidades Implementadas

✅ Autenticação (email/senha)
✅ Multi-tenancy (row-level)
✅ Calendário responsivo
✅ CRUD de Agendamentos
✅ CRUD de Serviços
✅ CRUD de Clientes
✅ Sistema de temas personalizáveis
✅ Dashboard com estatísticas

## Próximos Passos

- [ ] Integração com gateway de pagamento (Stripe/PagSeguro)
- [ ] Sistema de notificações por email
- [ ] Lembretes automáticos
- [ ] Relatórios avançados
- [ ] Login social (Google, Facebook)
- [ ] Integração com WhatsApp

## Suporte

Para dúvidas ou problemas, consulte a documentação ou abra uma issue no repositório.

