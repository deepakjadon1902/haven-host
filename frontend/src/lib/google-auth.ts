import { apiFetch, hasApiBase } from "@/lib/api-client";
import { upsertGoogleLocalUser } from "@/lib/local-auth";
import { setStoredUser, setUserToken, type AppUser } from "@/lib/user-session";

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
  return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
}

function toAppUser(user: { email: string; fullName?: string; role: string }): AppUser {
  return {
    id: user.email,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };
}

function decodeGoogleCredential(credential: string): { email?: string; name?: string } | null {
  const payload = credential.split(".")[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );
    return JSON.parse(json) as { email?: string; name?: string };
  } catch {
    return null;
  }
}

function friendlyGoogleError() {
  return new Error("Google sign-in is unavailable right now. Please continue with email.");
}

export async function renderGoogleButton(opts: {
  container: HTMLElement;
  onSuccess: (result: { token: string; user: AppUser }) => void;
  onError: (error: Error) => void;
  variant?: "signin" | "signup";
}) {
  try {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      throw new Error("Missing VITE_GOOGLE_CLIENT_ID");
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
          if (hasApiBase()) {
            try {
              const result = await apiFetch<{ token: string; user: AppUser }>("/auth/google", {
                method: "POST",
                json: { credential },
                timeoutMs: 4000,
              });
              setUserToken(result.token);
              setStoredUser(result.user);
              opts.onSuccess(result);
              return;
            } catch {
              // Keep Google auth usable in the local demo when the backend is offline.
            }
          }

          const profile = decodeGoogleCredential(credential);
          if (!profile?.email) throw friendlyGoogleError();
          const local = upsertGoogleLocalUser({
            email: profile.email,
            fullName: profile.name,
          });
          if (!local.user) throw new Error(local.error ?? "Google sign-in failed");
          const user = toAppUser(local.user);
          setStoredUser(user);
          opts.onSuccess({ token: "", user });
        } catch (e) {
          opts.onError(e instanceof Error ? e : friendlyGoogleError());
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
    opts.onError(
      e instanceof Error && e.message.startsWith("Missing")
        ? e
        : new Error("Google sign-in is unavailable right now. Please continue with email."),
    );
  }
}
