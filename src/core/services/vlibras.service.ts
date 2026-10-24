declare global {
  interface Window {
    VLibras?: {
      Widget: new (url: string) => unknown;
    };
    VLibrasWidget?: {
      initBtn?: HTMLElement;
      box?: HTMLElement;
      player?: HTMLElement;
      close?: () => void;
    };
  }
}

class VLibrasService {
  private isScriptLoaded = false;
  private isMounted = false;

  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('vlibras-script') && window.VLibras) {
        this.isScriptLoaded = true;
        resolve();
        return;
      }

      const existingScript = document.getElementById('vlibras-script');
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          this.isScriptLoaded = true;
          resolve();
        });
        existingScript.addEventListener('error', () => {
          reject(new Error('Falha ao carregar o script do VLibras'));
        });
        return;
      }

      const script = document.createElement('script');
      script.id = 'vlibras-script';
      script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
      script.async = true;
      script.onload = () => {
        this.isScriptLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Falha ao carregar o script do VLibras'));
      };
      document.body.appendChild(script);
    });
  }

  private ensurePortalElement(): void {
    if (document.querySelector('[vw]')) return;

    const portal = document.createElement('div');
    portal.id = 'vlibras-portal-root';
    portal.innerHTML = `
      <div vw class="enabled">
        <div vw-access-button class="active"></div>
        <div vw-plugin-wrapper>
          <div class="vw-plugin-top-wrapper"></div>
        </div>
      </div>
    `;
    document.body.appendChild(portal);
  }

  async mount(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (this.isMounted && document.querySelector('[vw]')) return true;

    try {
      this.ensurePortalElement();
      await this.loadScript();

      if (window.VLibras) {
        new window.VLibras.Widget('https://vlibras.gov.br/app');
        this.isMounted = true;
        return true;
      }
      return false;
    } catch (error) {
      console.warn('[VLibrasService] Falha ao inicializar VLibras:', error);
      this.destroy();
      return false;
    }
  }

  destroy(): void {
    if (typeof document === 'undefined') return;

    // 1. Desconecta o iframe do Unity 3D WebGL para descarregar o motor gráfico e parar sensores
    const iframes = document.querySelectorAll<HTMLIFrameElement>(
      '[vw] iframe, [vw-plugin-wrapper] iframe, iframe[src*="vlibras"]',
    );
    iframes.forEach((iframe) => {
      try {
        iframe.src = 'about:blank';
      } catch {
        // Ignora erro cross-origin se houver
      }
      iframe.remove();
    });

    // 3. Remove referências internas do botão flutuante e do player (VLibrasWidget 7.0+)
    const win = window as unknown as {
      VLibrasWidget?: {
        initBtn?: HTMLElement;
        box?: HTMLElement;
        player?: HTMLElement;
        close?: () => void;
      };
      VLibras?: unknown;
    };

    if (win.VLibrasWidget) {
      try {
        if (typeof win.VLibrasWidget.close === 'function') {
          win.VLibrasWidget.close();
        }
        if (win.VLibrasWidget.initBtn) {
          win.VLibrasWidget.initBtn.remove();
        }
        if (win.VLibrasWidget.box) {
          win.VLibrasWidget.box.remove();
        }
        if (win.VLibrasWidget.player) {
          win.VLibrasWidget.player.remove();
        }
      } catch (e) {
        console.warn('[VLibrasService] Limpeza de instâncias do VLibrasWidget:', e);
      }
      delete win.VLibrasWidget;
    }

    // 4. Remove todos os containers, seletores de atributos e botões do VLibras injetados no DOM
    const selectors = [
      '#vlibras-portal-root',
      '[vw]',
      '[vw-access-button]',
      '[vw-plugin-wrapper]',
      '.vw-plugin-top-wrapper',
      '[vp]',
      '[class*="vw-"]',
      '[class*="vlibras"]',
      '[id*="vlibras"]',
      'div[class*="access-button"]',
      '.access-button',
    ];
    const elements = document.querySelectorAll<HTMLElement>(selectors.join(', '));
    elements.forEach((el) => {
      el.remove();
    });

    // 5. Remove scripts dinâmicos injetados pelo VLibras
    const scripts = document.querySelectorAll<HTMLElement>(
      'script#vlibras-script, script[src*="vlibras"]',
    );
    scripts.forEach((el) => {
      el.remove();
    });

    // 6. Reseta variáveis de controle
    delete win.VLibras;
    this.isScriptLoaded = false;
    this.isMounted = false;
  }

  isLoaded(): boolean {
    return this.isScriptLoaded;
  }

  getMounted(): boolean {
    return this.isMounted;
  }
}

export const vlibrasService = new VLibrasService();
