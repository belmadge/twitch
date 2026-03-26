const levelEl = document.getElementById("viewer-level");
const pointsEl = document.getElementById("viewer-points");
const campaignProgressEl = document.getElementById("campaign-progress");
const campaignProgressTextEl = document.getElementById("campaign-progress-text");
const checkoutBtn = document.getElementById("checkout-btn");

function setDemoData() {
  levelEl.textContent = "Lv. 12 - Parceiro";
  pointsEl.textContent = "1.840 pontos de comunidade";
  campaignProgressEl.value = 42;
  campaignProgressTextEl.textContent = "42% concluído";
}

function bootTwitchExtension() {
  if (!window.Twitch || !window.Twitch.ext) {
    setDemoData();
    return;
  }

  window.Twitch.ext.onAuthorized(() => {
    setDemoData();
  });
}

checkoutBtn?.addEventListener("click", () => {
  window.alert("Conecte este botão ao endpoint POST /api/billing/{channel_login}/checkout.");
});

bootTwitchExtension();
