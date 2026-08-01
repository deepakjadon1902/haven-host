const APP_DATA_CHANGED_EVENT = "haven:app-data-changed";
const APP_DATA_CHANGED_STORAGE_KEY = "haven.appDataChangedAt.v1";

type AppDataChangeDetail = {
  source?: string;
  at: number;
};

function getChannel() {
  if (typeof BroadcastChannel === "undefined") return null;
  return new BroadcastChannel(APP_DATA_CHANGED_EVENT);
}

export function emitAppDataChanged(source?: string) {
  if (typeof window === "undefined") return;

  const detail: AppDataChangeDetail = { source, at: Date.now() };
  window.dispatchEvent(new CustomEvent<AppDataChangeDetail>(APP_DATA_CHANGED_EVENT, { detail }));

  try {
    window.localStorage.setItem(APP_DATA_CHANGED_STORAGE_KEY, JSON.stringify(detail));
  } catch {
    // Ignore private-mode/storage quota failures; same-tab listeners still work.
  }

  const channel = getChannel();
  if (channel) {
    channel.postMessage(detail);
    channel.close();
  }
}

export function subscribeToAppDataChanges(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const onCustomEvent = () => callback();
  const onStorage = (event: StorageEvent) => {
    if (event.key === APP_DATA_CHANGED_STORAGE_KEY) callback();
  };
  const channel = getChannel();
  const onMessage = () => callback();

  window.addEventListener(APP_DATA_CHANGED_EVENT, onCustomEvent);
  window.addEventListener("storage", onStorage);
  channel?.addEventListener("message", onMessage);

  return () => {
    window.removeEventListener(APP_DATA_CHANGED_EVENT, onCustomEvent);
    window.removeEventListener("storage", onStorage);
    channel?.removeEventListener("message", onMessage);
    channel?.close();
  };
}
