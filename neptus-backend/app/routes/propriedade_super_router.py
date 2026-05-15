from fastapi import APIRouter, Depends
from app.controllers.v1.super import propriedade_controller
from app.utils.auth import get_admin_user

router = APIRouter(
    prefix="/v1/super/propriedades",
    tags=["Propriedades"],
    dependencies=[Depends(get_admin_user)]
)

router.post("", summary="Cadastrar propriedade")(propriedade_controller.cadastrar_propriedade)
router.get("", summary="Listar propriedades")(propriedade_controller.listar_propriedades)
router.put("/{id}", summary="Atualizar propriedade")(propriedade_controller.atualizar_propriedade)
router.get("/{id}", summary="Detalhar propriedade")(propriedade_controller.detalhar_propriedade)
router.post("/usuarios/adicionar", summary="Adicionar usuário à propriedade")(propriedade_controller.adicionar_usuario)
router.delete("/{propriedade_id}/usuarios/{usuario_id}", summary="Remover usuário da propriedade")(propriedade_controller.remover_usuario)
