from sqlalchemy.orm import Session
from app.exceptions import (BadRequestError, ConflictRequestError, NotFoundRequestError)
from app.models.perfil_model import Perfil
from app.models.propriedade_model import Propriedade
from app.models.usuario_model import Usuario
from app.utils.pagination import paginate

class PropriedadeService:
    @staticmethod
    def cadastrar_propriedade(db: Session, nome: str, proprietario_id: str):
        if not nome or not proprietario_id:
            raise BadRequestError("Os campos 'nome' e 'proprietario_id' devem ser preenchidos")
            
        propriedade = db.query(Propriedade).filter(Propriedade.nome == nome).first()
        if propriedade:
            raise ConflictRequestError("Propriedade com mesmo nome já cadastrada")
        
        usuario = db.query(Usuario).filter(Usuario.id == proprietario_id).first()
        if not usuario:
            raise NotFoundRequestError("Usuário não encontrado")

        propriedade = Propriedade(nome=nome, proprietario_id=proprietario_id)
        propriedade.usuarios.append(usuario)
        db.add(propriedade)
        db.commit()
        db.refresh(propriedade)
        return propriedade.to_dict()

    @staticmethod
    def listar_propriedades(db: Session, page: int, per_page: int):
        query = db.query(Propriedade).order_by(Propriedade.criado_em)
        paginated = paginate(query, page, per_page)
        
        return {
            'total': paginated['total'],
            'pagina_atual': paginated['pagina_atual'],
            'itens_por_pagina': paginated['itens_por_pagina'],
            'total_paginas': paginated['total_paginas'],
            'propriedades': [item.to_dict() for item in paginated['items']]
        }

    @staticmethod
    def atualizar_propriedade(db: Session, id: str, nome: str, proprietario_id: str):
        if not nome or not proprietario_id:
            raise BadRequestError("Os campos 'nome' e 'proprietario_id' devem ser preenchidos")

        propriedade = db.query(Propriedade).filter(Propriedade.id == id).first()
        if not propriedade:
            raise NotFoundRequestError("Propriedade não encontrada")

        nome_existente = db.query(Propriedade).filter(Propriedade.nome == nome).first()
        if nome_existente and str(nome_existente.id) != str(propriedade.id):
            raise ConflictRequestError("Propriedade com mesmo nome já cadastrada")

        usuario = db.query(Usuario).filter(Usuario.id == proprietario_id).first()
        if not usuario:
            raise NotFoundRequestError("Proprietário não encontrado")
        
        if str(usuario.id) != str(propriedade.proprietario_id):
            usuario_antigo = db.query(Usuario).filter(Usuario.id == propriedade.proprietario_id).first()
            propriedade.proprietario_id = usuario.id
            if usuario not in propriedade.usuarios:
                propriedade.usuarios.append(usuario)
                if usuario_antigo and usuario_antigo in propriedade.usuarios:
                    propriedade.usuarios.remove(usuario_antigo)

        propriedade.nome = nome
        db.commit()
        db.refresh(propriedade)
        return propriedade.to_dict()

    @staticmethod
    def detalhar_propriedade(db: Session, id: str):
        propriedade = db.query(Propriedade).filter(Propriedade.id == id).first()
        if not propriedade:
            raise NotFoundRequestError("Propriedade não encontrada")
        return propriedade.to_dict()

    @staticmethod
    def adicionar_usuario(db: Session, id: str, usuario_id: str):
        propriedade = db.query(Propriedade).filter(Propriedade.id == id).first()
        if not propriedade:
            raise NotFoundRequestError("Propriedade não encontrada")
            
        usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
        if not usuario:
            raise NotFoundRequestError("Usuário não encontrado")
            
        if usuario in propriedade.usuarios:
            raise ConflictRequestError("Usuário ja cadastrado na propriedade")
            
        propriedade.usuarios.append(usuario)
        db.commit()
        db.refresh(propriedade)
        return propriedade.to_dict()

    @staticmethod
    def remover_usuario(db: Session, id: str, usuario_id: str):
        propriedade = db.query(Propriedade).filter(Propriedade.id == id).first()
        if not propriedade:
            raise NotFoundRequestError("Propriedade não encontrada")
            
        usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
        if not usuario:
            raise NotFoundRequestError("Usuário não encontrado")
            
        if usuario not in propriedade.usuarios:
            raise ConflictRequestError("Usuário não cadastrado na propriedade")

        propriedade.usuarios.remove(usuario)
        db.commit()
        db.refresh(propriedade)
        return propriedade