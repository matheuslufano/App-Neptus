# Sistema de Permissionamento

## Visão Geral

O sistema de permissionamento foi implementado usando Zustand para gerenciar o estado global das permissões do usuário.

## Estrutura

### 1. Store (`/src/stores/propertyStore.ts`)

- Armazena dados do usuário e permissões
- Fornece helpers para verificar permissões
- Persiste no localStorage

### 2. Hooks

#### `usePermissions` (`/src/hooks/usePermissions.ts`)

Hook principal para verificar permissões com shortcuts para operações comuns.

```tsx
import { usePermissions } from "@/hooks/usePermissions";

const { canCreateUser, canEditUser, hasPermission } = usePermissions();

// Verificar permissão específica
if (hasPermission("USUARIO_CRIAR")) {
  // Mostrar botão de criar
}

// Usar shortcuts
if (canCreateUser()) {
  // Mostrar botão de criar
}
```

#### `useInitializeUserData` (`/src/hooks/useInitializeUserData.ts`)

Hook que inicializa os dados do usuário automaticamente. Já está sendo usado no layout autenticado.

### 3. Componente `<Protected>`

Componente para proteger conteúdo baseado em permissões:

```tsx
import { Protected } from "@/components/Protected";

// Verificar uma permissão
<Protected permission="USUARIO_CRIAR">
  <Button>Criar Usuário</Button>
</Protected>

// Verificar qualquer uma das permissões
<Protected anyPermissions={["USUARIO_EDITAR", "USUARIO_CRIAR"]}>
  <Button>Ação</Button>
</Protected>

// Verificar todas as permissões
<Protected allPermissions={["USUARIO_EDITAR", "USUARIO_DETALHAR"]}>
  <Button>Editar</Button>
</Protected>

// Com fallback
<Protected permission="USUARIO_CRIAR" fallback={<p>Sem permissão</p>}>
  <Button>Criar</Button>
</Protected>
```

## Permissões Disponíveis

### Usuário

- `USUARIO_LISTAR` - Listar todos os usuários
- `USUARIO_DETALHAR` - Ver detalhes de um usuário
- `USUARIO_CRIAR` - Criar novo usuário
- `USUARIO_EDITAR` - Editar usuário (requer também USUARIO_DETALHAR)
- `USUARIO_STATUS` - Habilitar/Desabilitar usuário

### Perfil

- `PERFIL_LISTAR` - Listar todos os perfis
- `PERFIL_DETALHAR` - Ver detalhes de um perfil
- `PERFIL_CRIAR` - Criar novo perfil
- `PERFIL_EDITAR` - Editar perfil (requer também PERFIL_DETALHAR)
- `PERFIL_EXCLUIR` - Excluir perfil

### Propriedade

- `PROPRIEDADE_LISTAR` - Listar todas as propriedades
- `PROPRIEDADE_DETALHAR` - Ver detalhes de uma propriedade
- `PROPRIEDADE_CRIAR` - Criar nova propriedade
- `PROPRIEDADE_EDITAR` - Editar propriedade (requer também PROPRIEDADE_DETALHAR)
- `PROPRIEDADE_EXCLUIR` - Excluir propriedade

### Tanque

- `TANQUE_LISTAR` - Listar todos os tanques
- `TANQUE_DETALHAR` - Ver detalhes de um tanque
- `TANQUE_CRIAR` - Criar novo tanque
- `TANQUE_EDITAR` - Editar tanque (requer também TANQUE_DETALHAR)
- `TANQUE_EXCLUIR` - Excluir tanque

### Sensor

- `SENSOR_LISTAR` - Listar todos os sensores
- `SENSOR_DETALHAR` - Ver detalhes de um sensor
- `SENSOR_CRIAR` - Criar novo sensor
- `SENSOR_EDITAR` - Editar sensor (requer também SENSOR_DETALHAR)
- `SENSOR_EXCLUIR` - Excluir sensor

### Leitura

- `LEITURA_LISTAR` - Listar todas as leituras
- `LEITURA_DETALHAR` - Ver detalhes de uma leitura
- `LEITURA_POR_TANQUE` - Listar leituras por tanque
- `LEITURA_POR_SENSOR` - Listar leituras por sensor
- `LEITURA_CRIAR` - Criar nova leitura
- `LEITURA_EXCLUIR` - Excluir leitura

## Exemplos de Uso

### Proteger uma página inteira

```tsx
"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const UsuariosPage = () => {
  const { canListUsers } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (!canListUsers()) {
      router.push("/");
    }
  }, [canListUsers, router]);

  if (!canListUsers()) {
    return <div>Sem permissão</div>;
  }

  return <div>{/* Conteúdo da página */}</div>;
};
```

### Proteger botões e ações

```tsx
import { Protected } from "@/components/Protected";
import { usePermissions } from "@/hooks/usePermissions";

const UserList = () => {
  const { canCreateUser, canEditUser } = usePermissions();

  return (
    <div>
      <Protected permission="USUARIO_CRIAR">
        <Button onClick={handleCreate}>Criar Usuário</Button>
      </Protected>

      {users.map((user) => (
        <div key={user.id}>
          {user.nome}
          <Protected allPermissions={["USUARIO_EDITAR", "USUARIO_DETALHAR"]}>
            <Button onClick={() => handleEdit(user.id)}>Editar</Button>
          </Protected>
        </div>
      ))}
    </div>
  );
};
```

### Proteger links de navegação

```tsx
import { Protected } from "@/components/Protected";

const NavBar = () => {
  return (
    <nav>
      <Protected permission="USUARIO_LISTAR">
        <NavLink href="/usuarios">Usuários</NavLink>
      </Protected>

      <Protected permission="PERFIL_LISTAR">
        <NavLink href="/perfis">Perfis</NavLink>
      </Protected>

      <Protected permission="PROPRIEDADE_LISTAR">
        <NavLink href="/propriedades">Propriedades</NavLink>
      </Protected>
    </nav>
  );
};
```

## Fluxo de Inicialização

1. Usuário faz login e recebe JWT
2. `UserDataInitializer` é montado no layout autenticado
3. Hook `useInitializeUserData` extrai o ID do usuário do JWT
4. Busca dados do usuário via `GET /v1/super/usuarios/<id>`
5. Busca perfil do usuário via `GET /v1/super/perfis/<perfil_id>`
6. Armazena dados e permissões no Zustand store
7. Permissões ficam disponíveis globalmente via `usePermissions`

## Observações

- As permissões são normalizadas para UPPERCASE para comparação
- A API pode retornar permissões em lowercase (ex: `tanque_listar`)
- O sistema converte automaticamente para comparação
- Os dados são persistidos no localStorage
- Ao fazer logout, chame `clearUserData()` do store
