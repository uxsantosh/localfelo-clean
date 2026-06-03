import React, { useEffect, useRef } from "react";

interface Rocket {
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetY: number;
  speed: number;
  angle: number;
  trail: { x: number; y: number }[];
  isDead: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
  friction: number;
  size: number;
  flicker: boolean;
}

export default function Firecracker() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Handle high DPI crispness
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    
    // Parent element observe
    const parent = canvas.parentElement;
    if (parent) {
      resizeObserver.observe(parent);
    }

    const rockets: Rocket[] = [];
    const particles: Particle[] = [];

    // Colors matching LocalFelo premium identity
    const colors = [
      "#F03220", // Accent Crimson Red
      "#fbbf24", // Vibrant Amber/Gold
      "#F59E0B", // Dark Amber
      "#ffffff", // High energy white-hot sparks
      "#EF4444", // Bright red
    ];

    const hOffset = -24; // Horizontal offset in pixels to shift left

    const createRocket = () => {
      // Launch from slightly left of bottom center
      const startX = width / 2 + hOffset + (Math.random() * 20 - 10);
      const startY = height;
      // Target slightly left of center of mockup
      const targetY = height / 2 - 20 + (Math.random() * 30 - 15);
      
      const angle = -Math.PI / 2 + (Math.random() * 0.1 - 0.05); // slightly angled path
      const speed = 4.5 + Math.random() * 1.5;

      rockets.push({
        x: startX,
        y: startY,
        startX,
        startY,
        targetY,
        speed,
        angle,
        trail: [],
        isDead: false,
      });
    };

    const explode = (x: number, y: number) => {
      const particleCount = 130 + Math.floor(Math.random() * 40);
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        // Exponential velocity distribution for beautiful sphere burst
        const velocity = Math.sqrt(Math.random()) * 6.5;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        // Pick premium themed color
        const color = colors[Math.floor(Math.random() * colors.length)];
        const decay = 0.007 + Math.random() * 0.012;
        const gravity = 0.08 + Math.random() * 0.04;
        const friction = 0.97;
        const size = 1.2 + Math.random() * 2;
        const flicker = Math.random() > 0.4;

        particles.push({
          x,
          y,
          vx,
          vy,
          color,
          alpha: 1.0,
          decay,
          gravity,
          friction,
          size,
          flicker,
        });
      }
    };

    // First rocket
    createRocket();
    
    let timeSinceLastLaunch = 0;
    const launchCooldown = 150; // frames (~2.5 seconds)

    const animate = () => {
      // Clear the canvas completely so it is perfectly transparent
      ctx.clearRect(0, 0, width, height);

      // 1. Update & Draw Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const rocket = rockets[i];
        
        // Calculate velocity vectors
        const vx = Math.cos(rocket.angle) * rocket.speed;
        const vy = Math.sin(rocket.angle) * rocket.speed;

        rocket.x += vx;
        rocket.y += vy;

        // Save trails
        rocket.trail.push({ x: rocket.x, y: rocket.y });
        if (rocket.trail.length > 10) {
          rocket.trail.shift();
        }

        // Draw trail segments with fading alpha
        if (rocket.trail.length > 1) {
          for (let t = 1; t < rocket.trail.length; t++) {
            ctx.beginPath();
            ctx.moveTo(rocket.trail[t - 1].x, rocket.trail[t - 1].y);
            ctx.lineTo(rocket.trail[t].x, rocket.trail[t].y);
            const ratio = t / rocket.trail.length;
            ctx.strokeStyle = `rgba(240, 50, 32, ${ratio * 0.5})`;
            ctx.lineWidth = 1.0 + ratio * 1.5;
            ctx.stroke();
          }
        }

        // Draw glowing bright rocket tip
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();

        // Draw sparks trailing behind rocket tip
        if (Math.random() > 0.4) {
          particles.push({
            x: rocket.x - vx * 0.5,
            y: rocket.y - vy * 0.5,
            vx: -vx * 0.2 + (Math.random() * 1.5 - 0.75),
            vy: -vy * 0.2 + (Math.random() * 0.5),
            color: "#fbbf24",
            alpha: 0.8,
            decay: 0.05,
            gravity: 0.05,
            friction: 0.95,
            size: 1.0,
            flicker: true,
          });
        }

        // Check did it reach the target height or peak?
        if (rocket.y <= rocket.targetY || vy >= 0) {
          explode(rocket.x, rocket.y);
          rockets.splice(i, 1);
        }
      }

      // 2. Update & Draw Exploded Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vx *= p.friction;
        p.vy *= p.friction;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        // Handle sparkle animation/glow intensity pulsing
        let renderAlpha = p.alpha;
        if (p.flicker && Math.random() > 0.5) {
          renderAlpha *= 0.3; // sparkling effect
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        // Add smooth colored drop shadow/bloom on canvas layer. Really sleek high quality look
        ctx.shadowBlur = 4;
        ctx.shadowColor = p.color;
        
        ctx.fillStyle = p.color;
        ctx.globalAlpha = renderAlpha;
        ctx.fill();
        ctx.restore();
      }

      // Loop manager: Launch next rocket organically
      timeSinceLastLaunch++;
      if (rockets.length === 0 && particles.length < 15 && timeSinceLastLaunch > launchCooldown) {
        createRocket();
        timeSinceLastLaunch = 0;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute -inset-[140px] pointer-events-none z-0 overflow-visible"
      style={{ mixBlendMode: "screen" }}
      id="firecracker-canvas"
    />
  );
}
