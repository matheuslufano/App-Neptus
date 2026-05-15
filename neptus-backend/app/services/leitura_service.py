from sqlalchemy.orm import Session
from app.exceptions import BadRequestError, NotFoundRequestError
from app.models.leitura_model import Leitura
from app.models.tanque_model import Tanque
from app.models.usuario_model import Usuario
from app.services.audit_service import AuditService
from app.utils.pagination import paginate

class LeituraService:
    @staticmethod
    def listar_todas_leituras(db: Session, tanque_id, page: int, per_page: int):
        if per_page < 1:
            raise NotFoundRequestError("Itens por página deve ser maior que zero.")

        query = db.query(Leitura).filter(Leitura.tanque_id == tanque_id).order_by(Leitura.criado_em.desc())
        paginated = paginate(query, page, per_page)
        
        return {
            'total': paginated['total'],
            'pagina_atual': paginated['pagina_atual'],
            'itens_por_pagina': paginated['itens_por_pagina'],
            'total_paginas': paginated['total_paginas'],
            'leituras': [item.to_dict() for item in paginated['items']]
        }

    @staticmethod
    def buscar_leitura_por_id(db: Session, leitura_id):
        leitura = db.query(Leitura).filter(Leitura.id == leitura_id).first()
        if not leitura:
            raise NotFoundRequestError("Leitura não encontrada.")
        return leitura.to_dict()

    @staticmethod
    def criar_leitura(db: Session, usuario_id, tanque_id, turbidez, oxigenio, temperatura, ph, amonia, cor_agua, performed_by_id: str = None):
        if not turbidez:
            raise BadRequestError("O campo 'turbidez' deve ser preenchido.")

        if not usuario_id or not tanque_id:
            raise BadRequestError("Os campos 'usuario_id' e 'tanque_id' devem ser preenchidos.")
        
        usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
        if not usuario:
            raise NotFoundRequestError("Usuário não encontrado.")

        tanque = db.query(Tanque).filter(Tanque.id == tanque_id).first()
        if not tanque:
            raise NotFoundRequestError("Tanque não encontrado.")

        leitura = Leitura(
            usuario_id=usuario_id, 
            tanque_id=tanque_id, 
            turbidez=turbidez,
            oxigenio=oxigenio, 
            temperatura=temperatura,
            ph=ph, 
            amonia=amonia, 
            cor_agua=cor_agua
        )
        db.add(leitura)
        db.commit()
        db.refresh(leitura)

        AuditService.log_action(
            db=db,
            entity_name='Leitura',
            entity_id=str(leitura.id),
            operation='create',
            user_id=performed_by_id,
            description='Leitura criada',
            data_before=None,
            data_after=leitura.to_dict(),
        )
        return leitura.to_dict()

    @staticmethod
    def atualizar_leitura(db: Session, leitura_id, data, performed_by_id: str = None):
        leitura = db.query(Leitura).filter(Leitura.id == leitura_id).first()
        if not leitura:
            raise NotFoundRequestError("Leitura não encontrada.")
        
        before = leitura.to_dict()
        for key, value in data.items():
            if value is not None:
                setattr(leitura, key, value)
        
        db.commit()
        db.refresh(leitura)

        AuditService.log_action(
            db=db,
            entity_name='Leitura',
            entity_id=str(leitura.id),
            operation='update',
            user_id=performed_by_id,
            description='Leitura atualizada',
            data_before=before,
            data_after=leitura.to_dict(),
        )
        return leitura.to_dict()

    @staticmethod
    def deletar_leitura(db: Session, leitura_id, performed_by_id: str = None):
        leitura = db.query(Leitura).filter(Leitura.id == leitura_id).first()
        if not leitura:
            raise NotFoundRequestError("Leitura não encontrada.")

        before = leitura.to_dict()
        db.delete(leitura)
        db.commit()

        AuditService.log_action(
            db=db,
            entity_name='Leitura',
            entity_id=str(leitura.id),
            operation='delete',
            user_id=performed_by_id,
            description='Leitura excluída',
            data_before=before,
            data_after=None,
        )
        return True
