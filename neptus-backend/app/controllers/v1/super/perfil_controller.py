from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.auth import get_admin_user
from app.models.usuario_model import Usuario
from app.services.perfil_service import PerfilService
from app.schemas.perfil_schema import Perfil, PerfilCreate, PerfilUpdate
from app.exceptions.app_request_Exception import AppRequestError


def salvar_perfil(
    data: PerfilCreate, 
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user)
):
    """
    Cria um novo perfil de usuário (Apenas Super Admin).
    
    Define o nome do perfil e as permissões associadas.
    """
    try:
        return PerfilService.criar_perfil(
            db,
            data.nome,
            data.permissoes,
            performed_by_id=admin.id
        )
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def listar_perfil(
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user),
    page: int = 1, 
    per_page: int = 10
):
    """
    Lista todos os perfis cadastrados no sistema com paginação (Apenas Super Admin).
    """
    try:
        return PerfilService.listar_perfis(db, page, per_page)
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def atualizar_perfil(
    id: int, 
    data: PerfilUpdate, 
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user)
):
    """
    Atualiza as informações de um perfil existente (Apenas Super Admin).
    """
    try:
        return PerfilService.atualizar_perfil(
            db,
            id,
            data.nome,
            data.permissoes,
            performed_by_id=admin.id
        )
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def deletar_perfil(
    id: int, 
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user)
):
    """
    Remove um perfil do sistema (Apenas Super Admin).
    
    Observação: Perfis associados a usuários podem ter restrições de exclusão.
    """
    try:
        message = PerfilService.deletar_perfil(
            db,
            id,
            performed_by_id=admin.id
        )
        return {"mensagem": message}
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def buscar_perfil(
    id: int, 
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user)
):
    """
    Busca os detalhes de um perfil específico pelo seu ID (Apenas Super Admin).
    """
    try:
        return PerfilService.buscar_perfil(db, id)
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
