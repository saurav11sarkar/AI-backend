import { APIError } from 'openai';
import { TErrorSource } from '../interface/error.interface';

export function isOpenAiError(err: unknown): err is APIError {
  return err instanceof APIError;
}

export function handleOpenAiError(err: APIError): {
  statusCode: number;
  message: string;
  errorSources: TErrorSource[];
} {
  if (err.status === 429) {
    return {
      statusCode: 503,
      message: 'AI service is temporarily unavailable',
      errorSources: [
        {
          path: 'ai',
          message:
            'The AI provider rejected the request due to a quota/rate limit. Please check the OpenAI account billing/limits and try again later.',
        },
      ],
    };
  }

  if (err.status === 401) {
    return {
      statusCode: 503,
      message: 'AI service is misconfigured',
      errorSources: [
        { path: 'ai', message: 'Invalid or missing AI provider credentials' },
      ],
    };
  }

  const statusCode =
    err.status && err.status >= 400 && err.status < 600 ? err.status : 502;

  return {
    statusCode,
    message: 'AI service error',
    errorSources: [{ path: 'ai', message: err.message ?? 'AI provider error' }],
  };
}
