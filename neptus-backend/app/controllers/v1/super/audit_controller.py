from datetime import datetime
from typing import Optional

from fastapi import Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario_model import Usuario
from app.services.audit_service import AuditService
from app.utils.auth import get_admin_user
from app.exceptions.app_request_Exception import AppRequestError


def listar_auditorias(
    user_id: Optional[int] = Query(
        None,
        title="ID do usuário",
        description="Filtra auditorias realizadas por esse usuário"
    ),
    entity_name: Optional[str] = Query(
        None,
        title="Entidade",
        description="Filtra auditorias por entidade/tabela, por exemplo Usuario, Propriedade, Tanque, Leitura, Perfil"
    ),
    operation: Optional[str] = Query(
        None,
        title="Operação",
        description="Filtra auditorias por tipo de operação: create, update ou delete"
    ),
    start_date: Optional[datetime] = Query(
        None,
        title="Data inicial",
        description="Filtra auditorias a partir desta data (inclusive)"
    ),
    end_date: Optional[datetime] = Query(
        None,
        title="Data final",
        description="Filtra auditorias até esta data (inclusive)"
    ),
    page: int = Query(
        1,
        ge=1,
        title="Página",
        description="Número da página de resultados"
    ),
    per_page: int = Query(
        20,
        ge=1,
        title="Itens por página",
        description="Quantidade de auditorias retornadas por página"
    ),
    db: Session = Depends(get_db),
    admin: Usuario = Depends(get_admin_user)
):
    try:
        return AuditService.list_audits(
            db=db,
            user_id=user_id,
            entity_name=entity_name,
            operation=operation,
            start_date=start_date,
            end_date=end_date,
            page=page,
            per_page=per_page,
        )
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)


def buscar_auditoria(
    audit_id: int,
    db: Session = Depends(get_db),
    admin: Usuario = Depends(get_admin_user)
):
    try:
        auditoria = AuditService.get_audit(db, audit_id)
        if not auditoria:
            raise HTTPException(status_code=404, detail="Auditoria não encontrada")
        return auditoria
    except AppRequestError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
