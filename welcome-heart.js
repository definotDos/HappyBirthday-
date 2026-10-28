(() => {
  const canvas = document.getElementById('welcome-heart-canvas');
  const context = canvas.getContext('2d');
  if (!context) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const particles = Array.from({ length: 420 }, (_, index) => ({
    angle: index / 420 * Math.PI * 2,
    offset: (Math.random() - .5) * .055,
    size: .8 + Math.random() * 1.8,
    phase: Math.random() * Math.PI * 2
  }));
  let width = 0;
  let height = 0;
  let frame;
  let closed = false;

  function draw(time = 0) {
    const seconds = motion.matches ? 0 : time / 1000;
    context.clearRect(0, 0, width, height);
    const scale = Math.min(width / 37, height / 34);
    const pulse = 1 + Math.sin(seconds * 1.8) * .025;
    for (const particle of particles) {
      const angle = particle.angle + seconds * .045;
      const spread = (1 + particle.offset) * scale * pulse;
      const x = width / 2 + 16 * Math.sin(angle) ** 3 * spread;
      const y = height / 2 - (13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle) + 2) * spread;
      context.globalAlpha = .35 + (Math.sin(seconds * 1.2 + particle.phase) + 1) * .25;
      context.fillStyle = particle.size > 2 ? '#bdeaff' : '#87ceeb';
      context.shadowColor = '#87ceeb';
      context.shadowBlur = 8;
      context.beginPath();
      context.arc(x, y, particle.size, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
  }
  function animate(time) {
    draw(time);
    frame = requestAnimationFrame(animate);
  }
  function restart() {
    cancelAnimationFrame(frame);
    if (closed || document.hidden) return;
    draw();
    if (!motion.matches) frame = requestAnimationFrame(animate);
  }
  function resize() {
    if (closed) return;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    restart();
  }
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', restart);
  motion.addEventListener('change', restart);
  document.addEventListener('birthday:open', () => {
    closed = true;
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', restart);
    motion.removeEventListener('change', restart);
  }, { once: true });
  resize();
})();
