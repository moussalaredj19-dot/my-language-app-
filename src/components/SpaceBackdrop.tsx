import { useMemo } from 'react';

interface StarPoint {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
  glow: boolean;
}

export default function SpaceBackdrop() {
  const stars = useMemo<StarPoint[]>(() => {
    const palette = ['#FFFFFF', '#E0F2FE', '#BAE6FD', '#FEF3C7', '#D1FAE5'];
    return Array.from({ length: 110 }, (_, idx) => {
      // Deterministic pseudo-random spread so SSR/re-renders never jump
      const seed1 = Math.sin(idx * 12.9898) * 43758.5453;
      const seed2 = Math.sin(idx * 78.233 + 1.7) * 28461.192;
      const seed3 = Math.sin(idx * 39.425 + 4.1) * 19283.741;
      const rx = seed1 - Math.floor(seed1);
      const ry = seed2 - Math.floor(seed2);
      const rs = seed3 - Math.floor(seed3);
      const isBright = idx % 7 === 0;

      return {
        id: idx,
        x: Math.round(rx * 1000) / 10,
        y: Math.round(ry * 1000) / 10,
        size: isBright ? 2.6 + rs * 1.4 : 1.1 + rs * 1.4,
        delay: Math.round((rs * 4) * 10) / 10,
        duration: 2.2 + Math.round((rs * 3.4) * 10) / 10,
        color: palette[idx % palette.length],
        glow: isBright,
      };
    });
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden bg-[#02040a]"
    >
      {/* Subtle deep-cosmos depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(16, 185, 129, 0.14) 0%, rgba(14, 116, 144, 0.1) 28%, rgba(2, 4, 10, 0.94) 68%, #000000 100%)',
        }}
      />

      {/* Twinkling starfield */}
      {stars.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full animate-space-twinkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            backgroundColor: s.color,
            boxShadow: s.glow ? `0 0 10px 2px ${s.color}` : `0 0 4px ${s.color}`,
            animationDelay: `${s.delay}s`,
            ['--twinkle-dur' as string]: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
