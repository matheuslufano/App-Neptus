from pydantic import BaseModel, ConfigDict, field_validator

from datetime import datetime
from typing import Optional
from decimal import Decimal

class LeituraBase(BaseModel):
    tanque_id: int
    turbidez: Decimal
    oxigenio: Decimal
    temperatura: Decimal
    ph: Decimal
    amonia: Decimal
    cor_agua: int

    @field_validator('ph')
    @classmethod
    def validate_ph(cls, v):
        if v is not None and (float(v) < 0 or float(v) > 14):
            raise ValueError("pH must be between 0 and 14")
        return v

    @field_validator('turbidez', 'oxigenio', 'temperatura', 'amonia')
    @classmethod
    def validate_positive(cls, v):
        if v is not None and float(v) < 0:
            raise ValueError("Value must be positive")
        return v

class LeituraCreate(LeituraBase):
    usuario_id: int

class LeituraUpdate(BaseModel):
    turbidez: Optional[Decimal] = None
    oxigenio: Optional[Decimal] = None
    temperatura: Optional[Decimal] = None
    ph: Optional[Decimal] = None
    amonia: Optional[Decimal] = None
    cor_agua: Optional[int] = None

class Leitura(LeituraBase):
    id: int
    usuario_id: int
    criado_em: datetime
    atualizado_em: datetime

    model_config = ConfigDict(from_attributes=True)
