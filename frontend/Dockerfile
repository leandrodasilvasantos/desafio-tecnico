FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json pnpm-lock.yaml ./

# Instalar pnpm e dependências
RUN npm install -g pnpm
RUN pnpm install

# Copiar código da aplicação
COPY . .

# Expor porta
EXPOSE 3000

# Comando padrão para desenvolvimento
CMD ["pnpm", "run", "dev", "--host"]

