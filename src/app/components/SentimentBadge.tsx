import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

/**
 * Requester-sentiment chip shown in the ticket header — an emoji + label
 * summarising the emotional tone detected from the conversation. Prototype:
 * the value is derived deterministically from the record id so each ticket
 * shows a stable sentiment.
 */
const SENTIMENTS = [
  { emoji: '😊', label: 'Positive', bg: '#ECFDF5', text: '#059669' },
  { emoji: '🙂', label: 'Satisfied', bg: '#EFF8FF', text: '#175CD3' },
  { emoji: '😐', label: 'Neutral', bg: '#F3F4F6', text: '#4B5563' },
  { emoji: '😟', label: 'Negative', bg: '#FEF2F2', text: '#DC2626' },
  { emoji: '😠', label: 'Frustrated', bg: '#FEF2F2', text: '#B91C1C' },
];

export function getSentiment(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return SENTIMENTS[h % SENTIMENTS.length];
}

export function SentimentBadge({ id }: { id: string }) {
  const s = getSentiment(id);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 flex-shrink-0 cursor-default text-[12px] font-medium"
          style={{ backgroundColor: s.bg, color: s.text }}
        >
          <span className="text-[13px] leading-none">{s.emoji}</span>
          <span>{s.label}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>Requester sentiment: {s.label}</TooltipContent>
    </Tooltip>
  );
}
