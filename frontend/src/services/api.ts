type Problem = { detail?: string; errors?: Record<string, string> };
type Csrf = { token: string; headerName: string };
let csrf: Csrf | undefined;
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string>,
  ) {
    super(message);
  }
}
export async function refreshCsrf(): Promise<void> {
  const response = await fetch("/api/v1/auth/csrf", {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok)
    throw new ApiError(
      response.status,
      "Cannot establish a secure connection. Please try again.",
    );
  csrf = (await response.json()) as Csrf;
}
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = init.method ?? "GET";
  const writes = !["GET", "HEAD", "OPTIONS"].includes(method);
  if (writes && !csrf) await refreshCsrf();
  const headers = new Headers(init.headers);
  if (writes && csrf) headers.set(csrf.headerName, csrf.token);
  if (init.body && !(init.body instanceof URLSearchParams))
    headers.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, {
      ...init,
      headers,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      0,
      "Cannot reach PeopleOS. Check your connection and try again.",
    );
  }
  if (!response.ok) {
    const problem = (await response.json().catch(() => ({}))) as Problem;
    if (
      response.status === 401 &&
      path !== "/auth/login" &&
      path !== "/auth/me"
    )
      window.dispatchEvent(new Event("session-expired"));
    if (response.status === 403) csrf = undefined;
    throw new ApiError(
      response.status,
      problem.detail ?? "The request could not be completed.",
      problem.errors,
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
export async function login(
  workspace: string,
  email: string,
  password: string,
) {
  await refreshCsrf();
  await api<void>("/auth/login", {
    method: "POST",
    body: new URLSearchParams({ username: `${workspace}:${email}`, password }),
  });
  await refreshCsrf();
}
export async function logout() {
  await api<void>("/auth/logout", { method: "POST" });
  csrf = undefined;
}
