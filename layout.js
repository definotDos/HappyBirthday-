// Fit the original heart canvas into its available space without changing particles.
(() => {
  const stage = document.querySelector('.heart-stage');
  const fitHeart = () => {
    const scale = Math.min(stage.clientWidth / 460, stage.clientHeight / 460);
    stage.style.setProperty('--heart-scale', Math.max(0, scale));
  };
  new ResizeObserver(fitHeart).observe(stage);
  fitHeart();
})();
