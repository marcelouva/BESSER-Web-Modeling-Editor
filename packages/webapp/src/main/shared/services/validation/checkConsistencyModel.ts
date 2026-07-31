import { BACKEND_URL } from '../../constants/constant';
import { toast } from 'react-toastify';
import type { CSSProperties } from 'react';

const TOAST_STYLE: CSSProperties = {
  fontSize: "16px",
  padding: "20px",
  width: "100%",
  boxSizing: "border-box",
  whiteSpace: "pre-line",
  maxHeight: "600px",
  overflow: "auto",
  overflowWrap: "anywhere",
  wordBreak: "break-word"
};


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
  }) => void
): Promise<void> {
  const response = await fetch(`${BACKEND_URL}/check-alloy-consistency-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, model }),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value);
    const lines = text.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          onMessage(data);
        } catch {
        }
      }
    }
  }
}


export async function checkConsistency(
  model: object,
  title: string = 'diagram'
): Promise<{ sat: boolean | null; message: string; objectDiagram?: object | null }> {  
  const TOAST_LOADING_ID = 'sat-consistency-check-loading';

  toast.loading("Running SAT consistency check...", {
    toastId: TOAST_LOADING_ID,
    position: "top-right",
    theme: "dark",
  });

  try {
    const response = await fetch(`${BACKEND_URL}/check-alloy-consistency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, model }),
    });

    // Quit the running loading toast when the response is received
    toast.dismiss(TOAST_LOADING_ID);

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const result = await response.json();

    if (result.sat === true) {
      toast.success(result.message || "✅ SAT Consistency Check OK: The model is satisfiable.", {
        position: "top-right",
        autoClose: 5000,
        theme: "dark",
        style: TOAST_STYLE
      });
    } else {
      const checkType = result.sat === false ? 'error' : 'info';
      const defaultMsg = result.sat === false
        ? "❌ SAT Consistency Check Failed: The model is unsatisfiable."
        : "⚠️ The satisfiability of the model could not be determined.";
      toast[checkType](result.message || defaultMsg, {
        position: "top-right",
        autoClose: checkType === 'error' ? false : 5000,
        theme: "dark",
        style: TOAST_STYLE
      });
      if (result.errors?.length) {
        toast.error(`❌ Error found:\n\n${result.errors.join('\n\n')}`, {
          position: "top-right",
          autoClose: false,
          theme: "dark",
          style: TOAST_STYLE,
        });
      }
    }

    return result;

  } catch (error: unknown) {
    
    toast.dismiss(TOAST_LOADING_ID);
    
    const errorMessage = error instanceof Error ? error.message : 'Error unknown.';
    toast.error(`❌ Error in the SAT consistency check: ${errorMessage}`, {
      position: "top-right",
      autoClose: 5000,
      theme: "dark"
    });

    throw error;
  }
}