import { loadingController } from '@ionic/core';
import { toastController } from '@ionic/vue';

// const constructor(public toastCtrl: ToastController, public loadingCtrl: LoadingController) { }
// loadingCtrl = null;

export function useNotify() {
  let toast: any = null;
  let loader: any = null;

  const show = async (
    message: string,
    position: 'top' | 'bottom' | 'middle' = 'top',
    duration = 5000,
    showCloseButton = false,
  ) => {
    if (toast) {
      toast?.dismiss();
    }

    toast = await toastController.create({
      message: message,
      duration: showCloseButton ? undefined : duration,
      position: position,
      translucent: true,
      // buttons: [
      //   {
      //     text: "Fermer",
      //   }
      // ]
      // showCloseButton: showCloseButton,
      // closeButtonText: 'Fermer',
      // dismissOnPageChange: dismissOnPageChange
    });

    // header?: string;
    // message?: string | IonicSafeString;
    // cssClass?: string | string[];
    // duration?: number;
    // buttons?: (ToastButton | string)[];
    // position?: 'top' | 'bottom' | 'middle';
    // translucent?: boolean;
    // animated?: boolean;
    // icon?: string;
    // htmlAttributes?: ToastAttributes;
    // color?: Color;
    // mode?: Mode;
    // keyboardClose?: boolean;
    // id?: string;
    // enterAnimation?: AnimationBuilder;
    // leaveAnimation?: AnimationBuilder;

    await toast.present();
  };

  const success = (message: string) => {
    show(message, 'bottom', 5000, true);
  };

  const error = (error: string) => {
    show(error, 'bottom', 10000);
  };

  const loading = (message: string) => {
    loader = loadingController.create({
      message,
      translucent: true,
      animated: true,
    });

    // spinner?: SpinnerTypes | null;
    // message?: string | IonicSafeString;
    // cssClass?: string | string[];
    // showBackdrop?: boolean;
    // duration?: number;
    // translucent?: boolean;
    // animated?: boolean;
    // backdropDismiss?: boolean;
    // mode?: Mode;
    // keyboardClose?: boolean;
    // id?: string;
    // htmlAttributes?: LoadingAttributes;
    // enterAnimation?: AnimationBuilder;
    // leaveAnimation?: AnimationBuilder;
    loader.present();
  };

  const hideLoader = () => {
    if (loader) loader.dismiss();
  };

  const dismissAll = () => {
    if (toast) {
      toast.dismiss();
    }
  };

  return {
    success,
    error,
    loading,
    hideLoader,
    dismissAll,
  };
}
