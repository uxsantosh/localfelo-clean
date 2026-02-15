/**
 * Lightweight Confetti Animation System
 * ======================================
 * Performance-optimized confetti with emoji particles
 * Uses canvas for smooth 60fps animations
 */

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  emoji: string;
  size: number;
  gravity: number;
  drift: number;
  opacity: number;
  life: number;
}

class ConfettiManager {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: ConfettiParticle[] = [];
  private animationFrame: number | null = null;
  private isAnimating = false;

  /**
   * Initialize canvas (lazy)
   */
  private initCanvas() {
    if (this.canvas) return;

    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '9999';
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.ctx = this.canvas.getContext('2d', { alpha: true });
    document.body.appendChild(this.canvas);

    // Handle resize
    window.addEventListener('resize', this.handleResize);
  }

  private handleResize = () => {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  /**
   * Create confetti particles
   */
  private createParticles(
    count: number,
    emojis: string[],
    originX: number,
    originY: number
  ) {
    const newParticles: ConfettiParticle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const velocity = 3 + Math.random() * 8;
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];

      newParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - (3 + Math.random() * 3), // Upward bias
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        emoji,
        size: 20 + Math.random() * 20,
        gravity: 0.15 + Math.random() * 0.1,
        drift: (Math.random() - 0.5) * 0.2,
        opacity: 1,
        life: 1,
      });
    }

    this.particles.push(...newParticles);
  }

  /**
   * Animation loop
   */
  private animate = () => {
    if (!this.ctx || !this.canvas) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw particles
    this.particles = this.particles.filter((particle) => {
      // Update physics
      particle.vy += particle.gravity;
      particle.vx += particle.drift;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.rotationSpeed;
      particle.life -= 0.01;
      particle.opacity = Math.max(0, particle.life);

      // Remove if off screen or dead
      if (
        particle.y > window.innerHeight + 50 ||
        particle.x < -50 ||
        particle.x > window.innerWidth + 50 ||
        particle.life <= 0
      ) {
        return false;
      }

      // Draw emoji
      if (this.ctx) {
        this.ctx.save();
        this.ctx.globalAlpha = particle.opacity;
        this.ctx.translate(particle.x, particle.y);
        this.ctx.rotate(particle.rotation);
        this.ctx.font = `${particle.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(particle.emoji, 0, 0);
        this.ctx.restore();
      }

      return true;
    });

    // Continue animation if particles exist
    if (this.particles.length > 0) {
      this.animationFrame = requestAnimationFrame(this.animate);
    } else {
      this.stop();
    }
  };

  /**
   * Start confetti
   */
  public blast(options?: {
    emojis?: string[];
    count?: number;
    origin?: { x: number; y: number };
  }) {
    const {
      emojis = ['😊', '🎉', '✨', '🌟', '💫', '⭐'],
      count = 40,
      origin = { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    } = options || {};

    // Initialize canvas if needed
    this.initCanvas();

    // Create particles
    this.createParticles(count, emojis, origin.x, origin.y);

    // Start animation if not already running
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animate();
    }
  }

  /**
   * Stop animation
   */
  private stop() {
    this.isAnimating = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    // Remove canvas if no particles
    if (this.particles.length === 0 && this.canvas) {
      document.body.removeChild(this.canvas);
      this.canvas = null;
      this.ctx = null;
      window.removeEventListener('resize', this.handleResize);
    }
  }

  /**
   * Cleanup
   */
  public destroy() {
    this.stop();
    this.particles = [];
    if (this.canvas) {
      document.body.removeChild(this.canvas);
      this.canvas = null;
      this.ctx = null;
    }
    window.removeEventListener('resize', this.handleResize);
  }
}

// Singleton instance
const confettiManager = new ConfettiManager();

/**
 * Confetti presets for different events
 */
export const confettiPresets = {
  // User registered successfully
  registration: {
    emojis: ['🎉', '🥳', '🎊', '✨', '💚', '🌟'],
    count: 50,
  },
  
  // Task created
  taskCreated: {
    emojis: ['✅', '💪', '🚀', '⚡', '🔥', '💫'],
    count: 40,
  },
  
  // Wish created
  wishCreated: {
    emojis: ['⭐', '💫', '✨', '🌟', '🎯', '💭'],
    count: 40,
  },
  
  // Listing created
  listingCreated: {
    emojis: ['🎁', '📦', '🛍️', '✨', '💰', '🌟'],
    count: 40,
  },
  
  // Task completed
  taskCompleted: {
    emojis: ['🎉', '🏆', '👏', '✅', '💚', '🌟'],
    count: 60,
  },
  
  // Wish granted
  wishGranted: {
    emojis: ['🎊', '🥳', '💝', '✨', '🌈', '⭐'],
    count: 60,
  },
};

/**
 * Main confetti function
 */
export function fireConfetti(
  preset?: keyof typeof confettiPresets,
  customOptions?: {
    emojis?: string[];
    count?: number;
    origin?: { x: number; y: number };
  }
) {
  // Get preset or use custom options
  const options = preset
    ? confettiPresets[preset]
    : customOptions || confettiPresets.registration;

  // Get origin point (default to top-center for celebration effect)
  const origin = customOptions?.origin || {
    x: window.innerWidth / 2,
    y: window.innerHeight * 0.3, // 30% from top
  };

  // Fire confetti
  confettiManager.blast({
    ...options,
    origin,
  });
}

/**
 * Cleanup function (call on app unmount if needed)
 */
export function cleanupConfetti() {
  confettiManager.destroy();
}

// Export for direct use
export default fireConfetti;
