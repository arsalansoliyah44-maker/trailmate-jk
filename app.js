const routeCards = [...document.querySelectorAll('.route-card')];
const filterButtons = [...document.querySelectorAll('.filter-chip')];
const searchInput = document.querySelector('#routeSearch');
const resultLabel = document.querySelector('#routeResult');
const emptyState = document.querySelector('#emptyState');
const savedCount = document.querySelector('#savedCount');
const toast = document.querySelector('#toast');
let activeFilter = 'all';
let toastTimer;
let deferredInstallPrompt = null;
const savedRouteKeys = new Set(JSON.parse(localStorage.getItem('trailmate-jk-saved') || '[]'));

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;
  routeCards.forEach((card) => {
    const matchesFilter = activeFilter === 'all' || (activeFilter === 'jammu' ? card.dataset.region === 'jammu' : card.dataset.terrain === activeFilter);
    const matchesSearch = !query || card.dataset.search.includes(query) || card.querySelector('h3').textContent.toLowerCase().includes(query);
    const visible = matchesFilter && matchesSearch;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });
  resultLabel.textContent = `${visibleCount} route${visibleCount === 1 ? '' : 's'}`;
  emptyState.hidden = visibleCount !== 0;
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle('active', item === button));
    applyFilters();
  });
});

searchInput.addEventListener('input', applyFilters);

function updateSavedCount() {
  savedCount.textContent = savedRouteKeys.size;
}

document.querySelectorAll('.save-button').forEach((button) => {
  const routeKey = button.getAttribute('aria-label');
  button.dataset.routeKey = routeKey;
  button.classList.toggle('saved', savedRouteKeys.has(routeKey));
  button.addEventListener('click', () => {
    button.classList.toggle('saved');
    if (button.classList.contains('saved')) savedRouteKeys.add(routeKey);
    else savedRouteKeys.delete(routeKey);
    localStorage.setItem('trailmate-jk-saved', JSON.stringify([...savedRouteKeys]));
    updateSavedCount();
    showToast(button.classList.contains('saved') ? 'Route saved for later.' : 'Route removed from saved routes.');
  });
});
updateSavedCount();

const startTrekButton = document.querySelector('#startTrekButton');
const startTrekLabel = document.querySelector('#startTrekLabel');
startTrekButton.addEventListener('click', () => {
  const isStarted = startTrekButton.classList.toggle('started');
  startTrekLabel.textContent = isStarted ? 'Trek in progress' : 'Start a trek';
  showToast(isStarted ? 'You’re on your way. Stay curious.' : 'Trek paused. Your route is still here.');
});

document.querySelector('#offlinePackButton').addEventListener('click', () => {
  document.querySelector('#offlineState').textContent = 'Saved';
  document.querySelector('#connectionCopy').textContent = 'Offline pack saved';
  showToast('J&K trail pack saved for offline use.');
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => registration.active?.postMessage({ type: 'CACHE_TRAIL_PACK' })).catch(() => {});
  }
});

document.querySelector('#locationButton').addEventListener('click', () => {
  if (!navigator.geolocation) {
    showToast('Location is not available on this device.');
    return;
  }
  showToast('Requesting your location…');
  navigator.geolocation.getCurrentPosition(
    () => showToast('Location ready. Nearby trail mode is on.'),
    () => showToast('Location was not shared. You can still browse offline.'),
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 },
  );
});

document.querySelector('#notificationButton').addEventListener('click', () => showToast('No new trail notes. You’re all caught up.'));
document.querySelector('#helpButton').addEventListener('click', () => showToast('Trail guide: check permits, weather, guides, and route notices before you leave.'));
document.querySelector('#refreshButton').addEventListener('click', (event) => {
  event.currentTarget.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 500 });
  showToast(navigator.onLine ? 'Trail notes checked for updates.' : 'You’re offline. Showing saved trail notes.');
});
document.querySelector('#viewAllButton').addEventListener('click', () => {
  activeFilter = 'all';
  searchInput.value = '';
  filterButtons.forEach((item) => item.classList.toggle('active', item.dataset.filter === 'all'));
  applyFilters();
  showToast('Showing every J&K trail note.');
});

function updateConnectionState() {
  const online = navigator.onLine;
  document.querySelector('#networkStatus').textContent = online ? 'Jammu & Kashmir · online' : 'Jammu & Kashmir · offline';
  document.querySelector('#statusDot').classList.toggle('offline', !online);
  document.querySelector('#connectionCopy').textContent = online ? 'Offline pack ready' : 'Offline mode active';
}

window.addEventListener('online', updateConnectionState);
window.addEventListener('offline', updateConnectionState);
updateConnectionState();

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  document.querySelector('#installButton').hidden = false;
});

document.querySelector('#installButton').addEventListener('click', async () => {
  if (!deferredInstallPrompt) {
    showToast('On iPhone: use Share → Add to Home Screen.');
    return;
  }
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  document.querySelector('#installButton').hidden = true;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
}

applyFilters();
