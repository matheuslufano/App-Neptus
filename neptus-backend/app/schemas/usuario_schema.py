from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List, Optional

class UsuarioBase(BaseModel):
    nome: str
    email: EmailStr
    e_admin: bool = False
    esta_ativo: bool = True
    perfil_id: UUID

class UsuarioCreate(UsuarioBase):
    senha: str

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    e_admin: Optional[bool] = None
    esta_ativo: Optional[bool] = None
    perfil_id: Optional[UUID] = None
    senha: Optional[str] = None

class UsuarioSimple(BaseModel):
    id: UUID
    nome: str
    
    model_config = ConfigDict(from_attributes=True)

class Usuario(UsuarioBase):
    id: UUID
    perfil_nome: Optional[str] = None
    total_propriedades: int = 0
    criado_em: datetime
    atualizado_em: datetime
    propriedades: List[dict] = []

    model_config = ConfigDict(from_attributes=True)
