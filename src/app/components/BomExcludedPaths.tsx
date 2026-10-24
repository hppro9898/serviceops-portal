import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';

/* One exclude pattern inline, the rest behind a +N chip whose hover lists them all.
 * Shared by the Manage-scan-paths table and the components drawer so both read identically. */

export function BomExcludedPaths({ paths }: { paths: string[] }) {
  if (!paths.length) return <span className="text-[12px] text-[#9ca3af]">—</span>;
  const [first, ...rest] = paths;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="max-w-[150px] truncate rounded-sm bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[11px] text-[#475467]"
        title={first}
      >{first}</span>
      {rest.length > 0 && (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <span className="cursor-default rounded-sm bg-[#EEF2F6] px-1.5 py-0.5 text-[11px] font-semibold text-[#64748B] transition-colors hover:bg-[#E2E8F0]">
              +{rest.length}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-wrap">
            <span className="flex flex-col gap-0.5 font-mono text-[12px]">
              {rest.map((p) => <span key={p}>{p}</span>)}
            </span>
          </TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}
