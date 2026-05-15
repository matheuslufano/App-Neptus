from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from app.schemas.usuario_schema import UsuarioSimple

class PropriedadeBase(BaseModel):
    nome: str
    proprietario_id: Optional[UUID] = None

class PropriedadeCreate(PropriedadeBase):
    pass

class PropriedadeUpdate(BaseModel):
    nome: Optional[str] = None
    proprietario_id: Optional[UUID] = None

class Propriedade(PropriedadeBase):
    id: UUID
    proprietario_nome: Optional[str] = None
    total_usuarios: int = 0
    criado_em: datetime
    atualizado_em: datetime
    usuarios: List[UsuarioSimple] = []

    model_config = ConfigDict(from_attributes=True)
