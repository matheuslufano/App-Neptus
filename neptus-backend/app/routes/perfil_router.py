from fastapi import APIRouter, Depends
from app.controllers.v1.super import perfil_controller
from app.utils.auth import get_admin_user

router = APIRouter(
    prefix="/v1/super/perfis",
    tags=["Perfis"],
    dependencies=[Depends(get_admin_user)]
)

router.post("", summary="Criar novo perfil")(perfil_controller.salvar_perfil)
router.get("", summary="Listar perfis")(perfil_controller.listar_perfil)
router.put("/{id}", summary="Atualizar perfil")(perfil_controller.atualizar_perfil)
router.delete("/{id}", summary="Deletar perfil")(perfil_controller.deletar_perfil)
router.get("/{id}", summary="Buscar perfil específico")(perfil_controller.buscar_perfil)
