from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel

class AuditBase(BaseModel):
    entity_name: str
    entity_id: Optional[str] = None
    operation: str
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    description: Optional[str] = None
    timestamp: Optional[datetime] = None
    data_before: Optional[dict] = None
    data_after: Optional[dict] = None
    changed_fields: Optional[List[str]] = None

    class Config:
        orm_mode = True

class AuditListResponse(BaseModel):
    total: int
    pagina_atual: int
    itens_por_pagina: int
    total_paginas: int
    auditorias: List[AuditBase]
