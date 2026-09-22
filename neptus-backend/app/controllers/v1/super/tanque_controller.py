from fastapi import Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.auth import get_admin_user
from app.models.usuario_model import Usuario
from app.services.tanque_services import TanqueService
from app.schemas.tanque_schema import Tanque, TanqueCreate, TanqueUpdate
from app.exceptions.app_request_Exception import AppRequestError


def cadastrar_tanque(
    data: TanqueCreate, 
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user)
):
    """
    Cadastra um novo tanque em uma propriedade (Apenas Super Admin).
    """
    try:
        return TanqueService.cadastrar_tanque(
            db=db,
            usuario_id=admin.id,
            nome=data.nome,
            id_propriedade=data.id_propriedade,
            area_tanque=data.area_tanque,
            tipo_peixe=data.tipo_peixe,
            peso_peixe=data.peso_peixe,
            qtd_peixe=data.qtd_peixe,
            performed_by_id=admin.id
        )
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def listar_tanques(
    id_propriedade: int = Query(...),
    page: int = 1, 
    per_page: int = 10,
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user)
):
    """
    Lista todos os tanques de uma propriedade específica (Apenas Super Admin).
    """
    try:
        return TanqueService.listar_tanques(db, id_propriedade, page, per_page)
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def detalhar_tanque(
    id: int, 
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user)
):
    """
    Obtém os detalhes de um tanque específico pelo seu ID (Apenas Super Admin).
    """
    try:
        return TanqueService.exibir_tanque(db, id)
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def atualizar_tanque(
    id: int, 
    data: TanqueUpdate, 
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user)
):
    """
    Atualiza as informações de um tanque (Apenas Super Admin).
    """
    try:
        return TanqueService.atualizar_tanque(
            db,
            id,
            data.model_dump(exclude_unset=True),
            performed_by_id=admin.id
        )
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

def status_tanque(
    id: int, 
    db: Session = Depends(get_db), 
    admin: Usuario = Depends(get_admin_user)
):
    """
    Alterna o status (ativo/inativo) de um tanque (Apenas Super Admin).
    """
    try:
        tanque = TanqueService.status_tanque(
            db,
            id,
            performed_by_id=admin.id
        )
        status_str = "ativado" if tanque['ativo'] else "desativado"
        return {
            "mensagem": f"Tanque '{tanque['nome']}' {status_str} com sucesso.",
            "tanque": tanque
        }
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
