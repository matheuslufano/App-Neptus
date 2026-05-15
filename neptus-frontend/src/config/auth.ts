// Configurações de desenvolvimento e autenticação

export const devConfig = {
  // Para habilitar modo de desenvolvimento (sem autenticação), mude para true
  // Útil para testes sem internet ou demonstrações
  isDevelopmentMode: process.env.NEXT_PUBLIC_DEV_MODE === "true",

  // Duração da sessão offline em horas
  offlineSessionDurationHours: 24,

  // URL de redirecionamento após login
  defaultRedirectAfterLogin: "/",

  // Configurações de debug
  enableAuthLogs: process.env.NODE_ENV === "development",
};

export const authConfig = {
  // Determina se a autenticação é obrigatória
  isAuthRequired: () => {
    // Em modo de desenvolvimento, auth não é necessária
    if (devConfig.isDevelopmentMode) {
      return false;
    }
    return true;
  },

  // Usuário padrão para modo de desenvolvimento
  defaultDevUser: {
    name: "Usuário de Desenvolvimento",
    email: "dev@neptus.local",
    image: null,
  },
};
