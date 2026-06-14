# Neptus - Monitoramento de Qualidade da Água

Bem-vindo ao projeto Neptus! Este arquivo `README.md` foi criado para ajudar novos desenvolvedores, especialmente iniciantes, a entenderem a estrutura, o funcionamento e como contribuir para este projeto.

## LINKS PARA DOCUMENTAÇÃO:

--> Pasta oficial:
https://drive.google.com/drive/folders/12EKN4DHmBUNjuJaS16_m3EJzdG5v6y5W?usp=sharing

--> Documento oficial:
https://docs.google.com/document/d/1OXCb044vwiNlX4TdmWPa-_DmhldYowfD/edit?usp=sharing&ouid=114566353487533288875&rtpof=true&sd=true

--> Link para o protótipo no Figma:
https://www.figma.com/design/BMLCsWKwIqm7CJOwbDVQta/Neptus?node-id=73-664&t=Xxj3lAQflCjpCBvC-1

--> Link para variaveis de ambiente:
https://drive.google.com/drive/folders/1Cc_G9vHfJG7V4LQOiA9A6NgQXxUb2CdH?usp=sharing

## 🌊 O Que é o Neptus?

O Neptus é uma aplicação web moderna desenvolvida para monitorar a qualidade da água em tanques de peixes. Ele se comunica com sensores (como o ESP32) para coletar dados em tempo real sobre parâmetros cruciais como turbidez, temperatura, pH, e oxigênio dissolvido.

### Objetivos Principais:

- **Monitoramento em Tempo Real:** Visualização instantânea dos dados coletados.
- **Offline-First:** Funciona mesmo sem conexão com a internet, sincronizando dados assim que a conexão é restabelecida.
- **Interface Intuitiva:** Design limpo e fácil de usar, focado na experiência do usuário.

## 🛠️ Tecnologias Utilizadas

Este projeto utiliza uma stack moderna e robusta. Aqui está o que você precisa saber:

