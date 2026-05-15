class AppRequestError(Exception):
    def __init__(self, message, code="AppRequestError", status_code=400):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code

    def to_dict(self):
        return {
            "code": self.code,
            "message": self.message,
            "status": self.status_code
        }
