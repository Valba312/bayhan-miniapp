export type TgWebApp = {
  initData?: string;
  initDataUnsafe?: any;
  colorScheme?: string;
  MainButton: { setParams: (p: any) => void; onClick: (fn: () => void) => void; show: () => void; hide: () => void; };
  BackButton: { show: () => void; hide: () => void; onClick: (fn: () => void) => void; };
  themeParams?: Record<string, string>;
  ready: () => void;
};

export function getTg(): TgWebApp | null {
  const anyWindow = window as any;
  if (anyWindow?.Telegram?.WebApp) return anyWindow.Telegram.WebApp as TgWebApp;
  return null;
}