import { Intent, Position, Toaster } from "@blueprintjs/core";

/** Singleton toaster instance. Create separate instances for different options. */
export const AppToaster =
  typeof window !== "undefined"
    ? Toaster.create({
        className: "app-toaster",
        position: Position.TOP
      })
    : null;

export const toasts = (message: string) =>
  AppToaster?.show({
    message
  });

export const showSuccessToast = (message: string) =>
  AppToaster?.show({
    message,
    intent: Intent.SUCCESS
  });

export const showSuccessToastAfterClear = (message: string) => {
  AppToaster?.clear();
  AppToaster?.show({
    message,
    intent: Intent.SUCCESS
  });
};

export const showErrorToast = (message: string) =>
  AppToaster?.show({
    message,
    intent: Intent.DANGER
  });

export const showLongErrorToast = (message: string) =>
  AppToaster?.show({
    message,
    intent: Intent.DANGER,
    timeout: 60000
  });

export const showWarningToast = (message: string) =>
  AppToaster?.show({
    message,
    intent: Intent.WARNING
  });
