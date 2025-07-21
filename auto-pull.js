(function(){
  const PULL_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutos
  let active = false;
  let onCooldown = false;
  const btn = document.getElementById('autoPullBtn');

  // Função que faz o “puxar”:
  async function pullNext() {
    if (onCooldown) return;
    const item = document.querySelector('.list_dados .atend_aguard');
    if (!item) return;
    // Simula clique no atendimento para abrir painel:
    item.click();
    // espera o botão “Atender” aparecer no painel:
    const atenderBtn = await new Promise(res => {
      const obs = new MutationObserver((ms, o) => {
        const b = document.querySelector('.painel-botoes-atendimento .botoes-principais .orange');
        if (b) {
          obs.disconnect();
          res(b);
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      // timeout de segurança:
      setTimeout(() => { obs.disconnect(); res(null); }, 3000);
    });
    if (atenderBtn) atenderBtn.click();
    // entra em cooldown:
    startCooldown();
  }

  // Desenha o círculo do cooldown:
  function startCooldown() {
    onCooldown = true;
    const fg = btn.querySelector('.timer-fg');
    let start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(1, elapsed / PULL_COOLDOWN_MS) * 100;
      fg.setAttribute('stroke-dasharray', `${pct},100`);
      if (elapsed < PULL_COOLDOWN_MS) {
        requestAnimationFrame(tick);
      } else {
        onCooldown = false;
        fg.setAttribute('stroke-dasharray', `0,100`);
        if (active) bindObserver(); // reativa escuta
      }
    };
    requestAnimationFrame(tick);
  }

  // Observa inserção de novos atendimentos:
  let observer;
  function bindObserver() {
    if (observer) observer.disconnect();
    observer = new MutationObserver((mutations) => {
      if (!active || onCooldown) return;
      for (let m of mutations) {
        for (let n of m.addedNodes) {
          if (n.nodeType===1 && n.classList.contains('atend_aguard')) {
            pullNext();
            return;
          }
        }
      }
    });
    const lista = document.querySelector('.list_dados');
    if (lista) observer.observe(lista, { childList: true });
  }

  // Toggle on/off:
  btn.addEventListener('click', () => {
    active = !active;
    btn.classList.toggle('active', active);
    if (active) {
      bindObserver();
      // puxada imediata caso já haja alguém esperando:
      pullNext();
    } else if (observer) {
      observer.disconnect();
    }
  });
})();
