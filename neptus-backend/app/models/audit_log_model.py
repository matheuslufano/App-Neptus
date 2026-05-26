from datetime import datetime, timezone

from app.database import db

class AuditLog(db.Model):
    __tablename__ = 'audit_log'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    entity_name = db.Column(db.String(100), nullable=False)
    entity_id = db.Column(db.String(100), nullable=True)
    operation = db.Column(db.String(20), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=True)
    user_email = db.Column(db.String(120), nullable=True)
    description = db.Column(db.String(255), nullable=True)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    data_before = db.Column(db.JSON, nullable=True)
    data_after = db.Column(db.JSON, nullable=True)
    changed_fields = db.Column(db.JSON, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'entity_name': self.entity_name,
            'entity_id': self.entity_id,
            'operation': self.operation,
            'user_id': self.user_id,
            'user_email': self.user_email,
            'description': self.description,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'data_before': self.data_before,
            'data_after': self.data_after,
            'changed_fields': self.changed_fields,
        }
