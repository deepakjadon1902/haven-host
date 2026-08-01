import { apiFetch, hasApiBase } from "@/lib/api-client";
import { setUserToken } from "@/lib/user-session";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (opts: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            opts: {
              theme?: string;
              size?: string;
              type?: string;
              shape?: string;
              text?: string;
              width?: number;
            },
          ) => void;
        };
      };
    };
  }
}

export async function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.google?.accounts?.id) return;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Google script")), {
        once: true,
      });
      return;
    }

    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(s);
  });
}

export function canUseGoogleAuth() {
  return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID) && hasApiBase();
}

export async function renderGoogleButton(opts: {
  container: HTMLElement;
  onSuccess: (result: { token: string; user: { email: string; role: string } }) => void;
  onError: (error: Error) => void;
  variant?: "signin" | "signup";
}) {
  try {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      throw new Error("Missing VITE_GOOGLE_CLIENT_ID");
    }
    if (!hasApiBase()) {
      throw new Error("Missing VITE_API_BASE_URL");
    }

    await loadGoogleIdentityScript();

    const google = window.google;
    if (!google?.accounts?.id) throw new Error("Google Identity Services not available");

    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response: { credential?: string }) => {
        try {
          const credential = response?.credential;
          if (!credential) throw new Error("Missing Google credential");
          const result = await apiFetch<{ token: string; user: { email: string; role: string } }>(
            "/auth/google",
            { method: "POST", json: { credential } },
          );
          setUserToken(result.token);
          opts.onSuccess(result);
        } catch (e) {
          opts.onError(e instanceof Error ? e : new Error("Google sign-in failed"));
        }
      },
    });

    opts.container.innerHTML = "";
    google.accounts.id.renderButton(opts.container, {
      theme: "outline",
      size: "large",
      type: "standard",
      shape: "pill",
      text: opts.variant === "signup" ? "signup_with" : "signin_with",
      width: 360,
    });
  } catch (e) {
    opts.onError(e instanceof Error ? e : new Error("Google auth init failed"));
  }
}
