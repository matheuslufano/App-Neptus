from fastapi import APIRouter
from app.controllers.v1.super import (
    perfil_controller,
    propriedade_controller,
    usuario_controller,
    tanque_controller
)

router = APIRouter(prefix="/v1/super", tags=["Super Admin"])

# Perfis
router.post("/perfis", summary="Criar novo perfil")(perfil_controller.salvar_perfil)
router.get("/perfis", summary="Listar perfis")(perfil_controller.listar_perfil)
router.put("/perfis/{id}", summary="Atualizar perfil")(perfil_controller.atualizar_perfil)
router.delete("/perfis/{id}", summary="Deletar perfil")(perfil_controller.deletar_perfil)
router.get("/perfis/{id}", summary="Buscar perfil específico")(perfil_controller.buscar_perfil)

# Usuários
router.get("/usuarios/relatorio", summary="Gerar relatório de usuários")(usuario_controller.relatorio_usuarios)
router.post("/usuarios", summary="Criar usuário manual")(usuario_controller.salvar_usuario)
router.get("/usuarios", summary="Listar todos os usuários")(usuario_controller.listar_usuarios)
router.put("/usuarios/{id}", summary="Atualizar dados do usuário")(usuario_controller.atualizar_usuario)
router.patch("/usuarios/{id}", summary="Alterar status do usuário")(usuario_controller.status_usuario)
router.get("/usuarios/{id}", summary="Buscar usuário por ID")(usuario_controller.buscar_usuario)

# Propriedades
router.post("/propriedades", summary="Cadastrar propriedade")(propriedade_controller.cadastrar_propriedade)
router.get("/propriedades", summary="Listar propriedades")(propriedade_controller.listar_propriedades)
router.put("/propriedades/{id}", summary="Atualizar propriedade")(propriedade_controller.atualizar_propriedade)
router.get("/propriedades/{id}", summary="Detalhar propriedade")(propriedade_controller.detalhar_propriedade)
router.post("/propriedades/usuarios/adicionar", summary="Adicionar usuário à propriedade")(propriedade_controller.adicionar_usuario)
router.delete("/propriedades/{propriedade_id}/usuarios/{usuario_id}", summary="Remover usuário da propriedade")(propriedade_controller.remover_usuario)

# Tanques
router.post("/tanques", summary="Cadastrar tanque")(tanque_controller.cadastrar_tanque)
router.get("/tanques", summary="Listar tanques")(tanque_controller.listar_tanques)
router.put("/tanques/{id}", summary="Atualizar tanque")(tanque_controller.atualizar_tanque)
router.get("/tanques/{id}", summary="Detalhar tanque")(tanque_controller.detalhar_tanque)
router.patch("/tanques/{id}/status", summary="Alterar status do tanque")(tanque_controller.status_tanque)
