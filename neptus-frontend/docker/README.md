# 🐳 Imagem Docker


> ℹ️ **_INFORMAÇÃO_**  
> Existem 2 arquivos de Dockerfile:
>
> **BuildDockerfile** - A Imagem a ser criada faz um build do projeto, transformando o projeto em questão para conteúdos estáticos (HTML, CSS e JS). NÃO RECOMENDADO utilizá-la para o desenvolvimento!
> 
> **Dockerfile** - A Imagem RECOMENDADA para ambiente de desenvolvimento.

## 📝 Pré-Requisitos - 

### 👨‍💻 - DESENVOLVIMENTO LOCAL:

1 - Crie o arquivo `.env` dentro do diretório `docker`. Para facilitar você pode copiar o arquivo de exemplo `.env.example`:

```
├── docker
│   ├── .env
│   ├── .env.example
│   ├── BuildDockerfile
│   ├── Dockerfile
│   └── ...
└── public
└── src
└── ...
```

2 - Após isso, para montar e subir o container acesse a pasta `docker/`e então rode o comando:

```bash
docker compose --profile dev up -d --build 

# re-buildar a imagem forçadamente:
docker compose --profile dev up -d --build  --force-recreate
```

Liste os containers em execução:
```
$ docker container ls

CONTAINER ID   IMAGE                        COMMAND                  CREATED         STATUS         PORTS                                         NAMES
3e436630d0b2   frontend-neptus-dev:v1.0.0   "docker-entrypoint.s…"   2 minutes ago   Up 2 minutes   0.0.0.0:3000->3000/tcp, [::]:3000->3000/tcp   frontend-neptus-frontend-neptus-dev-1

```

🌐 Agora abra a aplicação: [http://localhost:3000](http://localhost:3000) 


> ☢️ [!EXCLUIR]
> Para excluir a imagem e o container criado:
> ``` 
> docker compose --profile dev down 
> ```
>


---

### 🛠️ BUILD > PARA PRODUÇÃO (TRANSFORMAR ARQUIVOS ESTÁTICOS)

1 - Crie o arquivo `.env` dentro do diretório `docker`. Para facilitar você pode copiar o arquivo de exemplo `.env.example`:

```
├── docker
│   ├── .env
│   ├── .env.example
│   ├── BuildDockerfile
│   ├── Dockerfile
│   └── ...
└── public
└── src
└── ...
```

2 - Após isso, para montar e subir o container acesse a pasta `docker/`e então rode o comando:

```bash
docker compose --profile build up -d --build
# re-buildar a imagem forçadamente:
docker compose --profile build up -d --build --force-recreate
```


🌐 Agora abra a aplicação: [http://localhost](http://localhost) e/ou [https://localhost](https://localhost)



> ☢️ [!EXCLUIR]
> Para excluir a imagem e o container criado:
> ``` 
> docker compose --profile build down 
> ```
>
