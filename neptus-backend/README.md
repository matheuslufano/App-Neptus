# Neptus Backend - Integração Front-end

Este projeto é o backend FastAPI do sistema Neptus. A API expõe rotas para autenticação, propriedades, tanques, leituras, perfis, usuários e auditoria.

## Base URL

Ao rodar localmente com `uvicorn app.main:app --reload`, a base da API é:

`http://localhost:8000/api`

A aplicação também já permite CORS para qualquer origem (`allow_origins=["*"]`).

## Autenticação

### Login

`POST /api/auth/login`

Corpo JSON:

```json
{
  "email": "usuario@exemplo.com",
  "senha": "senha123"
}
```

Resposta esperada:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer"
}
```

### Refresh token

`POST /api/auth/refresh`

Corpo JSON:

```json
{
  "refresh_token": "..."
}
```

### Cabeçalho de autorização

Para chamadas autenticadas, usar:

```
Authorization: Bearer <access_token>
```

## Rotas principais para o front-end

### Autenticação

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/login/google`

> O login suporta JSON para o front-end e também form data para o Swagger UI.

### Convites e propriedade do usuário

- `POST /api/v1/propriedades/usuarios/convites` — enviar convite para usuário se juntar a uma propriedade
- `POST /api/v1/propriedades/usuarios/convites/aceite` — aceitar convite enviado por email

### Leituras

- `GET /api/v1/tanques/{tanque_id}/leituras` — listar leituras de um tanque
- `GET /api/v1/leituras/{leitura_id}` — obter leitura específica
- `POST /api/v1/leituras` — criar nova leitura
- `PUT /api/v1/leituras/{leitura_id}` — atualizar leitura
- `DELETE /api/v1/leituras/{leitura_id}` — deletar leitura

### Rotas administrativas (admin)

As seguintes rotas exigem token válido e permissões de administrador:

#### Propriedades

- `POST /api/v1/super/propriedades`
- `GET /api/v1/super/propriedades`
- `PUT /api/v1/super/propriedades/{id}`
- `GET /api/v1/super/propriedades/{id}`
- `POST /api/v1/super/propriedades/usuarios/adicionar`
- `DELETE /api/v1/super/propriedades/{propriedade_id}/usuarios/{usuario_id}`

#### Perfis

- `POST /api/v1/super/perfis`
- `GET /api/v1/super/perfis`
- `PUT /api/v1/super/perfis/{id}`
- `DELETE /api/v1/super/perfis/{id}`
- `GET /api/v1/super/perfis/{id}`

#### Usuários

- `POST /api/v1/super/usuarios`
- `GET /api/v1/super/usuarios`
- `GET /api/v1/super/usuarios/{id}`
- `PUT /api/v1/super/usuarios/{id}`
- `PATCH /api/v1/super/usuarios/{id}` — alterar status do usuário
- `GET /api/v1/super/usuarios/relatorio`

#### Tanques

- `POST /api/v1/super/tanques`
- `GET /api/v1/super/tanques`
- `GET /api/v1/super/tanques/{id}`
- `PUT /api/v1/super/tanques/{id}`
- `PATCH /api/v1/super/tanques/{id}/status`

#### Auditoria

- `GET /api/v1/super/auditorias`
- `GET /api/v1/super/auditorias/{audit_id}`

#### Filtros de auditoria

A rota de auditoria aceita parâmetros de query:

- `user_id` — filtra por ID do usuário
- `entity_name` — filtra por entidade/tabela
- `operation` — filtra por operação (`create`, `update`, `delete`)
- `start_date` — data inicial (inclusive)
- `end_date` — data final (inclusive)
- `page` — número da página
- `per_page` — itens por página

Exemplo:

`GET /api/v1/super/auditorias?entity_name=Tanque&operation=update&page=1&per_page=20`

## Observações importantes

- O backend usa o prefixo `/api` para todas as rotas.
- A rota de documentação interativa está disponível em `/docs` quando o servidor estiver rodando.
- As rotas do grupo `/v1/super/*` exigem perfil de administrador.
- Use `Content-Type: application/json` para requisições POST/PUT/PATCH.

## Requisitos

As dependências do backend estão em `requirements.txt`.

- `alembic==1.11.1` está presente para migrações do banco.
- `fastapi`, `uvicorn`, `SQLAlchemy`, `psycopg2-binary`, `pydantic`, entre outras, também estão listadas.

## Exemplo de execução

```bash
python -m uvicorn app.main:app --reload
```

Depois disso, o front-end pode usar:

```text
http://localhost:8000/api
```

ou a documentação em:

```text
http://localhost:8000/docs
```
