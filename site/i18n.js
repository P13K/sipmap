// SipMap — textes de l'interface en anglais, français et espagnol.
// La langue suit celle du téléphone (anglais par défaut). Pour tester : ?lang=fr, ?lang=es ou ?lang=en.
// Le HTML contient la version anglaise ; une clé absente ici laisse le texte du HTML tel quel.
(() => {
  'use strict';

  const SUPPORTED = ['en', 'fr', 'es'];

  function pickLang() {
    const forced = new URLSearchParams(location.search).get('lang');
    if (SUPPORTED.includes(forced)) return forced;
    const prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
    for (const l of prefs) {
      const base = String(l).toLowerCase().split('-')[0];
      if (SUPPORTED.includes(base)) return base;
    }
    return 'en';
  }

  const STRINGS = {
    en: {
      mapLabel: 'Map of drinking water points',
      menu: 'Menu',
      install: 'Add to home screen',
      about: 'About SipMap',
      coffee: 'Buy me a coffee',
      coffeeSub: 'SipMap is free, with no ads',
      installTitle: 'Add SipMap to your home screen',
      gotIt: 'Got it',
      nearestAria: 'Nearest water points',
      nearest: 'Nearest',
      locating: 'Finding your location…',
      legend: 'Legend',

      type_fontaine: 'Fountain',
      type_robinet: 'Tap',
      type_source: 'Spring',
      type_toilettes: 'Toilets with drinking water',
      short_toilettes: 'Toilets',
      type_remplissage: 'Refill point',
      short_remplissage: 'Refill',
      type_puits: 'Well',
      type_autre: 'Drinking water',
      short_autre: 'Other',

      posUnavailable: 'Location unavailable: the list uses the centre of the map.',
      dataUnavailable: 'Data unavailable right now. Try again in a few minutes.',
      zoomIn: 'Zoom in to see water points.',
      zoomOrLocate: 'Zoom in or turn on your location',
      aroundYou: 'Around you',
      aroundCenter: 'Around the centre of the map',
      noneNear: 'No known water point within 30 km.',
      loading: 'Loading data…',

      seasonal_yes: 'Seasonal, may be off in winter',
      seasonal_no: 'All year round',
      seasonal_summer: 'Summer only',
      seasonal_spring: 'In spring',
      seasonal_autumn: 'In autumn',
      seasonal_winter: 'Winter only',
      seasonalOther: 'Seasonal: {v}',
      fee_yes: 'Paid',
      fee_no: 'Free',
      feeOther: 'Fee: {v}',
      bottle_yes: 'Easy to refill a bottle',
      bottle_no: 'Hard to refill a bottle',
      bottleOther: 'Bottle: {v}',
      hours: 'Opening hours: {v}',
      access_customers: 'Customers only',
      access_permissive: 'Access tolerated',
      access_destination: 'Local access only',
      access_permit: 'With permission only',
      distFromYou: '{d} from you, as the crow flies',
      getThere: 'Get there',
      osmLink: 'View or fix on OpenStreetMap ↗',

      iosIntro: 'In Safari:',
      ios1: 'Tap the Share button {icon} at the bottom of the screen.',
      ios2: 'Choose “Add to Home Screen”.',
      ios3: 'Tap “Add” in the top right corner.',
      otherIntro: 'In your browser menu:',
      other1: 'Open the menu (⋮ or ☰).',
      other2: 'Choose “Add to Home screen” or “Install app”.',
    },

    fr: {
      mapLabel: 'Carte des points d’eau potable',
      menu: 'Menu',
      install: 'Ajouter à l’écran d’accueil',
      about: 'À propos de SipMap',
      coffee: 'Offrir un café',
      coffeeSub: 'SipMap est gratuit, sans pub',
      installTitle: 'Ajouter SipMap à l’écran d’accueil',
      gotIt: 'Compris',
      nearestAria: 'Points d’eau les plus proches',
      nearest: 'Les plus proches',
      locating: 'Recherche de ta position…',
      legend: 'Légende',

      type_fontaine: 'Fontaine',
      type_robinet: 'Robinet',
      type_source: 'Source',
      type_toilettes: 'Toilettes avec eau potable',
      short_toilettes: 'Toilettes',
      type_remplissage: 'Point de remplissage',
      short_remplissage: 'Remplissage',
      type_puits: 'Puits',
      type_autre: 'Point d’eau potable',
      short_autre: 'Autre',

      posUnavailable: 'Position indisponible : la liste se base sur le centre de la carte.',
      dataUnavailable: 'Données indisponibles pour l’instant. Réessaie dans quelques minutes.',
      zoomIn: 'Zoome pour afficher les points d’eau.',
      zoomOrLocate: 'Zoome ou active ta position',
      aroundYou: 'Autour de toi',
      aroundCenter: 'Autour du centre de la carte',
      noneNear: 'Aucun point d’eau connu dans les 30 km.',
      loading: 'Chargement des données…',

      seasonal_yes: 'Saisonnier, peut être coupé l’hiver',
      seasonal_no: 'Toute l’année',
      seasonal_summer: 'L’été seulement',
      seasonal_spring: 'Au printemps',
      seasonal_autumn: 'En automne',
      seasonal_winter: 'L’hiver seulement',
      seasonalOther: 'Saisonnier : {v}',
      fee_yes: 'Payant',
      fee_no: 'Gratuit',
      feeOther: 'Tarif : {v}',
      bottle_yes: 'Remplissage de gourde facile',
      bottle_no: 'Peu pratique pour remplir une gourde',
      bottleOther: 'Gourde : {v}',
      hours: 'Horaires : {v}',
      access_customers: 'Réservé aux clients',
      access_permissive: 'Accès toléré',
      access_destination: 'Accès riverains',
      access_permit: 'Sur autorisation',
      distFromYou: 'À {d} de toi, à vol d’oiseau',
      getThere: 'Rejoindre ce point d’eau',
      osmLink: 'Voir ou corriger sur OpenStreetMap ↗',

      iosIntro: 'Dans Safari :',
      ios1: 'Touche le bouton Partager {icon} en bas de l’écran.',
      ios2: 'Choisis « Sur l’écran d’accueil ».',
      ios3: 'Touche « Ajouter » en haut à droite.',
      otherIntro: 'Dans le menu de ton navigateur :',
      other1: 'Ouvre le menu (⋮ ou ☰).',
      other2: 'Choisis « Ajouter à l’écran d’accueil » ou « Installer l’application ».',

      // Page À propos
      aboutTitle: 'À propos de SipMap',
      back: 'Retour à la carte',
      heroTitle: 'Trouve de l’eau potable près de toi, en un coup d’œil.',
      heroLead: 'SipMap est une carte simple des points d’eau potable publics. Elle est faite pour les randonneurs, traileurs, coureurs et cyclistes qui doivent remplir leur gourde en route.',
      whyTitle: 'Pourquoi SipMap',
      why1: 'Des bénévoles du monde entier ont déjà cartographié d’innombrables fontaines, robinets et sources dans OpenStreetMap. Ces données sont bonnes, mais les applis de cartes généralistes les noient au milieu des commerces, des routes et de tout le reste.',
      why2: 'SipMap ne montre qu’une chose : où boire. Tu l’ouvres, tu vois l’eau autour de toi, et tu y vas.',
      typesTitle: 'Ce que tu trouveras sur la carte',
      pl_fontaine: 'Fontaines',
      pl_robinet: 'Robinets',
      pl_source: 'Sources',
      pl_toilettes: 'Toilettes avec eau potable',
      pl_remplissage: 'Points de remplissage',
      pl_puits: 'Puits',
      typesNote: 'Seuls les points qu’OpenStreetMap indique comme potables sont affichés. Les robinets marqués non potables et les points privés sont écartés.',
      howTitle: 'Comment ça marche',
      how1: 'Chaque semaine, SipMap télécharge les données OpenStreetMap à jour et ne garde que les points d’eau potable.',
      how2: 'Ta position sert uniquement dans ton navigateur, pour trier les points les plus proches. Elle n’est jamais envoyée ni enregistrée.',
      how3: 'Pas de compte, pas de cookies.',
      how4: 'Depuis la fiche d’un point, un bouton ouvre l’itinéraire à pied dans Google Maps.',
      how5: 'Couverture actuelle : France et Espagne, Baléares comprises. D’autres pays suivront.',
      supportTitle: 'Garder SipMap gratuit',
      supportText: 'SipMap n’a ni pub, ni compte, ni pistage, et ça restera comme ça. Il est développé et maintenu par une seule personne, sur son temps libre. S’il t’a aidé à remplir ta gourde lors d’une longue sortie, tu peux m’offrir un café.',
      supportBtn: 'Offrir un café',
      supportFine: 'Le paiement passe par Ko-fi. SipMap ne voit jamais tes coordonnées bancaires.',
      warnTitle: 'Avant de boire',
      warnText: 'La carte est tenue à jour par une communauté et n’offre aucune garantie. Une fontaine peut être coupée l’hiver ou hors service. Vérifie l’affichage sur place, et filtre ou traite l’eau de source en cas de doute.',
      mistakeTitle: 'Une erreur ?',
      mistakeText: 'Chaque point renvoie vers OpenStreetMap. Corrige-le là-bas, ou ajoute une fontaine manquante : SipMap prendra la modification en compte sous une semaine. Et tous ceux qui utilisent OpenStreetMap en profitent aussi.',
      creditsTitle: 'Crédits',
      credit1: 'Données cartographiques © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">contributeurs OpenStreetMap</a>, sous licence Open Database License.',
      credit2: 'Fond de carte <a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> et <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a>, affiché avec <a href="https://maplibre.org" target="_blank" rel="noopener">MapLibre</a>.',
      credit3: 'Code source et données des points d’eau sur <a href="https://github.com/P13K/sipmap" target="_blank" rel="noopener">GitHub</a>.',
      openMap: 'Ouvrir la carte',
      foot: 'SipMap est un projet gratuit et indépendant.',
    },

    es: {
      mapLabel: 'Mapa de puntos de agua potable',
      menu: 'Menú',
      install: 'Añadir a la pantalla de inicio',
      about: 'Acerca de SipMap',
      coffee: 'Invítame a un café',
      coffeeSub: 'SipMap es gratis y sin anuncios',
      installTitle: 'Añadir SipMap a la pantalla de inicio',
      gotIt: 'Entendido',
      nearestAria: 'Puntos de agua más cercanos',
      nearest: 'Los más cercanos',
      locating: 'Buscando tu ubicación…',
      legend: 'Leyenda',

      type_fontaine: 'Fuente',
      type_robinet: 'Grifo',
      type_source: 'Manantial',
      type_toilettes: 'Aseos con agua potable',
      short_toilettes: 'Aseos',
      type_remplissage: 'Punto de recarga',
      short_remplissage: 'Recarga',
      type_puits: 'Pozo',
      type_autre: 'Punto de agua potable',
      short_autre: 'Otro',

      posUnavailable: 'Ubicación no disponible: la lista usa el centro del mapa.',
      dataUnavailable: 'Datos no disponibles por ahora. Vuelve a intentarlo en unos minutos.',
      zoomIn: 'Acerca el mapa para ver los puntos de agua.',
      zoomOrLocate: 'Acerca el mapa o activa tu ubicación',
      aroundYou: 'A tu alrededor',
      aroundCenter: 'Alrededor del centro del mapa',
      noneNear: 'Ningún punto de agua conocido a menos de 30 km.',
      loading: 'Cargando datos…',

      seasonal_yes: 'Estacional, puede cortarse en invierno',
      seasonal_no: 'Todo el año',
      seasonal_summer: 'Solo en verano',
      seasonal_spring: 'En primavera',
      seasonal_autumn: 'En otoño',
      seasonal_winter: 'Solo en invierno',
      seasonalOther: 'Estacional: {v}',
      fee_yes: 'De pago',
      fee_no: 'Gratis',
      feeOther: 'Tarifa: {v}',
      bottle_yes: 'Fácil para rellenar una botella',
      bottle_no: 'Poco práctico para rellenar una botella',
      bottleOther: 'Botella: {v}',
      hours: 'Horario: {v}',
      access_customers: 'Solo clientes',
      access_permissive: 'Acceso tolerado',
      access_destination: 'Solo acceso local',
      access_permit: 'Con autorización',
      distFromYou: 'A {d} de ti, en línea recta',
      getThere: 'Cómo llegar',
      osmLink: 'Ver o corregir en OpenStreetMap ↗',

      iosIntro: 'En Safari:',
      ios1: 'Toca el botón Compartir {icon} en la parte inferior de la pantalla.',
      ios2: 'Elige «Añadir a pantalla de inicio».',
      ios3: 'Toca «Añadir» arriba a la derecha.',
      otherIntro: 'En el menú de tu navegador:',
      other1: 'Abre el menú (⋮ o ☰).',
      other2: 'Elige «Añadir a pantalla de inicio» o «Instalar aplicación».',

      // Página Acerca de
      aboutTitle: 'Acerca de SipMap',
      back: 'Volver al mapa',
      heroTitle: 'Encuentra agua potable cerca de ti, de un vistazo.',
      heroLead: 'SipMap es un mapa sencillo de los puntos de agua potable públicos. Está pensado para senderistas, corredores de trail, runners y ciclistas que necesitan rellenar agua por el camino.',
      whyTitle: 'Por qué existe SipMap',
      why1: 'Voluntarios de todo el mundo ya han cartografiado innumerables fuentes, grifos y manantiales en OpenStreetMap. Esos datos son buenos, pero las aplicaciones de mapas generalistas los esconden entre tiendas, carreteras y todo lo demás.',
      why2: 'SipMap solo muestra una cosa: dónde beber. Ábrelo, mira el agua a tu alrededor y ve.',
      typesTitle: 'Qué encontrarás en el mapa',
      pl_fontaine: 'Fuentes',
      pl_robinet: 'Grifos',
      pl_source: 'Manantiales',
      pl_toilettes: 'Aseos con agua potable',
      pl_remplissage: 'Puntos de recarga',
      pl_puits: 'Pozos',
      typesNote: 'Solo se muestran los puntos que OpenStreetMap marca como agua potable. Los grifos marcados como no potables y los puntos privados se descartan.',
      howTitle: 'Cómo funciona',
      how1: 'Cada semana, SipMap descarga los datos actualizados de OpenStreetMap y conserva solo los puntos de agua potable.',
      how2: 'Tu ubicación solo se usa en tu navegador para ordenar los puntos más cercanos. Nunca se envía ni se guarda.',
      how3: 'Sin cuenta y sin cookies.',
      how4: 'Desde la ficha de un punto, un botón abre la ruta a pie en Google Maps.',
      how5: 'Cobertura actual: Francia y España, incluidas las Baleares. Llegarán más países.',
      supportTitle: 'Mantener SipMap gratis',
      supportText: 'SipMap no tiene anuncios, ni cuentas, ni rastreo, y seguirá así. Lo desarrolla y mantiene una sola persona en su tiempo libre. Si te ayudó a rellenar agua en una salida larga, puedes invitarme a un café.',
      supportBtn: 'Invítame a un café',
      supportFine: 'El pago se hace a través de Ko-fi. SipMap nunca ve los datos de tu tarjeta.',
      warnTitle: 'Antes de beber',
      warnText: 'El mapa lo mantiene una comunidad y no ofrece ninguna garantía. Una fuente puede estar cortada en invierno o averiada. Comprueba los carteles en el lugar y filtra o trata el agua de manantial si tienes dudas.',
      mistakeTitle: '¿Has visto un error?',
      mistakeText: 'Cada punto enlaza con OpenStreetMap. Corrígelo allí o añade una fuente que falte, y SipMap recogerá el cambio en una semana. Además, todos los que usan OpenStreetMap salen ganando.',
      creditsTitle: 'Créditos',
      credit1: 'Datos del mapa © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">colaboradores de OpenStreetMap</a>, bajo la licencia Open Database License.',
      credit2: 'Mapa base de <a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> y <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a>, mostrado con <a href="https://maplibre.org" target="_blank" rel="noopener">MapLibre</a>.',
      credit3: 'Código fuente y datos de los puntos de agua en <a href="https://github.com/P13K/sipmap" target="_blank" rel="noopener">GitHub</a>.',
      openMap: 'Abrir el mapa',
      foot: 'SipMap es un proyecto gratuito e independiente.',
    },
  };

  const lang = pickLang();
  const dict = STRINGS[lang];

  // Texte d'une clé dans la langue choisie, avec repli sur l'anglais ; undefined si inconnue.
  function lookup(key) {
    if (key in dict) return dict[key];
    if (key in STRINGS.en) return STRINGS.en[key];
    return undefined;
  }

  function t(key, vars) {
    let s = lookup(key);
    if (s === undefined) return key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(v);
    return s;
  }

  // Remplace les textes marqués data-i18n (texte), data-i18n-html (texte avec liens) et data-i18n-aria (aria-label).
  function apply(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-i18n]').forEach((el) => {
      const s = lookup(el.dataset.i18n);
      if (s !== undefined) el.textContent = s;
    });
    scope.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const s = lookup(el.dataset.i18nHtml);
      if (s !== undefined) el.innerHTML = s;
    });
    scope.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const s = lookup(el.dataset.i18nAria);
      if (s !== undefined) el.setAttribute('aria-label', s);
    });
    const titleKey = document.documentElement.dataset.i18nTitle;
    if (titleKey && lookup(titleKey) !== undefined) document.title = lookup(titleKey);
  }

  const locale = { en: 'en-GB', fr: 'fr-FR', es: 'es-ES' }[lang];
  function formatDistance(m) {
    if (m < 1000) return `${Math.max(10, Math.round(m / 10) * 10)} m`;
    const km = new Intl.NumberFormat(locale, { maximumFractionDigits: m < 10000 ? 1 : 0, minimumFractionDigits: m < 10000 ? 1 : 0 }).format(m / 1000);
    return `${km} km`;
  }
  function formatDate(iso) {
    const d = new Date(`${iso}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  }

  document.documentElement.lang = lang;
  window.SipMapI18n = { lang, t, apply, formatDistance, formatDate };
  apply();
})();
