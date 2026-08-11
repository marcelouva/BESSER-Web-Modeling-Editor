import { BACKEND_URL } from '../../constants/constant';
import { consumeSse } from './sseClient';

export async function checkConsistencyStream(
  model: object,
  title: string,
  onMessage: (data: {
    sat: boolean | null;
    done: boolean;
    message: string;
    scope?: number;
    errors?: string[];
    warnings?: string[];
  }) => void,
): Promise<void> {
  await consumeSse(
    `${BACKEND_URL}/check-alloy-consistency-stream`,
    { title, model },
    onMessage,
  );
}
