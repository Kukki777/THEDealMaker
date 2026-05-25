import { firebaseConfigured, getFirebaseAuth } from "@/lib/firebase";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
const MOBILE_SESSION_KEY = "rentsell_mobile_session";

export function getMobileSession() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem(MOBILE_SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveMobileSession(token, user) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MOBILE_SESSION_KEY, JSON.stringify({ token, user }));
  window.dispatchEvent(new CustomEvent("rentsell-auth-change", { detail: { user } }));
}

export function clearMobileSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(MOBILE_SESSION_KEY);
  window.dispatchEvent(new CustomEvent("rentsell-auth-change", { detail: { user: null } }));
}

export async function getAuthToken() {
  if (typeof window === "undefined") return null;
  const mobileToken = getMobileSession()?.token;
  if (mobileToken) return mobileToken;
  if (!firebaseConfigured) return null;
  const auth = getFirebaseAuth();
  await auth.authStateReady();
  return auth.currentUser?.getIdToken() || null;
}

export async function apiRequest(path, options = {}) {
  const token = await getAuthToken();
  const isForm = options.body instanceof FormData;
  const headers = new Headers(options.headers);

  if (!isForm && options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || "Something went wrong. Please try again.");
  }
  return result;
}

export function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
