from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List, Optional

class PerfilBase(BaseModel):
    nome: str
    permissoes: List[str]

class PerfilCreate(PerfilBase):
    pass

class PerfilUpdate(PerfilBase):
    pass

class Perfil(PerfilBase):
    id: UUID
    criado_em: datetime
    atualizado_em: datetime

    model_config = ConfigDict(from_attributes=True)
