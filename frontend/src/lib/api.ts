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

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sdl_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
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
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("sdl_token");
      localStorage.removeItem("sdl_user");
      window.location.href = "/login";
    }
    throw new ApiError(data as ApiErrorBody, res.status);
  }

  return data as T;
}

// ---- Auth ----
export function login(email: string, password: string) {
  return request<{ token: string; fullName: string; email: string; role: string }>(
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
