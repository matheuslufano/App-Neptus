from datetime import datetime, timezone

from sqlalchemy.orm import validates
from app.database import db

class Leitura(db.Model):
    __tablename__ = 'leitura'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    tanque_id = db.Column(db.Integer, db.ForeignKey('tanque.id'), nullable=False)
    
    turbidez = db.Column(db.Numeric(10, 2), nullable=False)  
    oxigenio = db.Column(db.Numeric(10, 2), nullable=False)  
    temperatura = db.Column(db.Numeric(10, 2), nullable=False)  
    ph = db.Column(db.Numeric(10, 2), nullable=False)   
    amonia = db.Column(db.Numeric(10, 2), nullable=False)   
    cor_agua = db.Column(db.Integer, nullable=False)
    
    criado_em = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    atualizado_em = db.Column(db.DateTime,
                            default=lambda: datetime.now(timezone.utc),
                            onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    usuario = db.relationship('Usuario', backref=db.backref('leituras', lazy='dynamic'))
    tanque_rel = db.relationship('Tanque', back_populates='leituras')

    @validates('ph')
    def validate_ph(self, key, value):
        if value is not None and (value < 0 or value > 14):
            raise ValueError("pH must be between 0 and 14")
        return value

    @validates('turbidez', 'oxigenio', 'temperatura', 'amonia')
    def validate_positive(self, key, value):
        if value is not None and value < 0:
            raise ValueError(f"{key} must be a positive value")
        return value

    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'tanque_id': self.tanque_id,
            'turbidez': float(self.turbidez),
            'oxigenio': float(self.oxigenio),
            'temperatura': float(self.temperatura),
            'ph': float(self.ph),
            'amonia': float(self.amonia),
            'cor_agua': self.cor_agua,
            'criado_em': self.criado_em.isoformat() if self.criado_em else None,
            'atualizado_em': self.atualizado_em.isoformat() if self.atualizado_em else None,
        }  
