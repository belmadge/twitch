const params = new URLSearchParams(window.location.search);
const channel = params.get("channel");

if (!channel) {
  document.getElementById("status").textContent = "Canal não informado.";
} else {
  boot(channel).catch((error) => {
    document.getElementById("status").textContent = `Erro: ${error.message}`;
  });
}

async function boot(login) {
  const status = document.getElementById("status");
  const data = await api(`/api/channels/${login}/dashboard`);

  status.textContent = `Canal ${data.user.displayName} conectado.`;

  renderList(
    document.getElementById("commands"),
    data.commands.map((item) => `${item.trigger} → ${item.response}`)
  );

  renderList(
    document.getElementById("clips"),
    data.clips.map((item) => `${item.suggestedTitle} (${item.score} pts)`)
  );

  renderList(
    document.getElementById("viewers"),
    data.viewers.slice(0, 10).map((item) => `${item.username}: ${item.points} pts`)
  );

  document.getElementById("command-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const trigger = document.getElementById("trigger").value.trim();
    const response = document.getElementById("response").value.trim();

    await api(`/api/channels/${login}/commands`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ trigger, response })
    });

    window.location.reload();
  });

  document.getElementById("checkout").addEventListener("click", async () => {
    const payload = await api(`/api/channels/${login}/billing/checkout`, { method: "POST" });
    if (!payload.checkoutUrl) {
      alert("Billing não configurado.");
      return;
    }
    window.location.href = payload.checkoutUrl;
  });
}

async function api(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Falha na API");
  }

  return payload;
}

function renderList(element, items) {
  element.innerHTML = "";

  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = "Sem dados ainda.";
    element.appendChild(li);
    return;
  }

  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    element.appendChild(li);
  }
}
