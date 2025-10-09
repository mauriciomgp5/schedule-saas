# Configuração do Twilio para Autenticação SMS

## 1. Criar conta no Twilio

1. Acesse [https://www.twilio.com](https://www.twilio.com) e crie uma conta
2. Verifique seu número de telefone pessoal
3. Anote seu **Account SID** e **Auth Token** no console do Twilio

## 2. Criar um Verify Service

1. No console do Twilio, vá para **Verify** > **Services**
2. Clique em **Create new Service**
3. Dê um nome para o serviço (ex: "Booking System Verification")
4. Anote o **Service SID** gerado

## 3. Configurar variáveis de ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FROM_NUMBER=+1234567890
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 4. Executar migrations

```bash
cd backend
php artisan migrate
```

## 5. Testar o sistema

1. Acesse a página de agendamento
2. Tente agendar um serviço
3. O modal de autenticação deve aparecer
4. Digite seu telefone e nome
5. Receba o código SMS
6. Digite o código para verificar

## Benefícios do Twilio Verify

- **Segurança**: Códigos são gerados e verificados pelo Twilio
- **Confiabilidade**: Entrega global de SMS
- **Compliance**: Atende regulamentações de telecomunicações
- **Analytics**: Relatórios de entrega e tentativas
- **Rate Limiting**: Proteção contra spam automático

## Troubleshooting

### Erro de conexão
- Verifique se as credenciais do Twilio estão corretas
- Confirme se o Service SID está correto

### SMS não chega
- Verifique se o número está no formato correto (+55 para Brasil)
- Teste com números de telefone verificados na conta Twilio

### Código inválido
- Códigos expiram em 10 minutos
- Verifique se está digitando o código correto
- Tente solicitar um novo código
