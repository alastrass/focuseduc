import { useEffect, useState, useCallback } from 'react';

type Particle = {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotate: number;
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16'];

let nextId = 0;

export function useConfetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  const trigger = useCallback((originX?: number) => {
    const count = 22;
    const baseX = originX ?? 50;
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: nextId++,
      x: baseX + (Math.random() - 0.5) * 60,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 6,
      delay: Math.random() * 300,
      duration: 900 + Math.random() * 600,
      rotate: Math.random() * 360,
    }));

    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1800);
  }, []);

  return { trigger, particles };
}

export default function Confetti({ particles }: { particles: Particle[] }) {
  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            bottom: '40%',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confettiFly ${p.duration}ms ease-out ${p.delay}ms forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFly {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          60% { opacity: 1; }
          100% { transform: translateY(-280px) translateX(${Math.random() > 0.5 ? '' : '-'}${Math.floor(Math.random() * 80 + 20)}px) rotate(${Math.floor(Math.random() * 720)}deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
