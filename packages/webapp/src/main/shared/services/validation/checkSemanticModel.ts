import { BACKEND_URL } from '../../constants/constant';
import { toast } from 'react-toastify';
import type { CSSProperties } from 'react';

// Reutilizamos el estilo limpio y scrolleable que usas en el otro validador
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

export async function checkSemanticModel(
  model: object,
  title: string = 'diagram'
): Promise<{ sat: boolean | null; message: string }> {
  
  const TOAST_LOADING_ID = 'semantic-check-loading';

  toast.loading("Running semantic check...", {
    toastId: TOAST_LOADING_ID,
    position: "top-right",
    theme: "dark",
  });

  try {
    const response = await fetch(`${BACKEND_URL}/check-alloy-sat`, {
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
      // The model is SAT
      toast.success(result.message || "✅ Semantic Check OK: The model is satisfiable.", {
        position: "top-right",
        autoClose: 5000,
        theme: "dark",
        style: TOAST_STYLE
      });
    } else if (result.sat === false) {
      // The model is UNSAT
      toast.error(result.message || "❌ Semantic Check Failed: The model is unsatisfiable.", {
        position: "top-right",
        autoClose: false, 
        theme: "dark",
        style: TOAST_STYLE
      });
    } else {
      // Case sat === null (e.g., When it's not a Class Diagram or no commands were generated)
      toast.info(result.message || "⚠️ The satisfiability of the model could not be determined.", {
        position: "top-right",
        autoClose: 5000,
        theme: "dark",
        style: TOAST_STYLE
      });
    }

    return result;

  } catch (error: unknown) {
    
    toast.dismiss(TOAST_LOADING_ID);
    
    const errorMessage = error instanceof Error ? error.message : 'Error unknown.';
    toast.error(`❌ Error in the semantic check: ${errorMessage}`, {
      position: "top-right",
      autoClose: 5000,
      theme: "dark"
    });

    throw error;
  }
}