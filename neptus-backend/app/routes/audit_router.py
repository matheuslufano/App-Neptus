from fastapi import APIRouter
from app.controllers.v1.super import audit_controller
from fastapi import Depends
from app.utils.auth import get_admin_user

router = APIRouter(
    prefix="/v1/super/auditorias",
    tags=["Auditoria"],
    dependencies=[Depends(get_admin_user)]
)

router.get("", summary="Listar auditorias")(audit_controller.listar_auditorias)
router.get("/{audit_id}", summary="Detalhar auditoria")(audit_controller.buscar_auditoria)
