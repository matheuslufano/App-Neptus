from sqlalchemy.orm import Session
from app.exceptions import BadRequestError, ConflictRequestError, NotFoundRequestError
from app.models.perfil_model import Perfil
from app.enum.PermissionEnum import PermissionEnum
from app.utils.default_perfil import get_default_perfil
from app.utils.pagination import paginate

class PerfilService:
    @staticmethod
    def criar_perfil(db: Session, nome: str, permissoes: list):
        if not nome:
            raise BadRequestError("O campo 'nome' é obrigatório")
        nome = nome.upper()
        if not permissoes or len(permissoes) == 0:
            raise BadRequestError("O campo 'permissoes' é obrigatório")
        
        if db.query(Perfil).filter(Perfil.nome == nome).first():
            raise ConflictRequestError("Já existe um perfil com esse nome")
        
        permissoes = [p.lower() for p in permissoes]
        permissoes = list(set(permissoes))
        permissoes_validas = {perm.value for perm in PermissionEnum}
        permissoes_invalidas = [p for p in permissoes if p not in permissoes_validas]

        if permissoes_invalidas:
            raise BadRequestError(message="Permissões inválidas")

        perfil = Perfil(nome=nome, permissoes=permissoes)
        db.add(perfil)
        db.commit()
        db.refresh(perfil)
        return perfil.to_dict()

    @staticmethod
    def listar_perfis(db: Session, page: int, per_page: int):
        query = db.query(Perfil).order_by(Perfil.criado_em)
        paginated = paginate(query, page, per_page)
        
        return {
            'total': paginated['total'],
            'pagina_atual': paginated['pagina_atual'],
            'itens_por_pagina': paginated['itens_por_pagina'],
            'total_paginas': paginated['total_paginas'],
            'perfis': [item.to_dict() for item in paginated['items']]
        }
    
    @staticmethod
    def atualizar_perfil(db: Session, id: str, nome: str, permissoes: list):
        if not nome:
            raise BadRequestError("O campo 'nome' é obrigatório")
            
        perfil = db.query(Perfil).filter(Perfil.id == id).first()
        if not perfil:
            raise NotFoundRequestError("Perfil não encontrado")
            
        nome = nome.upper()
        perfil_default = get_default_perfil(db)
        
        if str(perfil.id) == str(perfil_default.id):
            if nome != perfil_default.nome:
                raise BadRequestError("O campo 'nome' não pode ser alterado para o perfil default")

        if perfil.nome != nome:
            perfil_existente = db.query(Perfil).filter(Perfil.nome == nome).first()
            if perfil_existente and str(perfil_existente.id) != str(id):
                raise ConflictRequestError("Já existe um perfil com esse nome")

        if not permissoes:
            raise BadRequestError("O campo 'permissoes' é obrigatório")
            
        permissoes = [p.lower() for p in permissoes]
        permissoes = list(set(permissoes))
        permissoes_validas = {perm.value for perm in PermissionEnum}
        permissoes_invalidas = [p for p in permissoes if p not in permissoes_validas]

        if permissoes_invalidas:
            raise BadRequestError(message="Permissões inválidas")

        perfil.nome = nome
        perfil.permissoes = permissoes
        db.commit()
        db.refresh(perfil)
        return perfil.to_dict()

    @staticmethod
    def deletar_perfil(db: Session, id: str):
        perfil = db.query(Perfil).filter(Perfil.id == id).first()
        if not perfil:
            raise NotFoundRequestError("Perfil não encontrado")

        perfil_default = get_default_perfil(db)
        if str(perfil.id) == str(perfil_default.id):
            raise BadRequestError("Perfil default não pode ser deletado")

        for usuario in perfil.usuarios:
            usuario.perfil_id = perfil_default.id
            
        db.commit()
        db.delete(perfil)
        db.commit()
        return "perfil deletado com sucesso! todos os usuarios foram transferidos para o perfil default"
    
    @staticmethod
    def buscar_perfil(db: Session, id: str):
        perfil = db.query(Perfil).filter(Perfil.id == id).first()
        if not perfil:
            raise NotFoundRequestError("Perfil não encontrado")
        return perfil.to_dict()
