from app.database import db, metadata

propriedade_usuarios = db.Table(
    'propriedade_usuarios',
    metadata,
    db.Column('propriedade_id', db.Integer, db.ForeignKey('propriedade.id'), primary_key=True),
    db.Column('usuario_id', db.Integer, db.ForeignKey('usuario.id'), primary_key=True),
)