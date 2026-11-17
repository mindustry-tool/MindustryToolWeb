'use client';

import { useMemo, useState } from 'react';
import type { CommunityServerSnapshotDto } from '@mindustry-tool/api';

interface PlayerSparklineProps {
  data?: CommunityServerSnapshotDto[];
  width?: number;
  height?: number;
  className?: string;
}

export function PlayerSparkline({
  data = [],
  width = 100,
  height = 24,
  className = '',
}: PlayerSparklineProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const points = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((d) => d.players);
  }, [data]);

  const max = useMemo(() => {
    if (points.length === 0) return 1;
    return Math.max(...points, 1);
  }, [points]);

  const { pathD, areaD, coordinates } = useMemo(() => {
    const w = width;
    const h = height;
    const padding = 2;
    const innerHeight = h - padding * 2;

    if (points.length < 2) {
      const y = h - padding - ((points[0] ?? 0) / max) * innerHeight;
      const coords = [{ x: 0, y }, { x: w, y }];
      return {
        pathD: `M 0,${y} L ${w},${y}`,
        areaD: `M 0,${y} L ${w},${y} L ${w},${h} L 0,${h} Z`,
        coordinates: coords,
      };
    }

    const step = w / (points.length - 1);
    const coords = points.map((val, idx) => {
      const x = idx * step;
      const y = h - padding - (val / max) * innerHeight;
      return { x, y };
    });

    const first = coords[0] ?? { x: 0, y: h - padding };
    let p = `M ${first.x.toFixed(1)},${first.y.toFixed(1)}`;
    for (let i = 1; i < coords.length; i++) {
      const pt = coords[i];
      if (pt) {
        p += ` L ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      }
    }

    const a = `${p} L ${w},${h} L 0,${h} Z`;
    return { pathD: p, areaD: a, coordinates: coords };
  }, [points, max, width, height]);

  const activePoint = hoverIndex !== null && coordinates[hoverIndex] ? coordinates[hoverIndex] : null;
  const activeData = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex] : null;

  return (
    <div
      className={`relative inline-flex items-center select-none ${className}`}
      onMouseLeave={() => setHoverIndex(null)}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
        style={{ width, height }}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const relativeX = (e.clientX - rect.left) / rect.width;
          const index = Math.min(
            points.length - 1,
            Math.max(0, Math.round(relativeX * (points.length - 1))),
          );
          setHoverIndex(index);
        }}
      >
        <path d={areaD} className="fill-primary/10" />
        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary/75 transition-colors"
        />
        {activePoint && (
          <circle
            cx={activePoint.x}
            cy={activePoint.y}
            r="2.5"
            className="fill-primary stroke-background"
            strokeWidth="1.5"
          />
        )}
      </svg>

      {activeData && activePoint && (
        <div
          className="absolute pointer-events-none -top-6 -translate-x-1/2 z-20 px-1.5 py-0.5 rounded bg-popover text-popover-foreground border text-[10px] font-mono shadow-xs whitespace-nowrap"
          style={{
            left: `${(activePoint.x / width) * 100}%`,
          }}
        >
          <span className="font-semibold text-primary">{activeData.players}</span>
          <span className="text-muted-foreground ml-0.5">p</span>
        </div>
      )}
    </div>
  );
}
