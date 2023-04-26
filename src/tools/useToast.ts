import { loadingController } from "@ionic/core";
import { toastController } from "@ionic/vue";

export function useNotify() {
  let toast: any = null;
  let loader: any = null;

  const show = async (
    message: string,
    position: "top" | "bottom" | "middle" = "top",
    duration = 5000,
    showCloseButton = false
  ) => {
    if (toast) {
      toast?.dismiss();
    }

    toast = await toastController.create({
      message: message,
      duration: duration,
      position: position,
      translucent: true,
      buttons: showCloseButton ? [{ text: "Fermer" }] : [],
    });

    await toast.present();
  };

  const success = (message: string) => {
    show(message, "bottom", 5000, true);
  };

  const error = (error: string) => {
    show(error, "bottom", 10000);
  };

  const loading = (message: string) => {
    loader = loadingController.create({
      message,
      translucent: true,
      animated: true,
    });

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
