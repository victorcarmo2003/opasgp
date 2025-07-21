(function() {
  console.log('Script iniciado, configurando MutationObserver...');

  const observer = new MutationObserver((mutations, obs) => {
    console.log('Procurando div.dialog_panel[data-id]...');
    const div = document.querySelector('div.dialog_panel[data-id]');
    if (!div) {
      console.log('Div não encontrada');
      return;
    }
    console.log('Div encontrada:', div);

    // Verifica se o botão já foi adicionado para evitar duplicatas
    if (div.querySelector('button[data-sgp-button]')) {
      console.log('Botão já existe nesta div, ignorando...');
      return;
    }

    const button = document.createElement('button');
    button.setAttribute('data-sgp-button', 'true'); // Marca o botão para identificação
    button.style.width = '90%';
    button.style.backgroundColor = '#4A90E2';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.padding = '10px';
    button.style.cursor = 'pointer';
    button.style.marginTop = '10px'; // Adiciona margem para melhor visualização
    button.textContent = 'Abrir no SGP';

    console.log('Procurando elemento empresa...');
    const clientIdElement = div.querySelector('.empresa');
    if (clientIdElement) {
      console.log('Elemento empresa encontrado:', clientIdElement);
      const text = clientIdElement.textContent;
      const match = text.match(/(\d+) - .*/);
      if (match) {
        const clientId = match[1];
        console.log('ID do cliente:', clientId);
        button.addEventListener('click', () => {
          window.open(`https://intranet.fibranetbrasil.com.br/admin/cliente/${clientId}/edit/`, '_blank');
        });
      } else {
        console.log('ID do cliente não encontrado no texto:', text);
      }
    } else {
      console.log('Elemento empresa não encontrado');
    }

    console.log('Procurando elemento botoes...');
    const buttonsDiv = div.querySelector('.botoes');
    if (buttonsDiv) {
      console.log('Elemento botoes encontrado:', buttonsDiv);
      buttonsDiv.appendChild(button);
    } else {
      console.log('Elemento botoes não encontrado, adicionando botão diretamente na div');
      div.appendChild(button); // Adiciona o botão diretamente na div se .botoes não existir
    }
  });

  // Configura o MutationObserver para monitorar continuamente
  observer.observe(document.body, { childList: true, subtree: true });
  console.log('MutationObserver configurado para monitorar mudanças no DOM');
})();