import { useEffect, useRef } from 'react';

interface DiskChartProps {
  used: number;
  total: number;
  categories: {
    name: string;
    size: number;
    color: string;
  }[];
}

export function DiskChart({ used, total, categories }: DiskChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const percentage = Math.round((used / total) * 100);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    const innerRadius = radius * 0.65;

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw background ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 24;
    ctx.stroke();

    // Draw category segments
    let currentAngle = -Math.PI / 2;
    categories.forEach((category) => {
      const segmentAngle = (category.size / total) * Math.PI * 2;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + segmentAngle);
      ctx.strokeStyle = category.color;
      ctx.lineWidth = 24;
      ctx.lineCap = 'round';
      ctx.stroke();

      currentAngle += segmentAngle;
    });

    // Draw inner glow
    const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius * 0.5, centerX, centerY, innerRadius);
    gradient.addColorStop(0, 'rgba(255, 107, 53, 0.1)');
    gradient.addColorStop(1, 'transparent');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

  }, [categories, total]);

  return (
    <div className="relative w-64 h-64 mx-auto">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white">{percentage}%</span>
        <span className="text-sm text-gray-400 mt-1">Used</span>
      </div>
    </div>
  );
}
