import confetti from 'canvas-confetti';

export function fireConfetti() {
  const colors = ['#4F46E5', '#7C3AED', '#10B981', '#F59E0B', '#ffffff'];
  
  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors,
    ticks: 200,
    gravity: 1,
    decay: 0.94,
    startVelocity: 30,
  });
}

export function fireSuccessConfetti() {
  const duration = 2000;
  const animationEnd = Date.now() + duration;
  const defaults = { 
    startVelocity: 30, 
    spread: 360, 
    ticks: 60, 
    zIndex: 0,
    colors: ['#4F46E5', '#7C3AED', '#10B981', '#F59E0B', '#ffffff']
  };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: NodeJS.Timeout = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
}

// Alias for convenience
export const triggerConfetti = fireSuccessConfetti;
