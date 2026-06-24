import React, { useContext, useState } from 'react';
import { Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApollonEditorContext } from '../../../features/editors/uml/apollon-editor-context';

interface AutoLayoutButtonProps {
  outlineButtonClass?: string;
}

/**
 * Triggers ELK-based auto-layout on the current diagram via the editor's
 * public `autoLayout()` method. The method is a no-op for non-class diagrams,
 * so the button is safe to show everywhere.
 */
export const AutoLayoutButton: React.FC<AutoLayoutButtonProps> = ({ outlineButtonClass }) => {
  const { editor } = useContext(ApollonEditorContext);
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (!editor || busy) {
      return;
    }
    setBusy(true);
    try {
      await editor.autoLayout();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={`gap-2 ${outlineButtonClass ?? ''}`}
      onClick={handleClick}
      disabled={!editor || busy}
      title="Auto-arrange the class diagram (ELK)"
    >
      <Network className="size-4" />
      <span className="hidden xl:inline">Auto-layout</span>
    </Button>
  );
};
