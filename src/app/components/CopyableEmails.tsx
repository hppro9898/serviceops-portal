import { toast } from 'sonner';

const EMAIL_RE = /([\w.+-]+@[\w.-]+\.\w+)/g;

/**
 * Renders a text fragment with every email address inside it click-to-copy.
 * Used in the conversation headers ("Forwarded to …", "Replied to …"), their
 * recipient tooltips, and the trimmed-message To line — clicking an address
 * copies it to the clipboard with a toast, without disturbing the layout.
 */
export function CopyableEmails({ text }: { text: string }) {
  const parts = text.split(EMAIL_RE);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span
            key={i}
            role="button"
            title="Click to copy"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard?.writeText(part).then(
                () => toast.success(`Copied ${part}`),
                () => toast.error('Could not copy email'),
              );
            }}
            className="cursor-pointer underline-offset-2 hover:underline"
          >
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
