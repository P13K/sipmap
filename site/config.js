// SipMap — réglages modifiables sans toucher au reste du code.

// Lien de la page de dons (Ko-fi). Exemple : 'https://ko-fi.com/sipmap'
// Tant qu'il est vide, les boutons « Offrir un café » restent masqués.
window.SIPMAP_DONATE_URL = 'https://ko-fi.com/sipmanpierrick';

(function () {
  const url = window.SIPMAP_DONATE_URL;
  if (!url) return;
  document.querySelectorAll('[data-donate]').forEach((el) => { el.hidden = false; });
  document.querySelectorAll('[data-donate-link]').forEach((a) => { a.href = url; });
})();
