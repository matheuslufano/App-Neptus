from fastapi import APIRouter, Depends
from app.controllers.v1.super import tanque_controller
from app.utils.auth import get_admin_user

router = APIRouter(
    prefix="/v1/super/tanques",
    tags=["Tanques"],
    dependencies=[Depends(get_admin_user)]
)

router.post("", summary="Cadastrar tanque")(tanque_controller.cadastrar_tanque)
router.get("", summary="Listar tanques")(tanque_controller.listar_tanques)
router.put("/{id}", summary="Atualizar tanque")(tanque_controller.atualizar_tanque)
router.get("/{id}", summary="Detalhar tanque")(tanque_controller.detalhar_tanque)
router.patch("/{id}/status", summary="Alterar status do tanque")(tanque_controller.status_tanque)
