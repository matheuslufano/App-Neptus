from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.auth import get_admin_user
from app.models.usuario_model import Usuario
from app.services.usuario_service import UsuarioService
from app.schemas.usuario_schema import Usuario as UsuarioSchema, UsuarioCreate, UsuarioUpdate
from app.exceptions.app_request_Exception import AppRequestError

from typing import Optional

def salvar_usuario(
    data: UsuarioCreate, 
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user)
):
    """
    Cria um novo usuário manualmente (Apenas Super Admin).
    """
    try:
        return UsuarioService.registrar_usuario(
            db,
            data.nome,
            data.email,
            data.senha,
            data.perfil_id,
            performed_by_id=admin.id
        )
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def listar_usuarios(
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user),
    page: int = 1, 
    per_page: int = 10
):
    """
    Lista todos os usuários do sistema com paginação (Apenas Super Admin).
    """
    try:
        return UsuarioService.listar_usuarios(db, page, per_page)
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def atualizar_usuario(
    id: int, 
    data: UsuarioUpdate, 
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user)
):
    """
    Atualiza os dados de um usuário específico (Apenas Super Admin).
    """
    try:
        return UsuarioService.atualizar_usuario(
            db,
            id,
            data.nome,
            data.email,
            data.perfil_id,
            performed_by_id=admin.id
        )
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def status_usuario(
    id: int, 
    status_val: bool, 
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user)
):
    """
    Ativa ou desativa um usuário (Apenas Super Admin).
    """
    try:
        return UsuarioService.status_usuario(
            db,
            id,
            status_val,
            performed_by_id=admin.id
        )
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def buscar_usuario(
    id: int, 
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user)
):
    """
    Busca os detalhes de um usuário pelo seu ID (Apenas Super Admin).
    """
    try:
        return UsuarioService.buscar_usuario(db, id)
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def relatorio_usuarios(
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user)
):
    """
    Gera um relatório detalhado de todos os usuários (Apenas Super Admin).
    """
    try:
        return UsuarioService.relatorio_usuarios(db)
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)