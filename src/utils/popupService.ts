import { Popup, type PopupShowOptions } from '../components/molecules/Popup/index.ts';

export interface ShowPopupOptions extends PopupShowOptions {
  duration?: number;
}

class PopupService {
  private popup: Popup;

  private hideTimeoutId: number | null = null;

  constructor() {
    this.popup = new Popup();
    this.mount();
  }

  private mount(): void {
    if (typeof document === 'undefined') return;

    const element = this.popup.getContent();
    if (!document.body.contains(element)) {
      document.body.appendChild(element);
    }
  }

  private clearPendingHide(): void {
    if (this.hideTimeoutId !== null) {
      window.clearTimeout(this.hideTimeoutId);
      this.hideTimeoutId = null;
    }
  }

  public show(options: ShowPopupOptions): void {
    this.clearPendingHide();
    this.popup.showPopup(options);

    if (options.duration && Number.isFinite(options.duration) && options.duration > 0) {
      this.hideTimeoutId = window.setTimeout(() => {
        this.popup.close();
        this.hideTimeoutId = null;
      }, options.duration);
    }
  }

  public hide(): void {
    this.clearPendingHide();
    this.popup.close();
  }
}

const popupService = new PopupService();

export default popupService;

export const showPopup = (options: ShowPopupOptions): void => {
  popupService.show(options);
};

export const hidePopup = (): void => {
  popupService.hide();
};
