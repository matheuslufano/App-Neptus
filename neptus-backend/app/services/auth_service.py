from itsdangerous import URLSafeTimedSerializer
from sqlalchemy.orm import Session
from app.config.app_config import APP_CONFIG
from app.exceptions import (UserDisabledError, GoogleLoginRequestError,
                            NotFoundRequestError, InvalidCredentialsError, BadRequestError)
from app.models.usuario_model import Usuario
from app.utils import reset_password, create_token

class AuthService:
    @staticmethod
    def login(db: Session, email: str, senha: str):
        usuario = db.query(Usuario).filter(Usuario.email == email).first()

        if not usuario:
            raise NotFoundRequestError("Usuário não cadastrado")

        if not usuario.esta_ativo:
            raise UserDisabledError("Usuário desativado")

        if not usuario.verificar_senha(senha):
            raise InvalidCredentialsError("Email ou senha inválidos")

        return {
            'access_token': create_token.create_token(
                id=usuario.id,
                nome=usuario.nome, 
                email=usuario.email, 
                isAdmin=usuario.e_admin, 
                permissoes=usuario.perfil.permissoes if usuario.perfil else [], 
                perfil=usuario.perfil.nome if usuario.perfil else None
            ),
            'refresh_token': create_token.refresh_token(id=usuario.id),
            'token_type': 'bearer'
        }

    @staticmethod
    def recuperar_senha(db: Session, email: str):
        usuario = db.query(Usuario).filter(Usuario.email == email).first()

        s = URLSafeTimedSerializer(APP_CONFIG.RESET_PASSWORD_TOKEN_SECRET)
        token_reset = s.dumps(email, salt=APP_CONFIG.RESET_PASSWORD_TOKEN_SALT)

        if not usuario or not usuario.esta_ativo:
            return "Enviamos um link para redefinir a senha."

        reset_password.enviar_senha(email, token_reset, usuario.nome)
        return "Enviamos um link para redefinir a senha."

    @staticmethod
    def refresh_token(db: Session, user_id: str):
        usuario = db.query(Usuario).filter(Usuario.id == int(user_id)).first()
        if not usuario:
            raise NotFoundRequestError("Usuário nao encontrado")
        if not usuario.esta_ativo:
            raise UserDisabledError("Usuário desativado")
            
        refresh_token = create_token.create_token(
            usuario.id, 
            usuario.nome, 
            usuario.e_admin, 
            usuario.perfil.permissoes if usuario.perfil else [],
            usuario.perfil.nome if usuario.perfil else None, 
            usuario.email
        )
        return refresh_token

    @staticmethod
    def resetar_senha(db: Session, token_reset: str, senha: str):
        s = URLSafeTimedSerializer(APP_CONFIG.RESET_PASSWORD_TOKEN_SECRET)
        try:
            email = s.loads(token_reset, salt=APP_CONFIG.RESET_PASSWORD_TOKEN_SALT, max_age=3600)
        except Exception:
            raise BadRequestError("Token inválido ou expirado")
            
        usuario = db.query(Usuario).filter(Usuario.email == email).first()
        if not usuario:
            raise NotFoundRequestError("E-mail nao encontrado")
        if not usuario.esta_ativo:
            raise UserDisabledError("Usuário desativado")
        
        # Check if attribute exists (might be missing in some models)
        if hasattr(usuario, 'google_login') and usuario.google_login:
            raise GoogleLoginRequestError("Usuário cadastrado via Google")
            
        usuario.set_senha(senha)
        db.commit()
        return "Senha redefinida com sucesso!"
