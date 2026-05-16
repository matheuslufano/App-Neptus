from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from app.routes import (
    auth_router,
    leitura_router,
    propriedade_router,
    usuario_router,
    perfil_router,
    propriedade_super_router,
    tanque_router,
    audit_router,
)

app = FastAPI(
    title="Neptus API",
    description="Backend para o sistema Neptus - Monitoramento de Aquicultura (OAuth2 Flow)",
    version="2.1.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix="/api")
app.include_router(leitura_router, prefix="/api")
app.include_router(propriedade_router, prefix="/api")
app.include_router(usuario_router, prefix="/api")
app.include_router(perfil_router, prefix="/api")
app.include_router(propriedade_super_router, prefix="/api")
app.include_router(tanque_router, prefix="/api")
app.include_router(audit_router, prefix="/api")

from fastapi.responses import HTMLResponse
from collections import defaultdict

@app.get("/", response_class=HTMLResponse)
async def root():
    # Agrupar rotas por tags para melhor organização (estilo Swagger)
    grouped_routes = defaultdict(list)
    
    for route in app.routes:
        if hasattr(route, "path") and (route.path.startswith("/api") or route.path == "/health"):
            # Tentar pegar a tag da rota, ou usar "Geral"
            tag = "Geral"
            if hasattr(route, "tags") and route.tags:
                tag = route.tags[0]
            elif "/auth" in route.path:
                tag = "Autenticação"
            elif "/usuario" in route.path:
                tag = "Usuários"
            elif "/propriedade" in route.path:
                tag = "Propriedades"
            elif "/leitura" in route.path:
                tag = "Leituras"
            elif "/tanque" in route.path:
                tag = "Tanques"
            elif "/audit" in route.path:
                tag = "Auditoria"
                
            methods = list(route.methods) if hasattr(route, "methods") else []
            description = getattr(route, "summary", "") or getattr(route, "description", "") or "Sem descrição"
            
            grouped_routes[tag].append({
                "methods": methods,
                "path": route.path,
                "description": description
            })

    # Gerar o HTML das tabelas por grupo
    sections_html = ""
    for tag, routes in grouped_routes.items():
        rows = ""
        for r in routes:
            methods_badges = "".join([f'<span class="method-badge {m.lower()}">{m}</span>' for m in r["methods"]])
            rows += f"""
                <tr>
                    <td class="col-method">{methods_badges}</td>
                    <td class="col-path"><code>{r["path"]}</code></td>
                    <td class="col-desc">{r["description"]}</td>
                </tr>
            """
        
        sections_html += f"""
            <div class="section">
                <h2 class="section-title">{tag}</h2>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Método</th>
                                <th>Caminho</th>
                                <th>Descrição</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows}
                        </tbody>
                    </table>
                </div>
            </div>
        """

    html_content = f"""
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="Documentação técnica da Neptus API para consumo humano e por IAs.">
        <title>Neptus API | Documentação Técnica</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
        <style>
            :root {{
                --bg: #ffffff;
                --text: #1a202c;
                --text-muted: #4a5568;
                --border: #e2e8f0;
                --primary: #3182ce;
                --get: #2f855a;
                --post: #2b6cb0;
                --put: #975a16;
                --delete: #c53030;
                --code-bg: #f7fafc;
            }}

            body {{
                font-family: 'Inter', sans-serif;
                background: var(--bg);
                color: var(--text);
                line-height: 1.5;
                margin: 0;
                padding: 40px 20px;
            }}

            .container {{
                max-width: 1000px;
                margin: 0 auto;
            }}

            header {{
                border-bottom: 2px solid var(--border);
                padding-bottom: 20px;
                margin-bottom: 40px;
            }}

            h1 {{
                font-size: 2.5rem;
                font-weight: 700;
                margin: 0;
                color: var(--primary);
            }}

            .api-info {{
                color: var(--text-muted);
                font-size: 1.1rem;
                margin-top: 10px;
            }}

            .swagger-link {{
                display: inline-block;
                margin-top: 20px;
                padding: 10px 20px;
                background: var(--primary);
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
            }}

            .section {{
                margin-bottom: 40px;
            }}

            .section-title {{
                font-size: 1.5rem;
                border-left: 4px solid var(--primary);
                padding-left: 15px;
                margin-bottom: 20px;
                color: var(--text);
            }}

            .table-container {{
                overflow-x: auto;
                border: 1px solid var(--border);
                border-radius: 8px;
            }}

            table {{
                width: 100%;
                border-collapse: collapse;
                text-align: left;
                font-size: 0.95rem;
            }}

            th {{
                background: #f8fafc;
                padding: 12px 16px;
                font-weight: 600;
                border-bottom: 2px solid var(--border);
            }}

            td {{
                padding: 12px 16px;
                border-bottom: 1px solid var(--border);
                vertical-align: middle;
            }}

            code {{
                font-family: 'JetBrains Mono', monospace;
                background: var(--code-bg);
                padding: 2px 6px;
                border-radius: 4px;
                color: #e53e3e;
            }}

            .method-badge {{
                font-size: 0.75rem;
                font-weight: 700;
                padding: 4px 8px;
                border-radius: 4px;
                color: white;
                margin-right: 4px;
            }}

            .method-badge.get {{ background: var(--get); }}
            .method-badge.post {{ background: var(--post); }}
            .method-badge.put {{ background: var(--put); }}
            .method-badge.delete {{ background: var(--delete); }}

            .col-method {{ width: 120px; }}
            .col-path {{ width: 300px; }}

            footer {{
                margin-top: 60px;
                text-align: center;
                color: var(--text-muted);
                font-size: 0.9rem;
                border-top: 1px solid var(--border);
                padding-top: 20px;
            }}

            /* Estilo para IAs: JSON oculto com estrutura de dados */
            #ai-data {{ display: none; }}
        </style>
    </head>
    <body>
        <div class="container">
            <header>
                <h1>Neptus API Specification</h1>
                <div class="api-info">Versão 2.1.0 • Backend de Monitoramento de Aquicultura</div>
                <p>Esta página fornece uma visão geral estruturada dos endpoints da API, otimizada para legibilidade humana e processamento automatizado.</p>
                <a href="/docs" class="swagger-link">Acessar Swagger UI Interativo</a>
            </header>

            <main>
                {sections_html}
            </main>

            <footer>
                © 2026 Neptus System • Gerado automaticamente por FastAPI
            </footer>

            <!-- Bloco de dados estruturados para leitura por outras IAs -->
            <script id="ai-data" type="application/json">
                {{
                    "api_name": "Neptus API",
                    "version": "2.1.0",
                    "base_url": "/",
                    "swagger_path": "/docs",
                    "groups": {grouped_routes}
                }}
            </script>
        </div>
    </body>
    </html>
    """
    return html_content



@app.get("/health")
async def health_check():
    return {"status": "ok", "framework": "FastAPI"}
