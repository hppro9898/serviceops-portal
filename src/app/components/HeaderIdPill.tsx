import { useState, useRef, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

/**
 * The blue ID pill shown before the subject in every detail-drawer header.
 * Clicking it copies the ID; on hover it reveals a copy icon, and after a copy
 * it briefly shows a green check + "Copied!" tooltip.
 */
export function HeaderIdPill({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const handleCopy = () => {
    try {
      void navigator.clipboard?.writeText(id)?.catch(() => {});
    } catch {
      /* clipboard unavailable — prototype, ignore */
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Tooltip open={copied || undefined}>
      <TooltipTrigger asChild>
        <button
          onClick={handleCopy}
          className="group/id relative inline-flex items-center rounded bg-[#e8f4fd] px-2 py-0.5 text-[13px] font-semibold text-[#3D8BD0] flex-shrink-0 hover:bg-[#d0e8f9] transition-colors"
        >
          <span>{id}</span>
          {/* Copy/check overlays the right edge on hover — a soft gradient fades the text under it (no layout shift) */}
          <span
            className={`absolute inset-y-0 right-0 flex items-center rounded-r pl-6 pr-2 transition-opacity duration-150 ${copied ? 'opacity-100' : 'opacity-0 group-hover/id:opacity-100'}`}
            style={{ background: 'linear-gradient(to right, rgba(208,232,249,0) 0%, #D0E8F9 55%)' }}
          >
            {copied ? <Check size={12} className="text-[#22A06B]" /> : <Copy size={12} />}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{copied ? 'Copied!' : 'Copy ID'}</TooltipContent>
    </Tooltip>
  );
}
