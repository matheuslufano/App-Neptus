from datetime import timedelta
from app.utils.auth import create_access_token as sign_access_token
from app.utils.auth import create_refresh_token as sign_refresh_token

def create_token(id: str, nome: str, isAdmin: bool, permissoes: list, perfil: str, email: str):
    data = {
        "sub": str(id),
        "nome": nome,
        "email": email,
        "isAdmin": isAdmin,
        "perfil": perfil,
        "permissoes": permissoes
    }
    return sign_access_token(data=data, expires_delta=timedelta(hours=24))
    
def refresh_token(id: str):
    data = {"sub": str(id)}
    return sign_refresh_token(data=data)