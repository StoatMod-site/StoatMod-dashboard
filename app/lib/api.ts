export function apiBase() {
  return typeof window !== "undefined" && window.location.port === "3000"
    ? `${window.location.protocol}//${window.location.hostname}:8081`
    : "";
}

export class ApiError extends Error {
  code?: string;
  status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

function cookie(name: string) {
  if (typeof document === "undefined") return "";
  const prefix = `${name}=`;
  const value = document.cookie.split("; ").find((part) => part.startsWith(prefix));
  return value ? decodeURIComponent(value.slice(prefix.length)) : "";
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.method && init.method !== "GET"
        ? { "X-CSRF-Token": cookie("stoat_dashboard_csrf") }
        : {}),
      ...init?.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "The dashboard request failed.");
  return body as T;
}

export async function formApi<T>(path: string, form: FormData): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    method: "POST",
    body: form,
    credentials: "include",
    headers: { "X-CSRF-Token": cookie("stoat_dashboard_csrf") },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "The dashboard request failed.");
  return body as T;
}

export async function ownerApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.method && init.method !== "GET"
        ? { "X-Owner-CSRF-Token": cookie("stoat_owner_csrf") }
        : {}),
      ...init?.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "The owner dashboard request failed.");
  return body as T;
}

export async function ownerFormApi<T>(path: string, form: FormData): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    method: "POST",
    body: form,
    credentials: "include",
    headers: { "X-Owner-CSRF-Token": cookie("stoat_owner_csrf") },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "The email request failed.");
  return body as T;
}

export async function adminApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.method && init.method !== "GET"
        ? { "X-Admin-CSRF-Token": cookie("stoat_admin_csrf") }
        : {}),
      ...init?.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      body.error || "The admin dashboard request failed.",
      response.status,
      typeof body.code === "string" ? body.code : undefined,
    );
  }
  return body as T;
}

export async function adminFormApi<T>(path: string, form: FormData): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    method: "POST",
    body: form,
    credentials: "include",
    headers: { "X-Admin-CSRF-Token": cookie("stoat_admin_csrf") },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "The admin email request failed.");
  return body as T;
}
