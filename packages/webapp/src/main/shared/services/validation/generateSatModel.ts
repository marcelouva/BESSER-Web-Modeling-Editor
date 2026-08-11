import { BACKEND_URL } from '../../constants/constant';
import { consumeSse } from './sseClient';

export interface GenerateSatStreamData {
  sat: boolean | null;
  done: boolean;
  message: string;
  scope?: number;
  errors?: string[];
  warnings?: string[];
  error?: string;
  object_model?: object | null;
}

/**
 * Stream the SAT instance generation from /generate-alloy-do-stream.
 *
 * The backend probes increasing scopes (5, 8, 9, 10) and emits SSE progress
 * events per scope. Each parsed event is forwarded to onMessage so the UI can
 * surface progress toasts. Throws if the HTTP request itself fails.
 */
export async function generateSatStream(
  model: object,
  title: string,
  onMessage: (data: GenerateSatStreamData) => void,
): Promise<void> {
  await consumeSse<GenerateSatStreamData>(
    `${BACKEND_URL}/generate-alloy-do-stream`,
    { title, model },
    onMessage,
  );
}
