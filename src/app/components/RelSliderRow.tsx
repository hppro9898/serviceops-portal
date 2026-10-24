import { Info } from 'lucide-react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

/* Slider row for the Relationship "Advanced Configuration" panel: label + info tooltip,
 * range slider with min/max scale labels, and a numeric readout box. */
export function RelSliderRow({ label, info, min, max, step, value, onChange }: { label: string; info: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[13px] font-medium text-[#64748B]">{label}</span>
        <span className="text-[#EF4444]">*</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-default text-[#9CA3AF]"><Info size={13} /></span>
          </TooltipTrigger>
          <TooltipContent className="max-w-[240px]">{info}</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SliderPrimitive.Root
            className="group relative flex h-5 w-full touch-none select-none items-center"
            min={min}
            max={max}
            step={step}
            value={[value]}
            onValueChange={(v) => onChange(v[0])}
          >
            <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-[#E8EDF3]">
              <SliderPrimitive.Range className="absolute h-full rounded-full bg-gradient-to-r from-[#3D8BD0] to-[#6FB1E8]" />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb className="relative block size-4 cursor-grab rounded-full border-2 border-[#3D8BD0] bg-white shadow-[0_1px_4px_rgba(61,139,208,0.45)] outline-none transition-[transform,box-shadow] duration-100 hover:scale-110 hover:ring-4 hover:ring-[#3D8BD0]/15 focus-visible:ring-4 focus-visible:ring-[#3D8BD0]/25 active:scale-110 active:cursor-grabbing active:ring-4 active:ring-[#3D8BD0]/25">
              {/* Value bubble — appears while hovering/dragging the slider */}
              <span className="pointer-events-none absolute -top-[30px] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1E293B] px-2 py-0.5 text-[11px] font-semibold text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100">
                {value}
                <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-[#1E293B]" />
              </span>
            </SliderPrimitive.Thumb>
          </SliderPrimitive.Root>
          <div className="flex justify-between text-[11px] text-[#9CA3AF] mt-1">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => { const v = +e.target.value; if (!Number.isNaN(v)) onChange(Math.min(max, Math.max(min, v))); }}
          className="w-[68px] h-8 px-2 border border-[#DFE5ED] rounded text-[13px] text-right text-[#364658] outline-none focus:border-[#3D8BD0] focus:ring-1 focus:ring-[#3D8BD0]"
        />
      </div>
    </div>
  );
}
