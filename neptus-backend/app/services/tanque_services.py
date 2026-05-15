from sqlalchemy.orm import Session
from app.models.tanque_model import Tanque
from app.models.propriedade_model import Propriedade
from app.exceptions import BadRequestError, ConflictRequestError, NotFoundRequestError
from app.services.audit_service import AuditService
from app.utils.pagination import paginate

class TanqueService:
    @staticmethod
    def cadastrar_tanque(
        db: Session,
        usuario_id: str,
        nome: str,
        id_propriedade: str,
        area_tanque: float,
        tipo_peixe: str,
        peso_peixe: float = None,
        qtd_peixe: int = None,
        performed_by_id: str = None
    ):
        """Cadastra um novo tanque vinculado ao usuário logado e à propriedade informada."""
        if not nome or not nome.strip():
            raise BadRequestError("O nome do tanque é obrigatório.")
        if not area_tanque or area_tanque <= 0:
            raise BadRequestError("A área do tanque deve ser maior que zero.")
        if not tipo_peixe or not tipo_peixe.strip():
            raise BadRequestError("O tipo de peixe é obrigatório.")

        # Verifica duplicidade apenas dentro da mesma propriedade
        tanque_existente = db.query(Tanque).filter(
            Tanque.nome == nome,
            Tanque.id_propriedade == id_propriedade
        ).first()

        if tanque_existente:
            raise ConflictRequestError("Já existe um tanque com este nome nesta propriedade.")

        # Verifica se a propriedade existe
        propriedade = db.query(Propriedade).filter(Propriedade.id == id_propriedade).first()
        if not propriedade:
            raise NotFoundRequestError("Propriedade não encontrada.")

        # Cria o tanque
        novo_tanque = Tanque(
            nome=nome,
            id_usuario=usuario_id,
            id_propriedade=id_propriedade,
            area_tanque=area_tanque,
            tipo_peixe=tipo_peixe,
            peso_peixe=peso_peixe,
            qtd_peixe=qtd_peixe,
            ativo=True
        )

        db.add(novo_tanque)
        db.commit()
        db.refresh(novo_tanque)

        AuditService.log_action(
            db=db,
            entity_name='Tanque',
            entity_id=str(novo_tanque.id),
            operation='create',
            user_id=performed_by_id,
            description='Tanque cadastrado',
            data_before=None,
            data_after=novo_tanque.to_dict(),
        )
        return novo_tanque.to_dict()
    
    @staticmethod
    def listar_tanques(db: Session, id_propriedade, page: int, per_page: int):
        """Lista os tanques de uma propriedade específica, com paginação."""
        query = db.query(Tanque).filter(Tanque.id_propriedade == id_propriedade).order_by(Tanque.criado_em.desc())
        paginated = paginate(query, page, per_page)

        return {
            'total': paginated['total'],
            'pagina_atual': paginated['pagina_atual'],
            'itens_por_pagina': paginated['itens_por_pagina'],
            'total_paginas': paginated['total_paginas'],
            'tanques': [item.to_dict() for item in paginated['items']]
        }
    
    @staticmethod
    def exibir_tanque(db: Session, id_tanque):
        tanque = db.query(Tanque).filter(Tanque.id == id_tanque).first()
        if not tanque:
            raise NotFoundRequestError("Tanque não encontrado.")
        return tanque.to_dict()
    
    @staticmethod
    def atualizar_tanque(db: Session, id_tanque, dados: dict, performed_by_id: str = None):
        """Atualiza os dados de um tanque existente."""        
        tanque = db.query(Tanque).filter(Tanque.id == id_tanque).first()
        if not tanque:
            raise NotFoundRequestError("Tanque não encontrado.")

        before = tanque.to_dict()
        campos_permitidos = ['nome', 'area_tanque', 'tipo_peixe', 'peso_peixe', 'qtd_peixe', 'ativo']

        for campo in campos_permitidos:
            if campo in dados:
                valor = dados[campo]
                if campo == 'nome' and (not valor or not valor.strip()):
                    raise BadRequestError("O nome do tanque não pode ser vazio.")
                if campo == 'area_tanque' and (not valor or float(valor) <= 0):
                    raise BadRequestError("A área do tanque deve ser maior que zero.")
                if campo == 'tipo_peixe' and (not valor or not valor.strip()):
                    raise BadRequestError("O tipo de peixe é obrigatório.")

                setattr(tanque, campo, valor)

        db.commit()
        db.refresh(tanque)

        AuditService.log_action(
            db=db,
            entity_name='Tanque',
            entity_id=str(tanque.id),
            operation='update',
            user_id=performed_by_id,
            description='Tanque atualizado',
            data_before=before,
            data_after=tanque.to_dict(),
        )
        return tanque.to_dict()
    
    @staticmethod
    def status_tanque(db: Session, id_tanque, performed_by_id: str = None):
        tanque = db.query(Tanque).filter(Tanque.id == id_tanque).first()
        if not tanque:
            raise NotFoundRequestError("Tanque não encontrado.")

        before = tanque.to_dict()
        tanque.ativo = not tanque.ativo
        db.commit()
        db.refresh(tanque)

        AuditService.log_action(
            db=db,
            entity_name='Tanque',
            entity_id=str(tanque.id),
            operation='update',
            user_id=performed_by_id,
            description='Status do tanque alterado',
            data_before=before,
            data_after=tanque.to_dict(),
        )
        return tanque
