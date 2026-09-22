FROM node:22.17.1-alpine3.22 AS base




FROM base AS deps

# Adiciona lib (do C) para compatibilidade devido ao 'musl'
RUN apk add --no-cache libc6-compat
WORKDIR /app

# copiar os arquivos do package.json e package-lock.json
# para baixar e instalar as dependências do projeto
COPY package*.json ./
RUN npm ci 

COPY . .
RUN npm run build




# imagem de produção com todas as configs necessárias
FROM base AS production

# carregando o arquivo .prod.env e criando cada variável de ambiente
# dentro do container
ARG ENV_FILE
COPY ${ENV_FILE} .env

# Limpa comentários e linhas vazias, e carrega cada variável corretamente
RUN sed -e '/^[[:space:]]*#/d' -e '/^[[:space:]]*$/d' .env | \
    while IFS='=' read -r key value; do \
        if [ -n "$key" ]; then \
            # Reconstroi a linha original: KEY=VALOR, mantendo todos os '=' no valor
            echo "$key=$value" >> /etc/environment; \
        fi \
    done


WORKDIR /app

# variável de ambiente informando ao Node que esse é 
# o ambienet de produção
ENV NODE_ENV=production
ENV NEXT_SHARP_PATH="/app/node_modules/sharp"

# criar um grupo e usuário para não rodar a imagem
# como root
RUN addgroup --gid 1001 --system nodejs
RUN adduser --no-create-home --disabled-password --uid 1001 --system -G "nodejs" nextjs

COPY --from=deps /app/public ./public

# permissões necessárias para poder usar corretamente o
# pre-render do Next.js
RUN mkdir .next
RUN chown nextjs:nodejs .next


COPY --from=deps /app/next.config.ts ./
# COPY --from=deps /app/next.config.mjs ./
COPY --from=deps --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=deps --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"


# usar do processo de `standalone` do Next.js para que ele
# não precise utilizar todas as dependências do node_modules
CMD ["node", "server.js"]



