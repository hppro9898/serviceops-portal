import { MessageSquare } from 'lucide-react';
import { useState } from 'react';

interface ConversationEmptyStateProps {
  onAcknowledge: () => void;
}

export function ConversationEmptyState({ onAcknowledge }: ConversationEmptyStateProps) {
  const [showButton, setShowButton] = useState(true);

  const handleAcknowledge = () => {
    setShowButton(false);
    onAcknowledge();
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="inline-flex items-center justify-center size-16 rounded-full bg-[#F5F7FA] mb-4">
        <MessageSquare className="size-8 text-[#7B8FA5]" />
      </div>
      <h3 className="text-[14px] font-semibold text-[#364658] mb-2">No Conversations Yet</h3>
      <p className="text-[13px] text-[#7B8FA5] max-w-[300px] mb-4">
        Conversations and activities will appear here once the ticket has interactions.
      </p>
      {showButton && (
        <button
          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-[#DFE5ED] text-[#364658] rounded hover:bg-[#F5F7FA] hover:border-[#3D8BD0] transition-colors text-sm font-medium hidden"
          onClick={handleAcknowledge}
        >
          Acknowledge
        </button>
      )}
    </div>
  );
}