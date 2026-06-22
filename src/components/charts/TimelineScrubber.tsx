import React, { useState, useCallback, useRef } from 'react';
import timelineData from '../../mock/timelineHistory.json';

interface TimelineDataItem {
  minuteOfDay: number;
  congestionLevel: number;
}

const typedTimelineData = timelineData as TimelineDataItem[];

// Sample 1440 minutes into 72 bars (20-min increments)
const bars = Array.from({ length: 72 }, (_, i) => {
  const startMin = i * 20;
  const endMin = startMin + 20;
  const slice = typedTimelineData.filter(
    (d) => d.minuteOfDay >= startMin && d.minuteOfDay < endMin
  );
  const avg = slice.length > 0 ? slice.reduce((s: number, d) => s + d.congestionLevel, 0) / slice.length : 0;
  return { barIdx: i, minuteOfDay: startMin, congestionLevel: Math.round(avg) };
});

const getColor = (level: number) => {
  if (level >= 70) return '#D6364F';
  if (level >= 40) return '#C77D12';
  return '#0F8B6C';
};

const formatTime = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

export const TimelineScrubber: React.FC<{ className?: string }> = ({ className }) => {
  // Current scrub position as minute of day. Default to ~10AM (600)
  const [scrubMin, setScrubMin] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const currentBarIdx = Math.floor(scrubMin / 20);

  const updateFromPointer = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setScrubMin(Math.round(pct * 1440));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX);
  }, [updateFromPointer]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updateFromPointer(e.clientX);
  }, [updateFromPointer]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Arrow key support
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') setScrubMin((p) => Math.min(1440, p + 20));
    if (e.key === 'ArrowLeft') setScrubMin((p) => Math.max(0, p - 20));
  }, []);

  const scrubPct = (scrubMin / 1440) * 100;

  return (
    <div className={`bg-bg-surface border border-border-subtle rounded-xl p-4 shadow-sm ${className || ''}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-display font-semibold text-text-primary">24-Hour Timeline</h3>
        <span className="text-xs font-mono text-text-tertiary">Drag to scrub</span>
      </div>

      <div
        ref={containerRef}
        className="relative h-20 flex items-end gap-px cursor-col-resize select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={1440}
        aria-valuenow={scrubMin}
        aria-label="Timeline scrubber"
      >
        {bars.map((bar, i) => {
          const isFuture = i > currentBarIdx;
          const barColor = getColor(bar.congestionLevel);
          const height = `${Math.max(8, bar.congestionLevel)}%`;

          return (
            <div
              key={i}
              className="flex-1 rounded-t-sm relative overflow-hidden"
              style={{
                height,
                backgroundColor: barColor,
                opacity: isFuture ? 0.4 : 1,
              }}
            >
              {isFuture && bar.congestionLevel >= 40 && (
                <div
                  className="absolute inset-0"
                  style={{
                    background: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)`,
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Scrubber handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-text-primary z-10 pointer-events-none"
          style={{ left: `${scrubPct}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-text-primary text-white text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md whitespace-nowrap">
            {formatTime(scrubMin)}
          </div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-text-primary rounded-full border-2 border-white shadow" />
        </div>
      </div>

      {/* Time labels */}
      <div className="flex justify-between mt-1">
        {['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM', '12 AM'].map((t, i) => (
          <span key={i} className="text-[10px] text-text-tertiary font-mono">{t}</span>
        ))}
      </div>
    </div>
  );
};
