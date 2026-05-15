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

@app.get("/")
async def root():
    return RedirectResponse(url="https://docs.neptus.publicvm.com/share/zdm8lrpgbk/p/neptus-documentacao-BVR7NIppdg")

@app.get("/health")
async def health_check():
    return {"status": "ok", "framework": "FastAPI"}
