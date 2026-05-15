from fastapi import APIRouter
from app.controllers.v1 import leitura_controller

router = APIRouter(prefix="/v1", tags=["Leituras"])

router.get("/tanques/{tanque_id}/leituras", summary="Listar leituras do tanque")(leitura_controller.listar_leituras)
router.get("/leituras/{leitura_id}", summary="Buscar leitura específica")(leitura_controller.buscar_leitura)
router.post("/leituras", summary="Criar nova leitura")(leitura_controller.criar_leitura)
router.put("/leituras/{leitura_id}", summary="Atualizar leitura")(leitura_controller.atualizar_leitura)
router.delete("/leituras/{leitura_id}", summary="Deletar leitura")(leitura_controller.deletar_leitura)
