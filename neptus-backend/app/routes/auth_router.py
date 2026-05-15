from fastapi import APIRouter
from app.controllers.v1 import auth_controller

router = APIRouter(prefix="/auth", tags=["Authentication"])

router.post("/register", summary="Registrar novo usuário")(auth_controller.register)
router.post("/login", summary="Login de usuário")(auth_controller.login)
router.post("/refresh", summary="Atualizar access token")(auth_controller.refresh_token)
router.post("/forgot-password", summary="Solicitar recuperação de senha")(auth_controller.reset_password_request)
router.post("/reset-password", summary="Redefinir senha")(auth_controller.reset_password)
router.post("/login/google", summary="Login via Google")(auth_controller.authorize_google)
