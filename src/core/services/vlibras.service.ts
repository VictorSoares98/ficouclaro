export const vlibrasService = {
  load(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('vlibras-script')) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.id = 'vlibras-script';
      script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
      script.onload = () => {
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Falha ao carregar VLibras'));
      };
      document.body.appendChild(script);
    });
  },
  
  unload() {
    const script = document.getElementById('vlibras-script');
    if (script) {
      script.remove();
    }
    const widget = document.querySelector('[vw]');
    if (widget) {
      widget.remove();
    }
  }
};
