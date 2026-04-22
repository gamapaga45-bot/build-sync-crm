/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProjectStatus = 'active' | 'completed' | 'on-hold';

export interface Project {
  id: string;
  name: string;
  description: string;
  address: string;
  startDate: string;
  endDate?: string;
  status: ProjectStatus;
  projectType: 'construction' | 'inspection' | 'planned';
  lat: number;
  lng: number;
  progress: number;
  budget: number;
  spent: number;
  ownerId: string;
  members: string[]; // User UIDs
  bimModelUrl?: string;
  createdAt: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done' | 'error';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface PhotoDocumentation {
  id: string;
  url: string;
  description: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  category?: string;
  tags?: string[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: string; // Subcategory for grouping
  assignedTo?: string; // User UID
  dueDate?: string;
  photos: PhotoDocumentation[];
  comments: Comment[];
  isAcceptanceTask?: boolean; // For QA/QC
  errorType?: 'minor' | 'critical';
  fixDeadline?: string;
  bimElementId?: string; // Reference to BIM element
  progress: number; // 0-100
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Material {
  id: string;
  projectId: string;
  name: string;
  unit: string; // e.g., "m3", "pcs", "kg"
  quantity: number; // Total ordered/purchased
  stockQuantity: number; // Current available rest
  wastageQuantity?: number; // Total discarded/defects
  pricePerUnit: number;
  totalPrice: number;
  status: 'ordered' | 'delivered' | 'used';
  workType?: string;
  bimElementId?: string; // Reference to BIM element
  createdAt: string;
}

export interface BudgetExpense {
  id: string;
  projectId: string;
  category: 'materials' | 'labor' | 'equipment' | 'other';
  amount: number;
  description: string;
  date: string;
  createdAt: string;
}

export type AppSection = 
  | 'dashboard' 
  | 'tasks' 
  | 'materials' 
  | 'team' 
  | 'acceptance' 
  | 'incidents' 
  | 'reports' 
  | 'daily-logs' 
  | 'calendar' 
  | 'docs' 
  | 'crm' 
  | 'clients' 
  | 'billing' 
  | 'settings' 
  | 'portal'
  | 'inventory'
  | 'worktypes'
  | 'payroll'
  | 'gantt'
  | 'logistics';

export interface WorkerPayroll {
  id: string;
  name: string;
  role: string;
  dailyRate: number;
  daysWorked: number;
  overtimeHours: number;
  overtimeRate: number;
  bonuses: number;
  deductions: number;
  totalPay: number;
  paymentStatus: 'pending' | 'paid';
  lastPaymentDate?: string;
}

export interface GanttTask {
  id: string;
  title: string;
  start: string; // ISO date
  end: string;   // ISO date
  progress: number; // 0-100
  dependencies: string[]; // IDs of tasks that must complete before this one
  color?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'engineer' | 'supervisor' | 'foreman' | 'client' | 'manager';
  permissions?: AppSection[];
  status?: 'active' | 'invited' | 'disabled';
  lastLogin?: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';

export interface Lead {
  id: string;
  clientName: string;
  contactPerson: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  estimatedValue: number;
  probability: number; // 0-100
  score: number; // 0-100 (AI or manual scoring)
  notes: string;
  assignedTo: string; // User UID
  lastContactDate: string;
  createdAt: string;
}

export type InteractionType = 'call' | 'email' | 'meeting' | 'note';

export interface Interaction {
  id: string;
  type: InteractionType;
  date: string;
  summary: string;
  details?: string;
  userId: string; // Who performed the interaction
}

export interface Client {
  id: string;
  name: string;
  type: 'individual' | 'company';
  industry?: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  status: 'active' | 'inactive' | 'lead';
  interactions: Interaction[];
  projects: string[]; // Project IDs
  totalRevenue: number;
  createdAt: string;
}

export type DocumentType = 'contract' | 'permit' | 'insurance' | 'technical' | 'other';

export interface LegalDocument {
  id: string;
  title: string;
  type: DocumentType;
  fileUrl: string;
  fileSize: string;
  projectId?: string;
  clientId?: string;
  issueDate: string;
  expiryDate?: string;
  status: 'active' | 'expired' | 'pending';
  remindBeforeDays?: number;
  createdAt: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  number: string;
  projectId: string;
  clientId: string;
  amount: number;
  tax: number;
  total: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: { description: string; quantity: number; price: number; total: number }[];
  createdAt: string;
}

export interface ProjectFinances {
  projectId: string;
  plannedRevenue: number;
  plannedCost: number;
  plannedMargin: number; // percentage
  actualRevenue: number;
  actualCost: number;
  actualMargin: number; // percentage
  receivables: number; // unpaid invoices
}

export interface WorkflowReminder {
  id: string;
  leadId?: string;
  clientId?: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  assignedTo: string; // User UID
  createdAt: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: DocumentType;
  content: string; // Template string with placeholders like {{clientName}}
  placeholders: string[];
  createdAt: string;
}

export type InventoryStatus = 'in-stock' | 'on-site' | 'maintenance' | 'broken' | 'written-off';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  serialNumber?: string;
  sku?: string;
  price: number;
  purchaseDate: string;
  status: InventoryStatus;
  currentProjectId?: string; // Where it is now
  condition: 'new' | 'good' | 'worn' | 'bad';
  writeOffReason?: string;
  writeOffDate?: string;
  lastServiceDate?: string;
  assignedTo?: string; // User UID
  notes?: string;
  createdAt: string;
}

export interface InventoryLog {
  id: string;
  itemId: string;
  action: 'transfer' | 'write-off' | 'maintenance' | 'received';
  fromProjectId?: string;
  toProjectId?: string;
  userId: string;
  details: string;
  date: string;
}

export interface CompanyDetails {
  name: string;
  logo?: string | null;
  enabledSections?: {
    basics?: boolean;
    production?: boolean;
    finance?: boolean;
    service?: boolean;
    logistics?: boolean;
    workTypes?: boolean;
  };
  requisites: {
    inn: string;
    kpp: string;
    ogrn: string;
    address: string;
    legalAddress: string;
    bank: string;
    bik: string;
    account: string;
    corrAccount: string;
    phone: string;
    email: string;
    website: string;
  };
}
