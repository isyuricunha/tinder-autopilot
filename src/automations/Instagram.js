import { insertCss } from '../misc/insert-css';

class Instagram {
  modalSelector = '#modal-manager';
  
  imageSelector = `${this.modalSelector} div[style*="instagram"]`;

  observer;

  constructor() {
    insertCss(`
    #modal-manager div[style*="instagram"] { cursor: zoom-in; }
    #modal-manager div[style*="instagram"]:hover {
        border: 3px solid #40a9ff;
    }
    `);

    try {
      const target = document.querySelector('[role="dialog"]')?.parentElement?.parentElement;
      if (target) {
        const observer = new MutationObserver(this.start);
        observer.observe(target, { childList: true });
        this.observer = observer;
      }
    } catch (e) {
      console.warn('Instagram module: Could not set up observer', e);
    }
  }

  start = () => {
    setTimeout(() => {
      document.querySelectorAll(this.imageSelector).forEach((ig) => {
        const url = ig.style.backgroundImage.slice(4, -1).replace(/"/g, '');
        ig.addEventListener('click', () => {
          window.open(url);
        });
      });
    }, 500);
  };

  stop = () => {
    this.observer.disconnect();
  };
}

export default Instagram;
