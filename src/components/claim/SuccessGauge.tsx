import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SuccessGaugeProps {
  probability: number;
  size?: 'sm' | 'lg';
}

export default function SuccessGauge({ probability, size = 'lg' }: SuccessGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(probability), 100);
    return () => clearTimeout(timer);
  }, [probability]);

  const getColor = (value: number) => {
    if (value >= 70) return { stroke: 'hsl(var(--success, 142 71% 45%))', text: 'text-green-600', label: 'Alta' };
    if (value >= 40) return { stroke: 'hsl(var(--warning, 38 92% 50%))', text: 'text-amber-600', label: 'Media' };
    return { stroke: 'hsl(var(--destructive))', text: 'text-red-600', label: 'Baja' };
  };

  const color = getColor(probability);
  const isLg = size === 'lg';
  const svgSize = isLg ? 160 : 80;
  const strokeWidth = isLg ? 12 : 6;
  const radius = (svgSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (animatedValue / 100) * circumference;

  return (
    <div className={cn('flex flex-col items-center gap-2', isLg && 'gap-3')}>
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold', color.text, isLg ? 'text-3xl' : 'text-lg')}>
            {animatedValue}%
          </span>
          {isLg && <span className={cn('text-xs', color.text)}>{color.label}</span>}
        </div>
      </div>
      {isLg && (
        <p className="text-sm text-muted-foreground text-center max-w-[200px]">
          Probabilidad estimada de éxito
        </p>
      )}
    </div>
  );
}
