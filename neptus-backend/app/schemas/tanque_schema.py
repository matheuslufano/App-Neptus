from pydantic import BaseModel, ConfigDict, field_validator
from uuid import UUID
from datetime import datetime
from typing import Optional
from decimal import Decimal

class TanqueBase(BaseModel):
    nome: str
    id_propriedade: UUID
    area_tanque: Decimal
    tipo_peixe: str
    peso_peixe: Optional[Decimal] = None
    qtd_peixe: Optional[int] = None
    ativo: bool = True

    @field_validator('area_tanque', 'peso_peixe', 'qtd_peixe', mode='before')
    @classmethod
    def validate_positive(cls, v):
        if v is not None and float(v) < 0:
            raise ValueError("Value must be positive")
        return v

class TanqueCreate(TanqueBase):
    id_usuario: UUID

class TanqueUpdate(BaseModel):
    nome: Optional[str] = None
    area_tanque: Optional[Decimal] = None
    tipo_peixe: Optional[str] = None
    peso_peixe: Optional[Decimal] = None
    qtd_peixe: Optional[int] = None
    ativo: Optional[bool] = None

class Tanque(TanqueBase):
    id: UUID
    id_usuario: Optional[UUID] = None
    criado_em: datetime
    atualizado_em: datetime

    model_config = ConfigDict(from_attributes=True)
