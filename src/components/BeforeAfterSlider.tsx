import { useRef, useState } from 'react';
import { ArrowLeftRight, ImageOff } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeUrl: string;
  afterUrl: string;
  beforeCaption: string;
  afterCaption: string;
  heightClass?: string;
}

export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeCaption,
  afterCaption,
  heightClass = 'h-64',
}: BeforeAfterSliderProps) {
  const [splitPct, setSplitPct] = useState(50);
  const [beforeError, setBeforeError] = useState(false);
  const [afterError, setAfterError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateFromClientX = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return;
    const rawPct = ((clientX - rect.left) / rect.width) * 100;
    setSplitPct(Math.max(5, Math.min(95, Math.round(rawPct))));
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={containerRef}
        onPointerDown={(e) => {
          updateFromClientX(e.clientX);
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) {
            updateFromClientX(e.clientX);
          }
        }}
        className={`relative w-full select-none overflow-hidden rounded-lg border border-[#22304A] bg-[#0F172A] ${heightClass}`}
      >
        {/* Base Layer: AFTER Image */}
        {afterError ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-[#0F172A] text-[#64748B]">
            <ImageOff className="h-6 w-6 mb-1" />
            <span className="text-xs">After verification image unavailable</span>
          </div>
        ) : (
          <img
            src={afterUrl}
            alt={afterCaption}
            referrerPolicy="no-referrer"
            onError={() => setAfterError(true)}
            className="h-full w-full object-cover"
            draggable={false}
          />
        )}

        {/* Clipped Layer: BEFORE Image */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - splitPct}% 0 0)` }}
        >
          {beforeError ? (
            <div className="flex h-full w-full flex-col items-center justify-center bg-[#151D2E] text-[#64748B]">
              <ImageOff className="h-6 w-6 mb-1" />
              <span className="text-xs">Before image unavailable</span>
            </div>
          ) : (
            <img
              src={beforeUrl}
              alt={beforeCaption}
              referrerPolicy="no-referrer"
              onError={() => setBeforeError(true)}
              className="h-full w-full object-cover"
              draggable={false}
            />
          )}
        </div>

        {/* Contrast Scrim & Labels */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 py-2.5 text-xs">
          <div className="max-w-[45%]">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#F59E0B]">
              Before
            </span>
            <p className="truncate text-[#F3F4F6]">{beforeCaption}</p>
          </div>
          <div className="max-w-[45%] text-right">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#10B981]">
              After
            </span>
            <p className="truncate text-[#F3F4F6]">{afterCaption}</p>
          </div>
        </div>

        {/* 2px Vertical Cyan Divider & Circular Pill Grip */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-[2px] -translate-x-1/2 bg-[#06B6D4] shadow-[0_0_12px_rgba(6,182,212,0.75)]"
          style={{ left: `${splitPct}%` }}
        >
          <div className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#06B6D4] bg-[#090D18]/90 text-[#06B6D4] shadow-lg">
            <ArrowLeftRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Keyboard-Accessible Range Control */}
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="comparison-split-range" className="font-mono text-[11px] text-[#9CA3AF]">
          Comparison Split
        </label>
        <input
          id="comparison-split-range"
          type="range"
          min={5}
          max={95}
          value={splitPct}
          onChange={(e) => setSplitPct(Number(e.target.value))}
          aria-label="Before and after comparison split percentage"
          className="h-1.5 flex-1 cursor-pointer accent-[#06B6D4]"
        />
        <span className="w-10 text-right font-mono text-[11px] tabular-nums text-[#06B6D4]">
          {splitPct}%
        </span>
      </div>
    </div>
  );
}
