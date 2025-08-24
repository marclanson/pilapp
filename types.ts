
export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum TicketType {
  PRIVATE = 'private',
  GROUP = 'group',
}

export enum PackTemplateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum PackHistoryType {
  PURCHASE = 'purchase',
  ATTENDANCE = 'attendance',
  EXPIRY_CHANGE = 'expiry_change',
}

export enum Page {
    DASHBOARD = 'dashboard',
    CLIENTS = 'clients',
    TEMPLATES = 'templates',
    ATTENDANCE = 'attendance',
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: ClientStatus;
}

export interface TicketPackTemplate {
  id: string;
  name: string;
  ticketCount: number;
  ticketType: TicketType;
  price: number;
  expiryMonths: number;
  status: PackTemplateStatus;
}

export interface PackHistoryLog {
  id: string;
  date: string; // ISO date string
  type: PackHistoryType;
  details: string;
}

export interface PurchasedPack {
  id:string;
  clientId: string;
  templateId: string;
  purchaseDate: string; // ISO date string
  expiryDate: string; // ISO date string
  initialTickets: number;
  ticketsRemaining: number;
  history: PackHistoryLog[];
  purchasePrice: number;
}

export interface AttendanceRecord {
  id: string;
  classDate: string; // ISO date string
  classType: TicketType;
  clientId: string;
  purchasedPackId: string;
}
