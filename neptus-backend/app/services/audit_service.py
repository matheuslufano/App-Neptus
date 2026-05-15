from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from app.utils.pagination import paginate
from app.models.audit_log_model import AuditLog

class AuditService:
    @staticmethod
    def diff_fields(before: Optional[dict], after: Optional[dict]):
        if not before or not after:
            return None
        return [key for key in after.keys() if before.get(key) != after.get(key)]

    @staticmethod
    def log_action(
        db: Session,
        entity_name: str,
        entity_id: Optional[str],
        operation: str,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        description: Optional[str] = None,
        data_before: Optional[dict] = None,
        data_after: Optional[dict] = None,
    ):
        changed_fields = AuditService.diff_fields(data_before, data_after)
        audit = AuditLog(
            entity_name=entity_name,
            entity_id=entity_id,
            operation=operation,
            user_id=user_id,
            user_email=user_email,
            description=description,
            timestamp=datetime.now(timezone.utc),
            data_before=data_before,
            data_after=data_after,
            changed_fields=changed_fields,
        )
        db.add(audit)
        db.commit()
        db.refresh(audit)
        return audit.to_dict()

    @staticmethod
    def get_audit(db: Session, audit_id: str):
        audit = db.query(AuditLog).filter(AuditLog.id == audit_id).first()
        return audit.to_dict() if audit else None

    @staticmethod
    def list_audits(
        db: Session,
        user_id: Optional[str] = None,
        entity_name: Optional[str] = None,
        operation: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        page: int = 1,
        per_page: int = 20,
    ):
        query = db.query(AuditLog).order_by(AuditLog.timestamp.desc())

        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if entity_name:
            query = query.filter(AuditLog.entity_name.ilike(f"%{entity_name}%"))
        if operation:
            query = query.filter(AuditLog.operation.ilike(f"%{operation}%"))
        if start_date:
            query = query.filter(AuditLog.timestamp >= start_date)
        if end_date:
            query = query.filter(AuditLog.timestamp <= end_date)

        paginated = paginate(query, page, per_page)
        return {
            'total': paginated['total'],
            'pagina_atual': paginated['pagina_atual'],
            'itens_por_pagina': paginated['itens_por_pagina'],
            'total_paginas': paginated['total_paginas'],
            'auditorias': [item.to_dict() for item in paginated['items']]
        }
