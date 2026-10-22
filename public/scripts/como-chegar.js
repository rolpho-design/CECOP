
    (function() {
      const copyBtn = document.getElementById('copy-address-btn');
      const copyText = document.getElementById('copy-text');
      const copyIcon = document.getElementById('copy-icon');
      const fullAddress = document.body.dataset.address;

      if (copyBtn) {
        copyBtn.addEventListener('click', function() {
          navigator.clipboard.writeText(fullAddress).then(function() {
            copyText.textContent = 'Endereço Copiado com Sucesso!';
            copyIcon.textContent = 'done';
            copyBtn.classList.remove('bg-primary-container/60');
            copyBtn.classList.add('bg-secondary-container', 'text-on-secondary-container');

            setTimeout(function() {
              copyText.textContent = 'Copiar Endereço Completo';
              copyIcon.textContent = 'content_copy';
              copyBtn.classList.remove('bg-secondary-container', 'text-on-secondary-container');
              copyBtn.classList.add('bg-primary-container/60');
            }, 3000);
          }).catch(function() {
            prompt('Copie o endereço manualmente:', fullAddress);
          });
        });
      }

      // Map Expand Micro-interaction
      const expandBtn = document.getElementById('expand-map-toggle');
      if (expandBtn) {
        expandBtn.addEventListener('click', function() {
          window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(fullAddress), '_blank', 'noopener,noreferrer');
        });
      }
    })();
  