from fastapi import Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.auth import get_current_user
from app.models.usuario_model import Usuario
from app.services.propriedade_service import PropriedadeService
from app.exceptions.app_request_Exception import AppRequestError
from uuid import UUID

def convidar_usuario(
    propriedade_id: UUID = Body(..., embed=True),
    email: str = Body(...),
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """
    Convida um novo usuário para uma propriedade.
    
    Envia um convite por email para que o usuário possa se associar à propriedade especificada.
    """
    try:
        # Note: We need to implement this in PropriedadeService
        return {"mensagem": PropriedadeService.convidar_usuario(db, str(propriedade_id), email, current_user)}
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except AttributeError:
        raise HTTPException(status_code=501, detail="Funcionalidade de convite não implementada no serviço.")

def convite_aceito(
    token_convite: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """
    Processa a aceitação de um convite de propriedade.
    
    Valida o token de convite e associa o usuário à propriedade correspondente.
    """
    try:
        # Note: We need to implement this in PropriedadeService
        return {"mensagem": PropriedadeService.convite_aceito(db, token_convite)}
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except AttributeError:
        raise HTTPException(status_code=501, detail="Funcionalidade de aceite de convite não implementada no serviço.")
