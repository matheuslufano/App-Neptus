from fastapi import Depends, HTTPException, status, Body, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import AuthService
from app.services.usuario_service import UsuarioService
from app.schemas.autenticacao_schema import LoginRequest, ResetPasswordRequest, ResetPasswordConfirm
from app.exceptions.app_request_Exception import AppRequestError

def register(data: dict, db: Session = Depends(get_db)):
    """
    Registra um novo usuário no sistema.
    
    Este endpoint cria uma nova conta de usuário com o nome, email e senha fornecidos.
    """
    try:
        return UsuarioService.registrar_usuario(db, **data)
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

async def login(
    request: Request,
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends() # This line enables the Swagger UI form
):
    """
    Autentica um usuário e retorna os tokens de acesso.
    
    Suporta JSON (frontend) e Form Data (Swagger UI Authorize).
    """
    try:
        content_type = request.headers.get("content-type", "")
        
        # If it's a form (from Swagger Authorize)
        if "application/x-www-form-urlencoded" in content_type:
            email = form_data.username
            senha = form_data.password
        else:
            # If it's JSON (from frontend or Swagger Try it out)
            data = await request.json()
            email = data.get("email")
            senha = data.get("senha")

        if not email or not senha:
            raise HTTPException(status_code=400, detail="Email e senha são obrigatórios")
            
        return AuthService.login(db, email, senha)
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Dados de login invalidos: {str(e)}")

def refresh_token(refresh_token: str = Body(..., embed=True)):
    """
    Gera um novo access_token usando um refresh_token válido.
    
    Permite que o usuário continue autenticado sem precisar fazer login novamente
    enquanto o refresh_token for válido.
    """
    try:
        return AuthService.refresh_token(refresh_token)
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def reset_password_request(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Solicita um link para recuperação de senha.
    
    Envia um email para o usuário com um token seguro para que ele possa redefinir sua senha.
    """
    try:
        return {"mensagem": AuthService.solicitar_recuperacao_senha(db, data.email)}
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def reset_password(data: ResetPasswordConfirm, db: Session = Depends(get_db)):
    """
    Redefine a senha do usuário usando o token de recuperação.
    
    Valida o token enviado por email e atualiza a senha do usuário no banco de dados.
    """
    try:
        return {"mensagem": AuthService.resetar_senha(db, data.token, data.nova_senha)}
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def authorize_google(token: str = Body(..., embed=True), db: Session = Depends(get_db)):
    """
    Realiza o login ou registro através de uma conta Google.
    
    Valida o token do Google e autentica o usuário no sistema.
    """
    try:
        return AuthService.google_login(db, token)
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
