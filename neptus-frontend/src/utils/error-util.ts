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
  const rawMessage = messageParts.join(":").trim();
  const normalizedMessage = rawMessage.toLowerCase();

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

  if (
    normalizedMessage.includes("body.email") &&
    normalizedMessage.includes("valid email address")
  ) {
    return "Informe um e-mail válido. Evite domínios reservados, como .local.";
  }

  if (normalizedMessage.includes("permissões inválidas")) {
    return "Há permissões inválidas no perfil. Revise as permissões selecionadas.";
  }

  if (normalizedMessage.includes("email já cadastrado")) {
    return "Este e-mail já está cadastrado.";
  }

  if (error instanceof ApiError && error.statusCode === 401) {
    return "Sua sessão expirou ou você não tem autorização. Faça login novamente.";
  }

  if (error instanceof ApiError && error.statusCode === 403) {
    return "Você não tem permissão para realizar esta ação.";
  }

  return messages[code] ?? (rawMessage || error.message);
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
    return getFriendlyMessage(error) || error.message || "Erro desconhecido";
  }

  return "Erro desconhecido";
};
