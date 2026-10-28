(() => {
  const input = document.getElementById('photo-input');
  const slides = document.getElementById('photo-slides');
  const placeholder = document.getElementById('photo-placeholder');
  const status = document.getElementById('photo-status');
  const carousel = document.querySelector('.carousel');
  const controls = document.getElementById('carousel-controls');
  const dots = document.getElementById('photo-dots');
  const count = document.getElementById('photo-count');
  const play = document.getElementById('toggle-play');
  const previous = document.getElementById('previous-photo');
  const next = document.getElementById('next-photo');
  const thumbnails = document.getElementById('photo-thumbnails');
  const restore = document.getElementById('restore-photos');
  const defaultSources = [1, 2, 3, 4, 5].map(number => `Picture ${number}.jpg`);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let photos = [];
  let active = 0;
  let paused = reducedMotion.matches;
  let hovered = false;
  let timer;
  let selection = 0;

  function schedule() {
    clearInterval(timer);
    if (photos.length > 1 && !paused && !hovered && !document.hidden && !document.getElementById('birthday-page').hidden && !carousel.contains(document.activeElement)) {
      timer = setInterval(() => show(active + 1), 4500);
    }
  }
  function show(index) {
    if (!photos.length) return;
    active = (index + photos.length) % photos.length;
    [...slides.children].forEach((slide, i) => {
      slide.classList.toggle('is-active', i === active);
      slide.setAttribute('aria-hidden', String(i !== active));
    });
    [...dots.children].forEach((dot, i) => dot.setAttribute('aria-current', String(i === active)));
    [...thumbnails.children].forEach((thumbnail, i) => thumbnail.setAttribute('aria-current', String(i === active)));
    count.textContent = `${String(active + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
    schedule();
  }
  function updatePlay() {
    carousel.classList.toggle('effects-paused', paused);
    play.textContent = paused ? 'Play' : 'Pause';
    play.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
    schedule();
  }
  previous.addEventListener('click', () => show(active - 1));
  next.addEventListener('click', () => show(active + 1));
  play.addEventListener('click', () => { paused = !paused; updatePlay(); });
  carousel.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  carousel.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  carousel.addEventListener('focusin', schedule);
  carousel.addEventListener('focusout', () => setTimeout(schedule, 0));
  document.addEventListener('visibilitychange', schedule);
  document.addEventListener('birthday:open', () => show(0));
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; updatePlay(); });
  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(active + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  let touchStart;
  carousel.addEventListener('touchstart', (event) => {
    touchStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
  }, { passive: true });
  carousel.addEventListener('touchend', (event) => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) show(active + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });
  carousel.addEventListener('touchcancel', () => { touchStart = null; });
  function release(items) {
    items.forEach(photo => { if (photo.url.startsWith('blob:')) URL.revokeObjectURL(photo.url); });
  }
  function renderPhotos(items) {
    clearInterval(timer);
    slides.replaceChildren();
    dots.replaceChildren();
    thumbnails.replaceChildren();
    release(photos);
    photos = items;
    photos.forEach(({ image, url }, i) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      const backdrop = document.createElement('img');
      backdrop.className = 'photo-backdrop';
      backdrop.src = url;
      backdrop.alt = '';
      backdrop.setAttribute('aria-hidden', 'true');
      backdrop.draggable = false;
      image.className = 'photo-foreground';
      image.alt = `Memory ${i + 1} of ${photos.length} for Ally`;
      image.draggable = false;
      slide.append(backdrop, image);
      slides.append(slide);
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'photo-dot';
      dot.setAttribute('aria-label', `Show photo ${i + 1}`);
      dot.addEventListener('click', () => show(i));
      dots.append(dot);
      const thumbnail = document.createElement('button');
      thumbnail.type = 'button';
      thumbnail.className = 'photo-thumbnail';
      thumbnail.setAttribute('aria-label', `Show memory ${i + 1}`);
      const preview = document.createElement('img');
      preview.src = url;
      preview.alt = '';
      const label = document.createElement('span');
      label.textContent = String(i + 1).padStart(2, '0');
      thumbnail.append(preview, label);
      thumbnail.addEventListener('click', () => show(i));
      thumbnails.append(thumbnail);
    });
    placeholder.hidden = true;
    controls.hidden = false;
    previous.disabled = next.disabled = photos.length < 2;
    play.hidden = dots.hidden = thumbnails.hidden = photos.length < 2;
    updatePlay();
    show(0);
  }
  async function loadDefaults() {
    const version = ++selection;
    status.textContent = 'Loading your birthday memories...';
    const loaded = await Promise.all(defaultSources.map(url => new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve({ url, image });
      image.onerror = () => resolve(null);
      image.src = url;
    })));
    if (version !== selection) return;
    const valid = loaded.filter(Boolean);
    if (!valid.length) {
      status.textContent = 'Pictures could not be loaded. Keep Picture 1.jpg through Picture 5.jpg beside index.html.';
      return;
    }
    renderPhotos(valid);
    restore.hidden = true;
    status.textContent = valid.length === defaultSources.length
      ? ''
      : `${valid.length} memories loaded. ${defaultSources.length - valid.length} pictures could not be opened.`;
  }
  restore.addEventListener('click', loadDefaults);
  input.addEventListener('change', async () => {
    const files = [...input.files];
    input.value = '';
    if (!files.length) return;
    const version = ++selection;
    status.textContent = 'Preparing your memories...';
    const loaded = await Promise.all(files.slice(0, 12).map(file => new Promise(resolve => {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 10 * 1024 * 1024) {
        resolve(null);
        return;
      }
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => resolve({ url, image });
      image.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      image.src = url;
    })));
    const valid = loaded.filter(Boolean);
    if (version !== selection) { release(valid); return; }
    if (!valid.length) {
      status.textContent = 'No photos could be opened. Choose JPG, PNG, WebP or GIF files up to 10 MB each.';
      return;
    }
    renderPhotos(valid);
    restore.hidden = false;
    const skipped = files.length - photos.length;
    status.textContent = `${photos.length} photos ready.${skipped ? ` ${skipped} skipped (12 maximum; supported images up to 10 MB each).` : ''} Photos stay in this tab until you refresh.`;
  });
  updatePlay();
  loadDefaults();
})();
