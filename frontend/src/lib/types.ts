export type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_FOR_CUSTOMER" | "RESOLVED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

export interface TicketComment {
  id: number;
  authorName: string;
  message: string;
  createdAt: string;
}

export interface Ticket {
  id: number;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  customerId: number;
  customerName: string;
  customerEmail: string;
  assignedToId: number | null;
  assignedToName: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  comments: TicketComment[];
}

export interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  company: string | null;
  createdAt: string;
  totalTickets: number;
  openTickets: number;
}

export interface Staff {
  id: number;
  fullName: string;
  email: string;
  role: string;
  assignedOpenTickets: number;
}

export interface DashboardSummary {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  waitingForCustomerTickets: number;
  resolvedTickets: number;
  ticketsByPriority: Record<TicketPriority, number>;
  recentTickets: Ticket[];
}

export interface CurrentUser {
  fullName: string;
  email: string;
  role: string;
}

export interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  details: string[];
}
