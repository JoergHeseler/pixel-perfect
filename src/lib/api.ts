import { API_BASE_URL } from "./config";

export type Registration = {
  phone: string;
  lat: number | null;
  lon: number | null;
  place: string;
  crops: string[];
  area_acres: number;
  consent: boolean;
};

export type Case = {
  id: string;
  created_at: string;
  status: "answered" | "in_review";
  result_title: string;
  advice_text: string;
  weather_summary?: string;
};

const K = { token: "ch_token", pending: "ch_pending", cases: "ch_cases", details: "ch_details" };

const get = <T,>(k: string): T | null => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
};
const set = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));

export const store = {
  token: () => get<string>(K.token),
  pending: () => get<Registration>(K.pending),
  details: () => get<Registration>(K.details),
  cases: () => get<Case[]>(K.cases) ?? [],
  isRegistered: () => !!(get<string>(K.token) || get<Registration>(K.pending)),
  clear: () => Object.values(K).forEach((k) => localStorage.removeItem(k)),
};

function headers(auth = false): HeadersInit {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  };
  const tok = store.token();
  if (auth && tok) h["Authorization"] = `Bearer ${tok}`;
  return h;
}

async function req(path: string, init: RequestInit) {
  if (API_BASE_URL.startsWith("[")) throw new TypeError("API not configured");
  const res = await fetch(`${API_BASE_URL}${path}`, init);
  if (!res.ok) throw new Error(String(res.status));
  return res;
}

/** Returns "sent" or "queued". Throws only on a server rejection while online. */
export async function register(data: Registration): Promise<"sent" | "queued"> {
  set(K.details, data);
  try {
    const res = await req("/api/farmers", { method: "POST", headers: headers(), body: JSON.stringify(data) });
    const { token } = await res.json();
    set(K.token, token);
    localStorage.removeItem(K.pending);
    return "sent";
  } catch (e) {
    const status = Number((e as Error).message);
    const notConfigured = API_BASE_URL.startsWith("[");
    if (notConfigured || !navigator.onLine || e instanceof TypeError || status >= 500) {
      set(K.pending, data);
      return "queued";
    }
    throw e;
  }
}

export async function flushPending() {
  const p = store.pending();
  if (!p || !navigator.onLine) return;
  try {
    await register(p);
  } catch {
    /* try again later */
  }
}

export async function fetchCases(): Promise<Case[]> {
  const res = await req("/api/farmers/me/cases", { method: "GET", headers: headers(true) });
  const list = ((await res.json()) as Case[]).sort(
    (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
  );
  set(K.cases, list);
  return list;
}

export async function updateDetails(data: Registration) {
  if (!store.token()) {
    set(K.pending, data);
    set(K.details, data);
    return;
  }
  await req("/api/farmers/me", { method: "PUT", headers: headers(true), body: JSON.stringify(data) });
  set(K.details, data);
}

export async function deleteMe() {
  if (store.token()) await req("/api/farmers/me", { method: "DELETE", headers: headers(true) });
  store.clear();
}
