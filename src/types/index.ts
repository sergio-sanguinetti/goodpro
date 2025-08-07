export interface Company {
  id: string;
  razonSocial: string;
  ruc: string;
  contactPersons: ContactPerson[];
  createdAt: string;
  isActive: boolean;
}

export interface ContactPerson {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
}

export interface Project {
  id: string;
  sede: string;
  descripcion: string;
  companyId: string;
  fechaInicio: string;
  fechaFin?: string;
  status?: 'active' | 'completed' | 'suspended';
  contactPersons: ContactPerson[];
  createdAt: string;
  isActive: boolean;
}

export interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  normativeReference: string;
  type: 'document' | 'record';
  isRequired: boolean;
  renewalPeriodMonths: number;
  createdAt: string;
  isActive: boolean;
}

export interface DocumentRole {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  role: 'elaborator' | 'reviewer' | 'approver';
}

export interface DocumentVersion {
  id: string;
  versionNumber: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  changes?: string;
  isActive: boolean;
  file_path?: string;
}

export interface Document {
  id: string;
  nombre: string;
  categoryId: string;
  projectId: string;
  version: string;
  codigo: string;
  fechaCreacion: string;
  fechaVencimiento: string;
  status: 'draft' | 'pending_review' | 'approved' | 'expired' | 'rejected';
  versions: DocumentVersion[];
  elaborators: DocumentRole[];
  reviewers: DocumentRole[];
  approvers: DocumentRole[];
  createdBy: string;
  approvedAt?: string;
  notes?: string;
}

export interface RecordFormat {
  id: string;
  nombre: string;
  categoryId: string;
  projectId: string;
  version: string;
  codigo: string;
  fechaCreacion: string;
  fechaVencimiento: string;
  status: 'draft' | 'pending_review' | 'approved' | 'expired' | 'rejected';
  versions: RecordFormatVersion[];
  elaborators: DocumentRole[];
  reviewers: DocumentRole[];
  approvers: DocumentRole[];
  createdBy: string;
  createdAt: string;
  notes?: string;
}

export interface RecordFormatVersion {
  id: string;
  versionNumber: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  changes?: string;
  isActive: boolean;
  file_path?: string;
}

export interface RecordEntry {
  id: string;
  formatId: string;
  nombre: string;
  fechaRealizacion: string;
  fileName: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  telefono?: string;
  role: 'admin' | 'company_user';
  companyId?: string;
  avatar?: string;
  isActive: boolean;
  permissions?: {
    canViewAllCompanyProjects: boolean; // true = ve toda la empresa, false = solo proyectos donde es contacto
  };
}