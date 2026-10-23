(() => {
  const button = document.getElementById('enter-birthday');
  const welcome = document.getElementById('welcome-screen');
  const page = document.getElementById('birthday-page');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  async function transition(element, keyframes, options) {
    if (reducedMotion.matches || !element.animate) return;
    const animation = element.animate(keyframes, {
      easing: 'cubic-bezier(.22, 1, .36, 1)',
      fill: 'backwards',
      ...options
    });
    // Cancellation must never prevent the birthday page from opening.
    await animation.finished.catch(() => {});
  }

  button.addEventListener('click', async () => {
    button.disabled = true;
    welcome.setAttribute('aria-busy', 'true');
    await transition(button, [
      { transform: 'scale(1)', boxShadow: '0 0 0 0 #e5c5a560' },
      { transform: 'scale(.94)', offset: .35 },
      { transform: 'scale(1)', boxShadow: '0 0 0 24px #e5c5a500' }
    ], { duration: 280 });
    await Promise.all([
      transition(welcome.querySelector('.welcome-card'), [
        { opacity: 1, transform: 'translateY(0) scale(1)' },
        { opacity: 0, transform: 'translateY(-18px) scale(.95)' }
      ], { duration: 450, fill: 'forwards' }),
      transition(document.getElementById('welcome-heart-canvas'), [
        { opacity: 1 }, { opacity: 0 }
      ], { duration: 450, fill: 'forwards' })
    ]);
    welcome.hidden = true;
    page.hidden = false;
    page.inert = true;
    window.dispatchEvent(new Event('resize'));
    document.dispatchEvent(new Event('birthday:open'));
    const entrances = [
      [page.querySelector('header'), 0],
      [page.querySelector('.greeting'), 60],
      [page.querySelector('.memory'), 140],
      [page.querySelector('footer'), 180]
    ];
    await Promise.all(entrances.map(([element, delay]) => transition(element, [
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 650, delay })));
    page.inert = false;
    welcome.removeAttribute('aria-busy');
    document.getElementById('birthday-title').focus({ preventScroll: true });
  }, { once: true });
})();
