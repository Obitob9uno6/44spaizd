import { useEffect, useRef } from 'react';

export default function SmokeOverlay() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = [
      { r: 40, g: 70, b: 30 },
      { r: 60, g: 35, b: 90 },
      { r: 25, g: 60, b: 25 },
      { r: 55, g: 25, b: 100 },
      { r: 35, g: 65, b: 30 },
    ];

    const COUNT = 18;

    function createParticle() {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 80 + Math.random() * 200,
        color,
        alpha: 0,
        maxAlpha: 0.05 + Math.random() * 0.08,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
        driftX: (Math.random() - 0.5) * 0.008,
        driftY: (Math.random() - 0.5) * 0.006,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.003 + Math.random() * 0.005,
        growSpeed: 0.0003 + Math.random() * 0.0005,
        life: 0,
        maxLife: 600 + Math.random() * 800,
      };
    }

    for (let i = 0; i < COUNT; i++) {
      const p = createParticle();
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    let scrollY = window.scrollY;
    let lastScrollY = scrollY;
    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scrollDelta = scrollY - lastScrollY;
      lastScrollY += (scrollY - lastScrollY) * 0.1;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        const lifeRatio = p.life / p.maxLife;
        if (lifeRatio < 0.15) {
          p.alpha = (lifeRatio / 0.15) * p.maxAlpha;
        } else if (lifeRatio > 0.8) {
          p.alpha = ((1 - lifeRatio) / 0.2) * p.maxAlpha;
        } else {
          p.alpha = p.maxAlpha;
        }

        p.phase += p.phaseSpeed;
        p.vx += p.driftX + Math.sin(p.phase) * 0.01;
        p.vy += p.driftY + Math.cos(p.phase * 0.7) * 0.008;
        p.vx *= 0.995;
        p.vy *= 0.995;
        p.x += p.vx;
        p.y += p.vy - scrollDelta * 0.15;
        p.radius += p.growSpeed;

        if (p.x < -p.radius) p.x = canvas.width + p.radius;
        if (p.x > canvas.width + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = canvas.height + p.radius;
        if (p.y > canvas.height + p.radius) p.y = -p.radius;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        gradient.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha})`);
        gradient.addColorStop(0.5, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        if (p.life >= p.maxLife) {
          particles[i] = createParticle();
        }
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[5] pointer-events-none"
      style={{ opacity: 1 }}
    />
  );
}
