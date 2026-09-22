from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.auth import get_current_user
from app.models.usuario_model import Usuario
from app.services.leitura_service import LeituraService
from app.schemas.leitura_schema import Leitura, LeituraCreate, LeituraUpdate
from app.exceptions.app_request_Exception import AppRequestError


def listar_leituras(
    tanque_id: int, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user),
    page: int = 1, 
    per_page: int = 20
):
    """
    Lista todas as leituras de um tanque específico com suporte a paginação.
    
    Retorna uma lista de leituras contendo dados de sensores como turbidez, oxigênio, etc.
    """
    try:
        return LeituraService.listar_todas_leituras(db, tanque_id, page, per_page)
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    
def buscar_leitura(
    leitura_id: int, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """
    Busca os detalhes de uma leitura específica através do seu ID.
    """
    try:
        return LeituraService.buscar_leitura_por_id(db, leitura_id)
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    
def criar_leitura(
    data: LeituraCreate, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """
    Cria uma nova leitura de sensores para um tanque.
    
    Recebe os valores de turbidez, oxigênio, temperatura, ph, amônia e cor da água.
    """
    try:
        return LeituraService.criar_leitura(
            db, 
            current_user.id, 
            data.tanque_id, 
            data.turbidez, 
            data.oxigenio, 
            data.temperatura, 
            data.ph, 
            data.amonia, 
            data.cor_agua,
            performed_by_id=current_user.id
        )
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    
def atualizar_leitura(
    leitura_id: int, 
    data: LeituraUpdate, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """
    Atualiza os dados de uma leitura existente.
    
    Permite alterar qualquer um dos campos da leitura através do seu ID.
    """
    try:
        return LeituraService.atualizar_leitura(
            db,
            leitura_id,
            data.model_dump(exclude_unset=True),
            performed_by_id=current_user.id
        )
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    
def deletar_leitura(
    leitura_id: int, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(get_current_user)
):
    """
    Remove uma leitura do sistema.
    """
    try:
        LeituraService.deletar_leitura(db, leitura_id, performed_by_id=current_user.id)
        return {"message": "Leitura deletada com sucesso"}
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
