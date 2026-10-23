(() => {
  const audio = document.getElementById('birthday-music');
  const status = document.getElementById('music-status');
  const clipStart = 179;
  const clipEnd = 240;
  let boundaryTimer;
  audio.volume = 0.4;
  audio.loop = false;

  function keepInClip() {
    if (audio.readyState > 0 && (audio.currentTime < clipStart || audio.currentTime >= clipEnd)) {
      audio.currentTime = clipStart;
    }
  }

  function scheduleBoundary() {
    clearTimeout(boundaryTimer);
    if (audio.paused || audio.seeking || audio.readyState === 0) return;
    keepInClip();
    boundaryTimer = setTimeout(() => {
      keepInClip();
      scheduleBoundary();
    }, Math.max(30, (clipEnd - audio.currentTime) * 1000 / (audio.playbackRate || 1)));
  }

  audio.addEventListener('loadedmetadata', keepInClip);
  audio.addEventListener('play', keepInClip);
  audio.addEventListener('seeking', () => {
    clearTimeout(boundaryTimer);
    keepInClip();
  });
  audio.addEventListener('seeked', scheduleBoundary);
  audio.addEventListener('ratechange', scheduleBoundary);
  audio.addEventListener('pause', () => clearTimeout(boundaryTimer));
  audio.addEventListener('timeupdate', keepInClip);
  keepInClip();

  function showStatus(message) {
    status.textContent = message;
    status.hidden = !message;
  }

  // Start directly within the click gesture, before the welcome transition awaits.
  document.getElementById('enter-birthday').addEventListener('click', () => {
    keepInClip();
    audio.play().catch(() => {
      showStatus(audio.error
        ? 'Music could not load. Check that the MP3 is in the project folder.'
        : 'Press play to start the music.');
    });
  }, { once: true });

  audio.addEventListener('playing', () => {
    showStatus('');
    keepInClip();
    scheduleBoundary();
  });
  audio.addEventListener('error', () => {
    clearTimeout(boundaryTimer);
    showStatus('Music could not load. Check that the MP3 is in the project folder.');
  });
})();
