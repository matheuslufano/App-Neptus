from sqlalchemy.orm import Session
from sqlalchemy import text
from app.models.usuario_model import Usuario
from app.models.perfil_model import Perfil
from app.exceptions import (BadRequestError, ConflictRequestError, NotFoundRequestError)
from app.services.audit_service import AuditService
from app.utils import default_perfil
from app.utils.pagination import paginate

class UsuarioService:
    @staticmethod
    def registrar_usuario(db: Session, nome: str, email: str, senha: str, perfil_id: str, performed_by_id: str = None):
        if (not nome) or (not email) or (not senha):
            raise BadRequestError("Os campos 'nome', 'email' e 'senha' devem ser preenchidos")
        
        if db.query(Usuario).filter(Usuario.email == email).first():
            raise ConflictRequestError("E-mail já cadastrado")
        
        usuario = Usuario(nome=nome, email=email)
        if perfil_id:
            perfil = db.query(Perfil).filter(Perfil.id == perfil_id).first()
            if not perfil:
                raise NotFoundRequestError("Perfil não encontrado")
            usuario.perfil_id = perfil_id
        else:
            usuario.perfil_id = default_perfil.get_default_perfil(db).id

        usuario.set_senha(senha)
        db.add(usuario)
        db.commit()
        db.refresh(usuario)

        AuditService.log_action(
            db=db,
            entity_name='Usuario',
            entity_id=str(usuario.id),
            operation='create',
            user_id=performed_by_id,
            user_email=usuario.email,
            description='Usuário registrado',
            data_before=None,
            data_after=usuario.to_dict(),
        )
        return usuario.to_dict()

    @staticmethod
    def listar_usuarios(db: Session, page: int, per_page: int):
        query = db.query(Usuario).order_by(Usuario.criado_em)
        paginated = paginate(query, page, per_page)
        
        return {
            'total': paginated['total'],
            'pagina_atual': paginated['pagina_atual'],
            'itens_por_pagina': paginated['itens_por_pagina'],
            'total_paginas': paginated['total_paginas'],
            'usuarios': [item.to_dict() for item in paginated['items']]
        }

    @staticmethod
    def atualizar_usuario(db: Session, id: str, nome: str, email: str, perfil_id: str, performed_by_id: str = None):
        if (not nome) or (not email) or (not perfil_id):
            raise BadRequestError("Os campos 'nome', 'email' e 'perfil_id' devem ser preenchidos")
        
        usuario = db.query(Usuario).filter(Usuario.id == id).first()
        if not usuario:
            raise NotFoundRequestError("Usuário não encontrado")

        perfil = db.query(Perfil).filter(Perfil.id == perfil_id).first()
        if not perfil:
            raise NotFoundRequestError("Perfil nao encontrado")

        if usuario.email != email:
            usuario_email = db.query(Usuario).filter(Usuario.email == email).first()
            if usuario_email and usuario_email.id != usuario.id:
                raise ConflictRequestError("E-mail ja cadastrado")

        before = usuario.to_dict()
        usuario.nome = nome
        usuario.email = email
        usuario.perfil_id = perfil_id
        db.commit()
        db.refresh(usuario)

        AuditService.log_action(
            db=db,
            entity_name='Usuario',
            entity_id=str(usuario.id),
            operation='update',
            user_id=performed_by_id,
            user_email=usuario.email,
            description='Usuário atualizado',
            data_before=before,
            data_after=usuario.to_dict(),
        )
        return usuario.to_dict()

    @staticmethod
    def status_usuario(db: Session, id: str, status: bool, performed_by_id: str = None):
        if status is None:
            raise BadRequestError("O campo 'status' deve ser preenchido")
            
        usuario = db.query(Usuario).filter(Usuario.id == id).first()
        if not usuario:
            raise NotFoundRequestError("Usuário nao encontrado")

        before = usuario.to_dict()
        usuario.esta_ativo = bool(status)
        db.commit()
        db.refresh(usuario)

        AuditService.log_action(
            db=db,
            entity_name='Usuario',
            entity_id=str(usuario.id),
            operation='update',
            user_id=performed_by_id,
            user_email=usuario.email,
            description='Alteração de status do usuário',
            data_before=before,
            data_after=usuario.to_dict(),
        )
        return usuario.to_dict()

    @staticmethod
    def buscar_usuario(db: Session, id: str):
        usuario = db.query(Usuario).filter(Usuario.id == id).first()
        if not usuario:
            raise NotFoundRequestError("Usuário nao encontrado")
        return usuario.to_dict()

    @staticmethod
    def relatorio_usuarios(db: Session):
        resultado = db.execute(
            text(""" 
            SELECT 
                u.id,
                u.nome,
                u.email,
                u.e_admin,
                u.esta_ativo,
                u.perfil_id,
                to_char(u.criado_em, 'DD/MM/YYYY HH24:MI:SS') AS criado_em,
                to_char(u.atualizado_em, 'DD/MM/YYYY HH24:MI:SS') AS atualizado_em
            FROM usuario u
            LEFT JOIN propriedade_usuarios up ON up.usuario_id = u.id
            LEFT JOIN propriedade p ON p.id = up.propriedade_id
            ORDER BY u.criado_em;
        """))

        return [dict(row._mapping) for row in resultado.fetchall()]