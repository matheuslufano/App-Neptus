from fastapi import APIRouter
from app.controllers.v1 import propriedade_controller

router = APIRouter(prefix="/v1/propriedades", tags=["Propriedades"])

router.post("/usuarios/convites", summary="Convidar usuário para propriedade")(propriedade_controller.convidar_usuario)
router.post("/usuarios/convites/aceite", summary="Aceitar convite de propriedade")(propriedade_controller.convite_aceito)
