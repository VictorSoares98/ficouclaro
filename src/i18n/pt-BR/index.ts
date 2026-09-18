export default {
  failed: 'Ação falhou',
  success: 'Ação bem-sucedida',
  errors: {
    auth: {
      invalid_credentials: 'Credenciais inválidas. Verifique seu e-mail e senha.',
      user_already_registered:
        'Se os dados estiverem corretos, você receberá um e-mail de confirmação.',
      weak_password: 'A senha deve ter no mínimo 6 caracteres.',
      email_not_confirmed: 'Seu e-mail ainda não foi confirmado.',
      jwt_expired: 'Sua sessão expirou por inatividade. Faça login novamente.',
      same_password: 'A nova senha deve ser diferente da antiga.',
    },
    database: {
      unique_violation: 'Esta ação já foi realizada ou o registro já existe.',
    },
    network: {
      rate_limit: 'Muitas tentativas simultâneas. Aguarde um momento e tente novamente.',
      offline: 'Sem conexão. Verifique sua internet (Wi-Fi/4G) e tente novamente.',
    },
    generic: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
  },
};
