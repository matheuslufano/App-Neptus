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

@app.get("/", response_class=HTMLResponse)
async def root():
    # Coletar informações das rotas para exibir na página
    routes_info = []
    for route in app.routes:
        if hasattr(route, "path") and (route.path.startswith("/api") or route.path == "/health"):
            methods = list(route.methods) if hasattr(route, "methods") else []
            methods_str = ", ".join(methods)
            # Simplificar métodos para exibição
            if "GET" in methods and "POST" in methods:
                methods_str = "GET/POST"
            elif "GET" in methods:
                methods_str = "GET"
            elif "POST" in methods:
                methods_str = "POST"
                
            routes_info.append(f"""
                <div class="route-card">
                    <span class="method {methods_str.lower().replace('/', '-')}">{methods_str}</span>
                    <span class="path">{route.path}</span>
                </div>
            """)
    
    routes_html = "".join(routes_info)

    html_content = f"""
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Neptus API | Dashboard</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap" rel="stylesheet">
        <style>
            :root {{
                --bg: #0f172a;
                --card-bg: rgba(30, 41, 59, 0.7);
                --accent: #38bdf8;
                --text: #f8fafc;
                --text-muted: #94a3b8;
                --get: #10b981;
                --post: #3b82f6;
                --put: #f59e0b;
                --delete: #ef4444;
            }}
            
            body {{
                font-family: 'Inter', sans-serif;
                background-color: var(--bg);
                background-image: radial-gradient(circle at top right, #1e293b, #0f172a);
                color: var(--text);
                margin: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                min-height: 100vh;
                padding: 40px 20px;
            }}

            .container {{
                max-width: 900px;
                width: 100%;
                text-align: center;
            }}

            .glass-card {{
                background: var(--card-bg);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 24px;
                padding: 40px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                margin-bottom: 30px;
            }}

            h1 {{
                font-size: 3rem;
                font-weight: 800;
                margin-bottom: 10px;
                background: linear-gradient(to right, #38bdf8, #818cf8);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }}

            p.subtitle {{
                color: var(--text-muted);
                font-size: 1.2rem;
                margin-bottom: 30px;
            }}

            .btn-swagger {{
                display: inline-block;
                background: var(--accent);
                color: #0f172a;
                text-decoration: none;
                padding: 16px 32px;
                border-radius: 12px;
                font-weight: 600;
                font-size: 1.1rem;
                transition: all 0.3s ease;
                box-shadow: 0 10px 15px -3px rgba(56, 189, 248, 0.4);
            }}

            .btn-swagger:hover {{
                transform: translateY(-2px);
                box-shadow: 0 20px 25px -5px rgba(56, 189, 248, 0.5);
                filter: brightness(1.1);
            }}

            .endpoints-grid {{
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 12px;
                text-align: left;
                margin-top: 40px;
            }}

            .route-card {{
                background: rgba(15, 23, 42, 0.5);
                border: 1px solid rgba(255, 255, 255, 0.05);
                padding: 12px 16px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                gap: 12px;
                transition: background 0.2s;
            }}

            .route-card:hover {{
                background: rgba(15, 23, 42, 0.8);
                border-color: rgba(56, 189, 248, 0.3);
            }}

            .method {{
                font-size: 0.7rem;
                font-weight: 800;
                padding: 4px 8px;
                border-radius: 6px;
                text-transform: uppercase;
                min-width: 45px;
                text-align: center;
            }}

            .method.get {{ background: rgba(16, 185, 129, 0.2); color: var(--get); }}
            .method.post {{ background: rgba(59, 130, 246, 0.2); color: var(--post); }}
            .method.get-post {{ background: rgba(139, 92, 246, 0.2); color: #a78bfa; }}
            
            .path {{
                font-family: monospace;
                font-size: 0.9rem;
                color: var(--text-muted);
            }}

            .footer {{
                margin-top: 40px;
                color: var(--text-muted);
                font-size: 0.9rem;
            }}

            .status-badge {{
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: rgba(16, 185, 129, 0.1);
                color: var(--get);
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 600;
                margin-bottom: 20px;
            }}

            .status-dot {{
                width: 8px;
                height: 8px;
                background: var(--get);
                border-radius: 50%;
                box-shadow: 0 0 8px var(--get);
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="glass-card">
                <div class="status-badge">
                    <div class="status-dot"></div>
                    Sistema Online
                </div>
                <h1>Neptus API</h1>
                <p class="subtitle">Backend oficial do sistema de monitoramento de aquicultura. Explore a documentação interativa abaixo.</p>
                
                <a href="/docs" class="btn-swagger">Abrir Documentação Swagger</a>
            </div>

            <h2 style="font-weight: 600; color: var(--text);">Endpoints Disponíveis</h2>
            <div class="endpoints-grid">
                {routes_html}
            </div>

            <div class="footer">
                Neptus &copy; 2026 • v2.1.0 • Desenvolvido com FastAPI
            </div>
        </div>
    </body>
    </html>
    \"\"\"
    return html_content


@app.get("/health")
async def health_check():
    return {"status": "ok", "framework": "FastAPI"}
