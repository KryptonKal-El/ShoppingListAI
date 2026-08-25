/**
 * Animated canvas background matching the marketing homepage hero: drifting
 * white hearts joined by faint proximity lines, gently repelled by the pointer.
 */
import { useEffect, useRef } from 'react';
import styles from './HeartfieldBackground.module.css';

const COUNT = 80;
const PARTICLE_RADIUS = 5;
const MAX_DIST = 120;
const LINE_DIST = 100;

/**
 * Draws a small heart centered at (cx, cy) with half-width `size`.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx - center x
 * @param {number} cy - center y
 * @param {number} size - half-width of the heart
 */
const drawHeart = (ctx, cx, cy, size) => {
  const s = size;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(0, s * 0.35);
  ctx.bezierCurveTo(-s * 0.95, -s * 0.2, -s * 1.05, -s * 0.85, -s * 0.5, -s * 0.85);
  ctx.bezierCurveTo(-s * 0.15, -s * 0.85, 0, -s * 0.5, 0, -s * 0.2);
  ctx.bezierCurveTo(0, -s * 0.5, s * 0.15, -s * 0.85, s * 0.5, -s * 0.85);
  ctx.bezierCurveTo(s * 1.05, -s * 0.85, s * 0.95, -s * 0.2, 0, s * 0.35);
  ctx.fill();
  ctx.restore();
};

export const HeartfieldBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const mouse = { x: null, y: null };
    let particles = [];
    let frameId = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const makeParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      driftVx: (Math.random() - 0.5) * 0.35,
      driftVy: (Math.random() - 0.5) * 0.35,
      vx: 0,
      vy: 0,
      radius: PARTICLE_RADIUS,
    });

    const init = () => {
      particles = Array.from({ length: COUNT }, makeParticle);
    };

    const update = (p) => {
      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST && dist > 0) {
          const force = ((MAX_DIST - dist) / MAX_DIST) * 0.12;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.x += p.driftVx + p.vx;
      p.y += p.driftVy + p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
    };

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINE_DIST) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / LINE_DIST) * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        update(p);
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        drawHeart(ctx, p.x, p.y, p.radius);
      });
      drawLines();
      frameId = requestAnimationFrame(loop);
    };

    const handleResize = () => {
      resize();
      init();
    };

    const trackPointer = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const clearPointer = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', trackPointer);
    window.addEventListener('pointerdown', trackPointer);
    window.addEventListener('pointerup', clearPointer);
    window.addEventListener('pointercancel', clearPointer);

    resize();
    init();
    loop();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', trackPointer);
      window.removeEventListener('pointerdown', trackPointer);
      window.removeEventListener('pointerup', clearPointer);
      window.removeEventListener('pointercancel', clearPointer);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
};
