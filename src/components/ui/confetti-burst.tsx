"use client";

import { useMemo, type CSSProperties } from "react";

function seededUnit(seed: number) {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
}

const COLORS = ["#FF4566", "#7B5FFF", "#00E5CC", "#FFB800", "#FFFFFF", "#FF4566"];

export function ConfettiBurst({ trigger, count = 70 }: { trigger: number; count?: number }) {
  const pieces = useMemo(() => {
    if (!trigger) return [];
    return Array.from({ length: count }, (_, index) => ({
      id: `${trigger}-${index}`,
      color: COLORS[index % COLORS.length],
      x: Math.round(seededUnit(trigger * 101 + index * 13) * 560 - 280),
      y: Math.round(seededUnit(trigger * 103 + index * 17) * 300 - 240),
      rotate: Math.round(seededUnit(trigger * 107 + index * 19) * 720 - 360),
      delay: index * 8,
      width: 6 + seededUnit(trigger * 109 + index * 23) * 6,
      height: 10 + seededUnit(trigger * 113 + index * 29) * 8,
    }));
  }, [trigger, count]);

  if (!pieces.length) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="scout-confetti-piece absolute left-1/2 top-1/2 block rounded-sm"
          style={
            {
              "--tx": `${piece.x}px`,
              "--ty": `${piece.y}px`,
              "--rot": `${piece.rotate}deg`,
              animationDelay: `${piece.delay}ms`,
              backgroundColor: piece.color,
              width: piece.width,
              height: piece.height,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
