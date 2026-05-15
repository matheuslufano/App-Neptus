from app.exceptions.app_request_Exception import AppRequestError

class NotFoundRequestError(AppRequestError):
  status_code = 404
  def __init__(self, message="Requisicao não encontrada"):
    super().__init__(message, code="NotFoundRequestError", status_code=404)
