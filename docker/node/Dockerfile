FROM node:20-alpine

# Instalar dependências básicas
RUN apk add --no-cache git

# Configurar diretório de trabalho
WORKDIR /app

# Expor porta do Next.js
EXPOSE 3000

# Script de entrypoint que instala dependências e inicia o dev server
CMD ["sh", "-c", "chown -R node:node /app && su node -c 'npm install && npm run dev'"]
