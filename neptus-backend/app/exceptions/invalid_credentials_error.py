from app.exceptions.app_request_Exception import AppRequestError

class InvalidCredentialsError(AppRequestError):
  status_code = 401
  def __init__(self, message="Credenciais inválidas"):
    super().__init__(message, code="InvalidCredentialsError", status_code=401)
