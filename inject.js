// === INJEÇÃO NO MENU LATERAL ===
const menu = document.querySelector('.menu');
if (menu && !document.querySelector('#autoPullBtn')) {
  const btn = document.createElement('div');
  btn.id = 'autoPullBtn';
  btn.classList.add('item');
  btn.title = 'Auto‑puxar fila';
  btn.innerHTML = `
    <i class="fas fa-play"></i>
    <svg class="timer-circle" viewBox="0 0 36 36">
      <path class="timer-bg" d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"/>
      <path class="timer-fg" stroke-dasharray="0,100"
          d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"/>
    </svg>
  `;
  // styling inline básico
  Object.assign(btn.style, {
    position: 'relative',
    cursor: 'pointer',
    width: '36px',
    height: '36px',
    margin: '8px'
  });
  // círculo SVG sobreposto
  const style = document.createElement('style');
  style.textContent = `
    #autoPullBtn .timer-circle {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      transform: rotate(-90deg);
      pointer-events: none;
    }
    #autoPullBtn .timer-bg {
      fill: none; stroke: rgba(0,0,0,0.1);
      stroke-width: 4;
    }
    #autoPullBtn .timer-fg {
      fill: none; stroke: #4A90E2;
      stroke-width: 4; transition: stroke-dasharray 1s linear;
    }
    #autoPullBtn.active .timer-fg {
      stroke: red;
    }
  `;
  document.head.appendChild(style);
  menu.appendChild(btn);
}
