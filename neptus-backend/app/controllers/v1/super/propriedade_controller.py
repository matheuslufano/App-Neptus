from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.auth import get_admin_user
from app.models.usuario_model import Usuario
from app.services.propriedade_service import PropriedadeService
from app.schemas.propriedade_schema import Propriedade, PropriedadeCreate, PropriedadeUpdate
from app.exceptions.app_request_Exception import AppRequestError


def cadastrar_propriedade(
    data: PropriedadeCreate, 
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user)
):
    """
    Cadastra uma nova propriedade e associa a um proprietário (Apenas Super Admin).
    """
    try:
        return PropriedadeService.cadastrar_propriedade(
            db,
            data.nome,
            data.proprietario_id,
            performed_by_id=admin.id
        )
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def listar_propriedades(
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user),
    page: int = 1, 
    per_page: int = 10
):
    """
    Lista todas as propriedades cadastradas no sistema (Apenas Super Admin).
    """
    try:
        return PropriedadeService.listar_propriedades(db, page, per_page)
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def atualizar_propriedade(
    id: int, 
    data: PropriedadeUpdate, 
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user)
):
    """
    Atualiza os dados de uma propriedade (Apenas Super Admin).
    """
    try:
        return PropriedadeService.atualizar_propriedade(
            db,
            id,
            data.nome,
            data.proprietario_id,
            performed_by_id=admin.id
        )
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def detalhar_propriedade(
    id: int, 
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user)
):
    """
    Obtém informações detalhadas de uma propriedade, incluindo usuários associados (Apenas Super Admin).
    """
    try:
        return PropriedadeService.detalhar_propriedade(db, id)
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def adicionar_usuario(
    propriedade_id: int,
    usuario_id: int,
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user)
):
    """
    Associa um usuário existente a uma propriedade (Apenas Super Admin).
    """
    try:
        return PropriedadeService.adicionar_usuario(
            db,
            propriedade_id,
            usuario_id,
            performed_by_id=admin.id
        )
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def remover_usuario(
    propriedade_id: int,
    usuario_id: int,
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user)
):
    """
    Remove a associação de um usuário com uma propriedade (Apenas Super Admin).
    """
    try:
        return PropriedadeService.remover_usuario(
            db,
            propriedade_id,
            usuario_id,
            performed_by_id=admin.id
        )
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
