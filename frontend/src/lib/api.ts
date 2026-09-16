import type {
  ApiErrorBody,
  Customer,
  DashboardSummary,
  Staff,
  Ticket,
  TicketPriority,
  TicketStatus,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export class ApiError extends Error {
  status: number;
  details: string[];

  constructor(body: ApiErrorBody, status: number) {
    super(body.message || "Request failed");
    this.status = status;
    this.details = body.details || [];
  }
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sdl_access_token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sdl_refresh_token");
}

function clearSession() {
  localStorage.removeItem("sdl_access_token");
  localStorage.removeItem("sdl_refresh_token");
  localStorage.removeItem("sdl_user");
}

// Prevents multiple simultaneous refresh calls if several requests 401 at once -
// every caller awaits the same in-flight refresh instead of each starting their own.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        localStorage.setItem("sdl_access_token", data.accessToken);
        return data.accessToken as string;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && !isRetry && path !== "/api/auth/refresh") {
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        // Access token had simply expired (its 2-minute lifetime is intentionally
        // short for demo purposes) - the refresh token was still valid, so we got a
        // new access token silently and can retry the original request once, seamlessly.
        return request<T>(path, options, true);
      }
      // Refresh token itself is missing/invalid/expired - a real re-login is needed.
      if (typeof window !== "undefined") {
        clearSession();
        window.location.href = "/login";
      }
    }
    throw new ApiError(data as ApiErrorBody, res.status);
  }

  return data as T;
}

// ---- Auth ----
export function login(email: string, password: string) {
  return request<{ accessToken: string; refreshToken: string; fullName: string; email: string; role: string }>(
    "/api/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) }
  );
}

// ---- Dashboard ----
export function getDashboard() {
  return request<DashboardSummary>("/api/dashboard");
}

// ---- Tickets ----
export interface TicketFilters {
  status?: TicketStatus | "";
  priority?: TicketPriority | "";
  customerId?: number | "";
  search?: string;
}

export function listTickets(filters: TicketFilters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.customerId) params.set("customerId", String(filters.customerId));
  if (filters.search) params.set("search", filters.search);
  const qs = params.toString();
  return request<Ticket[]>(`/api/tickets${qs ? `?${qs}` : ""}`);
}

export function getTicket(id: number) {
  return request<Ticket>(`/api/tickets/${id}`);
}

export interface TicketInput {
  subject: string;
  description: string;
  priority: TicketPriority;
  status?: TicketStatus;
  customerId: number;
  assignedToId?: number | null;
}

export function createTicket(input: TicketInput) {
  return request<Ticket>("/api/tickets", { method: "POST", body: JSON.stringify(input) });
}

export function updateTicket(id: number, input: TicketInput) {
  return request<Ticket>(`/api/tickets/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

export function updateTicketStatus(id: number, status: TicketStatus) {
  return request<Ticket>(`/api/tickets/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function addTicketComment(id: number, authorName: string, message: string) {
  return request<Ticket>(`/api/tickets/${id}/comments`, {
    method: "POST",
    body: JSON.stringify({ authorName, message }),
  });
}

export function deleteTicket(id: number) {
  return request<void>(`/api/tickets/${id}`, { method: "DELETE" });
}

// ---- Customers ----
export function listCustomers(search?: string) {
  const qs = search ? `?search=${encodeURIComponent(search)}` : "";
  return request<Customer[]>(`/api/customers${qs}`);
}

export function getCustomer(id: number) {
  return request<Customer>(`/api/customers/${id}`);
}

export function getCustomerTickets(id: number) {
  return request<Ticket[]>(`/api/customers/${id}/tickets`);
}

export interface CustomerInput {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
}

export function createCustomer(input: CustomerInput) {
  return request<Customer>("/api/customers", { method: "POST", body: JSON.stringify(input) });
}

export function updateCustomer(id: number, input: CustomerInput) {
  return request<Customer>(`/api/customers/${id}`, { method: "PUT", body: JSON.stringify(input) });
}

// ---- Staff ----
export function listStaff() {
  return request<Staff[]>("/api/staff");
}
