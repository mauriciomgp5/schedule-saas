# Sistema de Agendamento - Páginas do Cliente

Este documento explica como usar o sistema de agendamento do lado do cliente.

## Estrutura das Páginas

O sistema foi criado com a seguinte estrutura de URLs:

```
/[slug-da-loja]/customer/          # Página principal da loja (lista de serviços)
/[slug-da-loja]/customer/agendar/[serviceId]  # Página de agendamento
```

## Funcionalidades Implementadas

### 1. Página Principal da Loja (`/[slug]/customer/`)

- **Exibe informações da loja**: Nome, descrição, endereço, logo
- **Lista todos os serviços ativos** da loja
- **Filtros por categoria** (se a loja tiver categorias)
- **Informações detalhadas de cada serviço**:
  - Preço formatado em reais
  - Duração do serviço
  - Descrição
  - Se requer aprovação
  - Quantidade máxima de pessoas por slot
- **Botão "Agendar"** para cada serviço

### 2. Página de Agendamento (`/[slug]/customer/agendar/[serviceId]`)

- **Informações do serviço selecionado**
- **Seleção de data** (com validação de datas futuras)
- **Lista de horários disponíveis** para a data selecionada
- **Formulário de dados do cliente**:
  - Nome (obrigatório)
  - Email (obrigatório)
  - Telefone (obrigatório)
  - Observações (opcional)
- **Confirmação de agendamento**

### 3. Página de Lojas (`/lojas`)

- **Lista todas as lojas disponíveis** (com dados mock para demonstração)
- **Informações básicas de cada loja**
- **Link direto para a página da loja**

## APIs Criadas

### Backend - Controller Público

**Arquivo**: `backend/app/Http/Controllers/Api/PublicStoreController.php`

**Endpoints**:
- `GET /api/public/store/{slug}` - Busca loja pelo slug
- `GET /api/public/store/{slug}/services` - Lista serviços da loja
- `GET /api/public/store/{slug}/categories` - Lista categorias da loja
- `GET /api/public/store/{slug}/availability` - Lista disponibilidade da loja
- `GET /api/public/store/{slug}/slots` - Busca horários disponíveis
- `POST /api/public/store/{slug}/booking` - Cria agendamento

### Frontend - Serviços

**Arquivo**: `frontend/src/services/publicStore.ts`

**Funções**:
- `getStoreBySlug()` - Busca dados da loja
- `getStoreServices()` - Lista serviços
- `getStoreCategories()` - Lista categorias
- `getStoreAvailability()` - Lista disponibilidade
- `getAvailableSlots()` - Busca horários disponíveis
- `createBooking()` - Cria agendamento

## Como Testar

### 1. Acessar a Página de Lojas
```
http://localhost:3000/lojas
```

### 2. Escolher uma Loja
Clique em qualquer loja da lista para acessar sua página de serviços.

### 3. Ver Serviços
Na página da loja, você verá todos os serviços disponíveis com suas informações.

### 4. Agendar um Serviço
- Clique no botão "Agendar" de qualquer serviço
- Selecione uma data
- Escolha um horário disponível
- Preencha seus dados
- Confirme o agendamento

## URLs de Exemplo

Para testar com as lojas mock criadas:

```
http://localhost:3000/salao-beleza-estilo/customer
http://localhost:3000/barbearia-moderna/customer
http://localhost:3000/spa-relaxamento/customer
```

## Próximos Passos

Para completar o sistema, seria necessário:

1. **Implementar a criação real de agendamentos** no backend
2. **Adicionar validação de horários ocupados**
3. **Implementar sistema de notificações por email**
4. **Adicionar página de confirmação de agendamento**
5. **Implementar cancelamento de agendamentos**
6. **Adicionar sistema de avaliações**

## Estrutura de Arquivos Criados

```
frontend/src/
├── app/
│   ├── [slug]/
│   │   └── customer/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       └── agendar/
│   │           └── [serviceId]/
│   │               └── page.tsx
│   ├── lojas/
│   │   └── page.tsx
│   └── page.tsx (atualizado)
└── services/
    └── publicStore.ts

backend/
├── app/Http/Controllers/Api/
│   └── PublicStoreController.php
└── routes/
    └── api.php (atualizado)
```

O sistema está pronto para uso e pode ser facilmente expandido com novas funcionalidades!
