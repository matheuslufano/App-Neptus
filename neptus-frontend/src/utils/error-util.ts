import { ApiError } from "next/dist/server/api-utils";

export const errorCodes = {
  INVALID_CREDENTIALS_ERROR: "InvalidCredentialsError",
  NOT_FOUND_REQUEST_ERROR: "NotFoundRequestError",
  TOKEN_EXPIRED: "TokenExpired",
  CONFLICT_REQUEST_ERROR: "ConflictRequestError",
  USER_DISABLED_ERROR: "UserDisabledError",
} as const;

export const getFriendlyMessage = (error: ApiError | Error): string => {
  const [code, ...messageParts] = error.message.split(":");

  const messages: Record<string, string> = {
    [errorCodes.INVALID_CREDENTIALS_ERROR]:
      "Email ou senha inválidos, tente novamente",
    [errorCodes.NOT_FOUND_REQUEST_ERROR]:
      "Usuário ainda não cadastrado, tente novamente",
    [errorCodes.TOKEN_EXPIRED]: "Sessão expirada. Faça login novamente",
    [errorCodes.CONFLICT_REQUEST_ERROR]: "Email já cadastrado, faça o login",
    [errorCodes.USER_DISABLED_ERROR]:
      "Usuário está desativado, entre em contato com o suporte",
  };

  return messages[code];
};

export const formatAndThrowError = (
  error: unknown,
  defaultMessage = "Ocorreu um erro inesperado"
): never => {
  if (error instanceof ApiError) {
    console.error(`Erro ${error.statusCode} -`, error);
    throw error;
  }
  console.error(error);
  throw new ApiError(500, `UnknownError: ${defaultMessage}`);
};

export const parseErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError || error instanceof Error) {
    return getFriendlyMessage(error);
  }

  return "Erro desconhecido";
};