- **[Next.js 14](https://nextjs.org/):** O framework React principal. Utilizamos o **App Router** para gerenciamento de rotas e layouts.
- **[TypeScript](https://www.typescriptlang.org/):** Adiciona tipagem estática ao JavaScript, tornando o código mais seguro e fácil de manter.
- **[Tailwind CSS](https://tailwindcss.com/):** Framework de CSS utilitário para estilização rápida e responsiva.
- **[shadcn/ui](https://ui.shadcn.com/):** Coleção de componentes de UI reutilizáveis e acessíveis.
- **[Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction):** Biblioteca pequena e rápida para gerenciamento de estado global.
- **[TanStack Query (React Query)](https://tanstack.com/query/latest):** Para busca, cache e sincronização de dados do servidor.
- **[PWA (Progressive Web App)](https://web.dev/progressive-web-apps/):** Permite que o site seja instalado como um aplicativo nativo e funcione offline.
- **[Zod](https://zod.dev/):** Para validação de dados e esquemas.

## 📂 Estrutura de Pastas Explicada

Entender onde as coisas estão é o primeiro passo. Aqui está um mapa do projeto:

```
src/
├── app/                          # O coração da aplicação (App Router)
│   ├── (authenticated)/          # Páginas que exigem login (Dashboard, Histórico)
│   ├── (public)/                 # Páginas públicas (Login, Cadastro)
│   ├── api/                      # Rotas da API (Backend for Frontend)
│   └── layout.tsx                # O layout principal que envolve toda a aplicação
├── components/                   # Blocos de construção da UI
│   ├── ui/                       # Componentes básicos (Botões, Inputs) do shadcn
│   ├── forms/                    # Formulários completos (Login, Cadastro)
│   └── ...                       # Componentes específicos (Gráficos, Cards)
├── audh/                         # Configurações de autenticação e provedores
├── hooks/                        # Lógica reutilizável (Custom Hooks)
│   ├── useSensorData.ts          # Lógica para lidar com dados dos sensores
│   └── ...
├── lib/                          # Configurações de bibliotecas e utilitários
│   ├── axios.ts                  # Cliente HTTP configurado
│   └── utils.ts                  # Funções auxiliares gerais
├── services/                     # Comunicação com APIs externas e serviços
│   ├── auth-service.ts           # Serviços de autenticação
│   └── bluetooth-service.ts      # Lógica de conexão Bluetooth com ESP32
├── stores/                       # Estado global da aplicação (Zustand)
│   ├── offlineDataStore.ts       # Armazena dados quando offline
│   └── ...
└── types/                        # Definições de tipos TypeScript globais
```

## 🚀 Como Rodar o Projeto

Siga estes passos para ter o projeto rodando na sua máquina:

1.  **Pré-requisitos:**
    - Tenha o [Node.js](https://nodejs.org/) instalado (versão 18 ou superior).
    - Um gerenciador de pacotes (`npm`, `yarn` ou `pnpm`).

2.  **Instalação:**

    ```bash
    # Clone este repositório
    git clone <url-do-repositorio>

    # Entre na pasta
    cd neptus

    # Instale as dependências
    npm install
    # ou yarn install
    ```

3.  **Configuração:**
    - Crie um arquivo `.env.local` na raiz do projeto basedo no `.env.example`.
    - Preencha as variáveis de ambiente necessárias (banco de dados, autenticação, etc.).

4.  **Rodando:**

    ```bash
    npm run dev
    # ou yarn dev
    ```

    - Acesse `http://localhost:3000` no seu navegador.

## 🧠 Fluxos Importantes

### 1. Autenticação e Rotas Protegidas

O projeto separa rotas públicas de rotas autenticadas.

- **Middleware de Proteção:** Verifica se o usuário tem um token válido. Se não, redireciona para o login.
- **AuthContext:** Mantém o estado do usuário logado acessível em toda a aplicação.

### 2. Sincronização Offline (Offline-First)

Uma das partes mais complexas e importantes.

- **Detecção de Conexão:** O hook `useInternetConnection` monitora se o usuário está online ou offline.
- **Armazenamento Local:** Se offline, os dados (como novas medições) são salvos no `localStorage` ou `IndexedDB` através do `offlineDataStore`.
- **Sincronização:** Assim que a conexão volta, o `DataSyncManager` envia os dados pendentes para o servidor automaticamente.

### 3. Integração com Hardware (ESP32)

- **Bluetooth Web API:** O navegador se conecta diretamente ao ESP32 via Bluetooth.
- **Leitura de Dados:** O serviço `bluetooth-service.ts` gerencia a conexão e a leitura das características GATT do dispositivo para obter os valores dos sensores.

## � Copilot de Inteligência Artificial (Skill)

Este projeto possui uma Skill própria de Inteligência Artificial para guiar o desenvolvimento e manter a arquitetura no padrão correto, chamada **`neptus-pwa-copilot`**.

Ela atua como um Engenheiro Frontend Sênior e Arquiteto de Software específico para este projeto, validando suas lógicas de PWA (Next.js), Sincronização e Web Bluetooth.

**Como usá-la:**
Se você possui a CLI de IA acoplada a este repositório, basta invocá-la antes ou durante suas tarefas.

**Exemplo de uso:**

> "Use a skill @[.agent/skills/neptus-pwa-copilot] e revise o hook `useSensorData.ts` que acabei de modificar. Procure por código não utilizado, falta de tipagem e garanta que as boas práticas de hooks do React foram cumpridas."

## �🤝 Contribuindo

1.  Crie uma branch para sua feature (`git checkout -b feature/minha-feature`).
2.  Commit suas mudanças (`git commit -m 'Adiciona funcionalidade X'`).
3.  Push para a branch (`git push origin feature/minha-feature`).
4.  Abra um Pull Request.

---

**Dica para Iniciantes:** Se sentir perdido, comece explorando a pasta `src/components`. Tente mudar a cor de um botão ou texto para ver como o Hot Reload funciona e como o Tailwind CSS é aplicado. Boa sorte!
