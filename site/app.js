// SipMap — carte des points d'eau potable OpenStreetMap autour de soi.
(() => {
  'use strict';

  const TYPES = {
    fontaine:    { label: 'Fontaine',                   color: '#0b6bd3' },
    robinet:     { label: 'Robinet',                    color: '#0aa0c8' },
    source:      { label: 'Source',                     color: '#13926b' },
    toilettes:   { label: 'Toilettes avec eau potable', color: '#7a5cc9', short: 'Toilettes' },
    remplissage: { label: 'Point de remplissage',       color: '#0b3f86', short: 'Remplissage' },
    puits:       { label: 'Puits',                      color: '#9a6b2f' },
    autre:       { label: "Point d'eau potable",        color: '#5f6f7d', short: 'Autre' },
  };
  // Fond de carte OpenFreeMap « liberty », recoloré façon carte IGN : forêts vertes, eau bleue, sable jaune.
  const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
  const PALETTE = {
    paper: '#f7f5ee',
    forest: '#bfe0a0',
    grass: '#dff0c8',
    farmland: '#f2f1de',
    sand: '#f7e8a0',
    wetland: '#cfe8dc',
    rock: '#e7e3dc',
    ice: '#f3f9fd',
    park: '#d3ecbd',
    water: '#9dcff0',
    waterLine: '#4f9fd8',
  };
  const DEFAULT_VIEW = { center: [2.95, 39.62], zoom: 9 }; // Majorque, si la position est refusée
  const MIN_DATA_ZOOM = 7;   // en dessous, on ne charge pas de nouvelles cellules
  const MAX_CELLS = 64;      // garde-fou sur le nombre de fichiers chargés d'un coup
  const NEAR_RADIUS_DEG = 0.3;
  const NEAREST_COUNT = 5;

  const $ = (id) => document.getElementById(id);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const startedWithView = /^#\d/.test(location.hash); // lien partagé avec une vue précise

  let index = null;
  const cells = new Map();   // "lat_lon" -> features
  const pending = new Map(); // "lat_lon" -> Promise
  let userPos = null;        // [lon, lat]
  let popup = null;

  // ---------- Carte ----------
  // Démarre sur un fond uni, puis charge le vrai style recoloré.
  const map = new maplibregl.Map({
    container: 'map',
    style: { version: 8, sources: {}, layers: [{ id: 'paper', type: 'background', paint: { 'background-color': PALETTE.paper } }] },
    center: DEFAULT_VIEW.center,
    zoom: DEFAULT_VIEW.zoom,
    hash: true,
    attributionControl: false,
  });

  function ignify(style) {
    const landcover = ['match', ['get', 'class'],
      'wood', PALETTE.forest, 'grass', PALETTE.grass, 'farmland', PALETTE.farmland,
      'sand', PALETTE.sand, 'wetland', PALETTE.wetland, 'rock', PALETTE.rock, 'ice', PALETTE.ice,
      PALETTE.grass];
    for (const layer of style.layers || []) {
      const src = layer['source-layer'];
      layer.paint = layer.paint || {};
      if (layer.type === 'background') {
        layer.paint['background-color'] = PALETTE.paper;
      } else if (layer.type === 'fill' && src === 'water') {
        layer.paint['fill-color'] = PALETTE.water;
        layer.paint['fill-opacity'] = 1;
      } else if (layer.type === 'fill' && src === 'landcover') {
        delete layer.paint['fill-pattern'];
        layer.paint['fill-color'] = landcover;
        layer.paint['fill-opacity'] = 0.95;
      } else if (layer.type === 'fill' && src === 'park') {
        delete layer.paint['fill-pattern'];
        layer.paint['fill-color'] = PALETTE.park;
        layer.paint['fill-opacity'] = 0.7;
      } else if (layer.type === 'line' && src === 'waterway') {
        layer.paint['line-color'] = PALETTE.waterLine;
      }
    }
    return style;
  }

  fetch(STYLE_URL)
    .then((r) => r.json())
    .then((style) => map.setStyle(ignify(style), { diff: false }))
    .catch(() => map.setStyle(STYLE_URL, { diff: false }));

  const geolocate = new maplibregl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true, timeout: 10000 },
    trackUserLocation: true,
    showAccuracyCircle: true,
    fitBoundsOptions: { maxZoom: 15 },
  });
  map.addControl(geolocate, 'top-right');
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  // Attribution : ligne discrète en bas de page (#credits), pas de cadre MapLibre.

  const typeColor = ['match', ['get', 't']];
  for (const [key, t] of Object.entries(TYPES)) typeColor.push(key, t.color);
  typeColor.push(TYPES.autre.color);

  function addLayers() {
    if (map.getSource('eau')) return;
    map.addSource('eau', {
      type: 'geojson',
      data: featureCollection(),
      cluster: true,
      clusterMaxZoom: 12,
      clusterRadius: 44,
    });
    map.addLayer({
      id: 'eau-clusters', type: 'circle', source: 'eau', filter: ['has', 'point_count'],
      paint: {
        'circle-color': TYPES.fontaine.color,
        'circle-opacity': 0.9,
        'circle-radius': ['step', ['get', 'point_count'], 14, 20, 18, 100, 23, 500, 28],
        'circle-stroke-width': 3,
        'circle-stroke-color': 'rgba(255,255,255,0.85)',
      },
    });
    map.addLayer({
      id: 'eau-count', type: 'symbol', source: 'eau', filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['Noto Sans Bold'],
        'text-size': 12,
        'text-allow-overlap': true,
      },
      paint: { 'text-color': '#ffffff' },
    });
    map.addLayer({
      id: 'eau-halo', type: 'circle', source: 'eau', filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 8, 17, 16],
        'circle-color': typeColor,
        'circle-opacity': 0.18,
      },
    });
    map.addLayer({
      id: 'eau-points', type: 'circle', source: 'eau', filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 5, 17, 9],
        'circle-color': typeColor,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });
    map.addLayer({
      id: 'eau-selected', type: 'circle', source: 'eau', filter: ['==', ['get', 'i'], ''],
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 10, 17, 15],
        'circle-color': 'rgba(0,0,0,0)',
        'circle-stroke-width': 3,
        'circle-stroke-color': typeColor,
      },
    });
  }

  map.on('style.load', () => { addLayers(); updateSource(); });

  map.on('load', () => {
    if (!startedWithView) geolocate.trigger();
    onMove();
  });

  map.on('moveend', onMove);

  map.on('click', 'eau-clusters', async (e) => {
    const f = e.features[0];
    try {
      const zoom = await map.getSource('eau').getClusterExpansionZoom(f.properties.cluster_id);
      map.easeTo({ center: f.geometry.coordinates, zoom, duration: reducedMotion ? 0 : 500 });
    } catch (_) { /* rien */ }
  });
  map.on('click', 'eau-points', (e) => {
    const f = e.features[0];
    openCard(f.properties, f.geometry.coordinates);
  });
  for (const layer of ['eau-clusters', 'eau-points']) {
    map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
  }

  geolocate.on('geolocate', (e) => {
    userPos = [e.coords.longitude, e.coords.latitude];
    hideNotice();
    updateNearest();
  });
  geolocate.on('error', () => {
    showNotice('Position indisponible : la liste se base sur le centre de la carte.', 5000);
    updateNearest();
  });

  // ---------- Données ----------
  function toFeature(row) {
    const [lon, lat, t, i, extra] = row;
    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lon, lat] },
      properties: Object.assign({ t, i }, extra),
    };
  }

  function featureCollection() {
    const features = [];
    for (const list of cells.values()) for (const f of list) features.push(f);
    return { type: 'FeatureCollection', features };
  }

  function updateSource() {
    const src = map.getSource('eau');
    if (src) src.setData(featureCollection());
  }

  function keysInBox(w, s, e, n) {
    const keys = [];
    const lat0 = Math.floor(Math.max(s, -85)), lat1 = Math.floor(Math.min(n, 85));
    const lon0 = Math.floor(Math.max(w, -180)), lon1 = Math.floor(Math.min(e, 179.999));
    for (let la = lat0; la <= lat1; la++) {
      for (let lo = lon0; lo <= lon1; lo++) keys.push(`${la}_${lo}`);
    }
    return keys;
  }

  async function loadIndex() {
    try {
      const r = await fetch('data/index.json', { cache: 'no-cache' });
      if (!r.ok) throw new Error(String(r.status));
      index = await r.json();
      $('dataDate').textContent = ` · ${formatDate(index.generated)}`;
    } catch (_) {
      showNotice("Données indisponibles pour l'instant. Réessaie dans quelques minutes.");
    }
  }
  const indexReady = loadIndex();

  async function loadCells(keys) {
    await indexReady;
    if (!index) return;
    const jobs = [];
    for (const k of keys) {
      if (!index.cells[k] || cells.has(k)) continue;
      if (!pending.has(k)) {
        pending.set(k, fetch(`data/c/${k}.json`)
          .then((r) => (r.ok ? r.json() : []))
          .then((rows) => { cells.set(k, rows.map(toFeature)); })
          .catch(() => { cells.set(k, []); })
          .finally(() => { pending.delete(k); }));
      }
      jobs.push(pending.get(k));
    }
    if (jobs.length) {
      await Promise.all(jobs);
      updateSource();
    }
  }

  async function onMove() {
    const zoom = map.getZoom();
    if (zoom >= MIN_DATA_ZOOM) {
      const b = map.getBounds();
      const keys = keysInBox(b.getWest(), b.getSouth(), b.getEast(), b.getNorth());
      if (keys.length <= MAX_CELLS) await loadCells(keys);
      if (noticeKind === 'zoom') hideNotice();
    } else if (!noticeKind) {
      showNotice('Zoome pour afficher les points d’eau.', 0, 'zoom');
    }
    if (!userPos) updateNearest();
  }

  // ---------- Plus proches ----------
  function distance(a, b) {
    const R = 6371008.8, rad = Math.PI / 180;
    const dLat = (b[1] - a[1]) * rad, dLon = (b[0] - a[0]) * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  let nearestRun = 0;
  async function updateNearest() {
    const run = ++nearestRun;
    const fromUser = Boolean(userPos);
    if (!fromUser && map.getZoom() < MIN_DATA_ZOOM) {
      renderNearest([], 'Zoome ou active ta position');
      return;
    }
    const ref = fromUser ? userPos : map.getCenter().toArray();
    const keys = keysInBox(ref[0] - NEAR_RADIUS_DEG, ref[1] - NEAR_RADIUS_DEG, ref[0] + NEAR_RADIUS_DEG, ref[1] + NEAR_RADIUS_DEG);
    await loadCells(keys);
    if (run !== nearestRun) return;
    const found = [];
    for (const k of keys) {
      for (const f of cells.get(k) || []) found.push({ f, d: distance(ref, f.geometry.coordinates) });
    }
    found.sort((a, b) => a.d - b.d);
    renderNearest(found.slice(0, NEAREST_COUNT), fromUser ? 'Autour de toi' : 'Autour du centre de la carte');
  }

  function renderNearest(items, sub) {
    $('sheetSub').textContent = sub;
    $('sheetFirst').textContent = items.length ? formatDistance(items[0].d) : '';
    const list = $('nearList');
    list.replaceChildren();
    if (!items.length) {
      const li = document.createElement('li');
      li.className = 'near-empty';
      li.textContent = index ? 'Aucun point d’eau connu dans les 30 km.' : 'Chargement des données…';
      list.append(li);
      return;
    }
    for (const { f, d } of items) {
      const t = TYPES[f.properties.t] || TYPES.autre;
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'near-item';
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.style.background = t.color;
      const text = document.createElement('span');
      text.className = 'near-text';
      const name = document.createElement('span');
      name.className = 'near-name';
      name.textContent = f.properties.name || t.label;
      text.append(name);
      if (f.properties.name) {
        const type = document.createElement('span');
        type.className = 'near-type';
        type.textContent = t.label;
        text.append(type);
      }
      const dist = document.createElement('span');
      dist.className = 'near-dist';
      dist.textContent = formatDistance(d);
      btn.append(dot, text, dist);
      btn.addEventListener('click', () => {
        map.flyTo({ center: f.geometry.coordinates, zoom: Math.max(map.getZoom(), 16), duration: reducedMotion ? 0 : 900 });
        openCard(f.properties, f.geometry.coordinates);
        if (window.matchMedia('(max-width: 719px)').matches) setSheet(false);
      });
      li.append(btn);
      list.append(li);
    }
  }

  // ---------- Fiche ----------
  const SEASONAL = { yes: 'Saisonnier, peut être coupé l’hiver', no: 'Toute l’année', summer: 'L’été seulement', spring: 'Au printemps', autumn: 'En automne', winter: 'L’hiver seulement' };
  const FEE = { yes: 'Payant', no: 'Gratuit' };
  const BOTTLE = { yes: 'Remplissage de gourde facile', no: 'Peu pratique pour remplir une gourde' };
  const ACCESS = { customers: 'Réservé aux clients', permissive: 'Accès toléré', destination: 'Accès riverains', permit: 'Sur autorisation' };
  const OSM_KIND = { n: 'node', w: 'way', r: 'relation' };

  function openCard(p, coords) {
    const t = TYPES[p.t] || TYPES.autre;
    const root = document.createElement('div');

    const kind = document.createElement('div');
    kind.className = 'card-kind';
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.style.background = t.color;
    kind.append(dot, document.createTextNode(t.short || t.label));
    root.append(kind);

    const title = document.createElement('h2');
    title.className = 'card-title';
    title.textContent = p.name || t.label;
    root.append(title);

    if (userPos) {
      const dist = document.createElement('p');
      dist.className = 'card-dist';
      dist.textContent = `À ${formatDistance(distance(userPos, coords))} de toi, à vol d’oiseau`;
      root.append(dist);
    }

    const facts = [];
    if (p.seasonal) facts.push(SEASONAL[p.seasonal] || `Saisonnier : ${p.seasonal}`);
    if (p.fee) facts.push(FEE[p.fee] || `Tarif : ${p.fee}`);
    if (p.bottle) facts.push(BOTTLE[p.bottle] || `Gourde : ${p.bottle}`);
    if (p.opening_hours) facts.push(`Horaires : ${p.opening_hours}`);
    if (p.access && ACCESS[p.access]) facts.push(ACCESS[p.access]);
    if (p.description) facts.push(p.description);
    if (facts.length) {
      const ul = document.createElement('ul');
      ul.className = 'card-facts';
      for (const fact of facts) {
        const li = document.createElement('li');
        li.textContent = fact;
        ul.append(li);
      }
      root.append(ul);
    }

    // Itinéraire à pied dans Google Maps (ouvre l'appli si elle est installée)
    const go = document.createElement('a');
    go.className = 'card-go';
    go.href = `https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}&travelmode=walking`;
    go.target = '_blank';
    go.rel = 'noopener';
    go.textContent = 'Rejoindre ce point d’eau';
    root.append(go);

    const id = String(p.i || '');
    const kindOsm = OSM_KIND[id[0]];
    if (kindOsm) {
      const link = document.createElement('a');
      link.className = 'card-link';
      link.href = `https://www.openstreetmap.org/${kindOsm}/${id.slice(1)}`;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Voir ou corriger sur OpenStreetMap ↗';
      root.append(link);
    }

    if (popup) popup.remove();
    popup = new maplibregl.Popup({ offset: 14, maxWidth: '290px', focusAfterOpen: false })
      .setLngLat(coords)
      .setDOMContent(root)
      .addTo(map);
    map.setFilter('eau-selected', ['==', ['get', 'i'], id]);
    popup.on('close', () => { if (map.getLayer('eau-selected')) map.setFilter('eau-selected', ['==', ['get', 'i'], '']); });
  }

  // ---------- Interface ----------
  function setSheet(open) {
    $('sheetToggle').setAttribute('aria-expanded', String(open));
    $('sheetBody').hidden = !open;
  }
  $('sheetToggle').addEventListener('click', () => {
    setSheet($('sheetToggle').getAttribute('aria-expanded') !== 'true');
  });

  const legend = $('legend');
  for (const t of Object.values(TYPES)) {
    const li = document.createElement('li');
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.style.background = t.color;
    li.append(dot, document.createTextNode(t.short || t.label));
    legend.append(li);
  }

  let noticeTimer = null;
  let noticeKind = null;
  function showNotice(text, ms = 0, kind = 'info') {
    const el = $('notice');
    el.textContent = text;
    el.hidden = false;
    noticeKind = kind;
    clearTimeout(noticeTimer);
    if (ms) noticeTimer = setTimeout(hideNotice, ms);
  }
  function hideNotice() {
    $('notice').hidden = true;
    noticeKind = null;
  }

  function formatDistance(m) {
    if (m < 1000) return `${Math.max(10, Math.round(m / 10) * 10)} m`;
    return `${(m / 1000).toFixed(m < 10000 ? 1 : 0).replace('.', ',')} km`;
  }
  function formatDate(iso) {
    const [y, mo, d] = String(iso || '').split('-');
    return y && mo && d ? `${d}/${mo}/${y}` : '';
  }

  // ---------- Menu ----------
  const menuBtn = $('menuBtn');
  const menu = $('menu');
  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setMenu(menu.hidden);
  });
  document.addEventListener('click', (e) => {
    if (!menu.hidden && !menu.contains(e.target)) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
  });

  // ---------- Ajouter à l'écran d'accueil ----------
  // Android / Chrome : vraie invite d'installation. iPhone / iPad : pas d'API, on affiche la marche à suivre.
  let installPrompt = null;
  const installBtn = $('installBtn');
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isStandalone()) installBtn.hidden = true;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installPrompt = e;
  });
  window.addEventListener('appinstalled', () => {
    installBtn.hidden = true;
    installPrompt = null;
  });

  const SHARE_ICON = '<svg class="share-glyph" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11v9h12v-9"/></svg>';
  function showInstallHelp() {
    const steps = $('installSteps');
    if (isIOS) {
      steps.innerHTML = `<p>Dans Safari :</p><ol>
        <li>Touche le bouton Partager ${SHARE_ICON} en bas de l’écran.</li>
        <li>Choisis « Sur l’écran d’accueil ».</li>
        <li>Touche « Ajouter » en haut à droite.</li></ol>`;
    } else {
      steps.innerHTML = `<p>Dans le menu de ton navigateur :</p><ol>
        <li>Ouvre le menu (⋮ ou ☰).</li>
        <li>Choisis « Ajouter à l’écran d’accueil » ou « Installer l’application ».</li></ol>`;
    }
    const dialog = $('installDialog');
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }
  $('installClose').addEventListener('click', () => {
    const dialog = $('installDialog');
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  });

  installBtn.addEventListener('click', async () => {
    setMenu(false);
    if (installPrompt) {
      installPrompt.prompt();
      try { await installPrompt.userChoice; } catch (_) { /* rien */ }
      installPrompt = null;
    } else {
      showInstallHelp();
    }
  });
})();
