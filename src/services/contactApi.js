const CONTACT_API_URL =
  'https://missaemteresina.com.br/api/contatos/';

const REQUEST_TIMEOUT = 15000;

const FIELD_LABELS = {
  nome: 'Nome',
  name: 'Nome',
  email: 'E-mail',
  telefone: 'Telefone',
  phone: 'Telefone',
  contato: 'Contato',
  assunto: 'Assunto',
  subject: 'Assunto',
  mensagem: 'Mensagem',
  message: 'Mensagem',
  non_field_errors: 'Erro',
};

function normalizeValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Converte os campos usados no aplicativo para os campos esperados
 * pelo backend Django.
 */
function createContactPayload(formData) {
  const name = normalizeValue(
    formData?.name || formData?.nome
  );

  const email = normalizeValue(
    formData?.email
  ).toLowerCase();

  const phone = normalizeValue(
    formData?.phone || formData?.telefone
  );

  const subject = normalizeValue(
    formData?.subject || formData?.assunto
  );

  const message = normalizeValue(
    formData?.message || formData?.mensagem
  );

  /*
   * O serializer não possui o campo "assunto".
   * Por isso, ele é incorporado à mensagem.
   */
  const completeMessage = subject
    ? `Assunto: ${subject}\n\n${message}`
    : message;

  const payload = {
    nome: name,
    mensagem: completeMessage,
  };

  if (email) {
    payload.email = email;
  }

  if (phone) {
    payload.telefone = phone;
  }

  return payload;
}


function normalizeErrorMessages(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item))
      .filter(Boolean)
      .join(' ');
  }

  if (typeof value === 'string') {
    return value;
  }

  if (value && typeof value === 'object') {
    return Object.values(value)
      .flatMap((item) => normalizeErrorMessages(item))
      .filter(Boolean)
      .join(' ');
  }

  return '';
}

/**
 * Extrai mensagens retornadas pelo Django REST Framework.
 *
 * Exemplo:
 * {
 *   "email": ["Insira um endereço de email válido."],
 *   "mensagem": ["Este campo é obrigatório."]
 * }
 */
function getApiErrorMessage(data) {
  if (!data) {
    return 'O servidor não retornou detalhes sobre o erro.';
  }

  if (typeof data === 'string') {
    return data;
  }

  if (data.mensagem) {
    const message = normalizeErrorMessages(data.mensagem);

    if (message) {
      return message;
    }
  }

  if (data.detail) {
    const detail = normalizeErrorMessages(data.detail);

    if (detail) {
      return detail;
    }
  }

  if (data.erro) {
    const error = normalizeErrorMessages(data.erro);

    if (error) {
      return error;
    }
  }

  const fieldErrors = Object.entries(data)
    .map(([field, value]) => {
      const message = normalizeErrorMessages(value);

      if (!message) {
        return null;
      }

      const label = FIELD_LABELS[field] || field;

      return `${label}: ${message}`;
    })
    .filter(Boolean);

  if (fieldErrors.length) {
    return fieldErrors.join('\n');
  }

  return 'Não foi possível enviar a mensagem.';
}

export class ContactApiError extends Error {
  constructor(message, options = {}) {
    super(message);

    this.name = 'ContactApiError';
    this.status = options.status;
    this.data = options.data;
  }
}

export async function sendContactMessage(formData) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  try {
    const response = await fetch(CONTACT_API_URL, {
      method: 'POST',

      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(createContactPayload(formData)),
      signal: controller.signal,
    });

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new ContactApiError(getApiErrorMessage(data), {
        status: response.status,
        data,
      });
    }

    return data;
  } catch (error) {
    if (error instanceof ContactApiError) {
      throw error;
    }

    if (error?.name === 'AbortError') {
      throw new ContactApiError(
        'O servidor demorou muito para responder. Verifique sua conexão e tente novamente.'
      );
    }

    if (error instanceof TypeError) {
      throw new ContactApiError(
        'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'
      );
    }

    throw new ContactApiError(
      error?.message || 'Ocorreu um erro inesperado ao enviar a mensagem.'
    );
  } finally {
    clearTimeout(timeoutId);
  }
}