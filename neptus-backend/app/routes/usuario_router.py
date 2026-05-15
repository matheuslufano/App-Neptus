from fastapi import APIRouter, Depends
from app.controllers.v1.super import usuario_controller
from app.utils.auth import get_admin_user

router = APIRouter(
    prefix="/v1/super/usuarios",
    tags=["Usuários"],
    dependencies=[Depends(get_admin_user)]
)

router.get("/relatorio", summary="Gerar relatório de usuários")(usuario_controller.relatorio_usuarios)
router.post("", summary="Criar usuário manual")(usuario_controller.salvar_usuario)
router.get("", summary="Listar todos os usuários")(usuario_controller.listar_usuarios)
router.put("/{id}", summary="Atualizar dados do usuário")(usuario_controller.atualizar_usuario)
router.patch("/{id}", summary="Alterar status do usuário")(usuario_controller.status_usuario)
router.get("/{id}", summary="Buscar usuário por ID")(usuario_controller.buscar_usuario)
