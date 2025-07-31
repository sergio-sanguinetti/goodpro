import { Company, Project, DocumentCategory, Document, RecordFormat, RecordEntry, User, DocumentRole, ContactPerson } from '../types';

export const mockUsers: User[] = [
  {
    id: 'admin1',
    name: 'Ana García',
    email: 'admin@sstmanager.com',
    role: 'admin',
    isActive: true
  },
  {
    id: 'user1',
    name: 'Carlos Mendoza',
    email: 'carlos@constructoraabc.com',
    role: 'company_user',
    companyId: '1',
    isActive: true,
    permissions: {
      canViewAllCompanyProjects: true
    }
  },
  {
    id: 'user2',
    name: 'María Rodriguez',
    email: 'maria@mineraxyz.com',
    role: 'company_user',
    companyId: '2',
    isActive: true,
    permissions: {
      canViewAllCompanyProjects: false
    }
  },
  {
    id: 'user4',
    name: 'Pedro Gonzalez',
    email: 'pedro@constructoraabc.com',
    role: 'company_user',
    companyId: '1',
    isActive: true,
    permissions: {
      canViewAllCompanyProjects: false
    }
  },
  {
    id: 'user5',
    name: 'Carmen Silva',
    email: 'carmen.silva@industriasdef.com',
    role: 'company_user',
    companyId: '4',
    isActive: true,
    permissions: {
      canViewAllCompanyProjects: false
    }
  },
  {
    id: 'user3',
    name: 'Luis Fernández',
    email: 'luis@industriasdef.com',
    role: 'company_user',
    companyId: '4',
    isActive: true,
    permissions: {
      canViewAllCompanyProjects: true
    }
  }
];

export const mockCompanies: Company[] = [
  {
    id: '1',
    razonSocial: 'Constructora ABC S.A.C.',
    ruc: '20123456789',
    contactPersons: [
      {
        id: 'cp1',
        nombres: 'Carlos',
        apellidos: 'Mendoza García',
        email: 'carlos@constructoraabc.com',
        telefono: '+51 987654321'
      },
      {
        id: 'cp2',
        nombres: 'Ana',
        apellidos: 'Pérez López',
        email: 'ana.perez@constructoraabc.com',
        telefono: '+51 987654322'
      }
    ],
    createdAt: '2024-01-15',
    isActive: true
  },
  {
    id: '2',
    razonSocial: 'Minera XYZ S.A.',
    ruc: '20987654321',
    contactPersons: [
      {
        id: 'cp3',
        nombres: 'María',
        apellidos: 'Rodriguez Silva',
        email: 'maria@mineraxyz.com',
        telefono: '+51 987654323'
      }
    ],
    createdAt: '2024-01-20',
    isActive: true
  },
  {
    id: '4',
    razonSocial: 'Industrias DEF S.A.C.',
    ruc: '20456789123',
    contactPersons: [
      {
        id: 'cp4',
        nombres: 'Luis',
        apellidos: 'Fernández Torres',
        email: 'luis@industriasdef.com',
        telefono: '+51 987654324'
      }
    ],
    createdAt: '2024-01-25',
    isActive: true
  }
];

export const mockProjects: Project[] = [
  {
    id: '1',
    sede: 'Lima - San Isidro',
    descripcion: 'Construcción de edificio corporativo de 20 pisos en el distrito de San Isidro',
    companyId: '1',
    fechaInicio: '2024-01-01',
    contactPersons: [
      {
        id: 'pcp1',
        nombres: 'Luis',
        apellidos: 'Martínez Ruiz',
        email: 'luis.martinez@constructoraabc.com',
        telefono: '+51 987654330'
      },
      {
        id: 'pcp4',
        nombres: 'Pedro',
        apellidos: 'Gonzalez Silva',
        email: 'pedro@constructoraabc.com',
        telefono: '+51 987654335'
      }
    ],
    createdAt: '2024-01-15',
    isActive: true
  },
  {
    id: '2',
    sede: 'Lima - Surco',
    descripcion: 'Desarrollo residencial de 150 departamentos en Santiago de Surco',
    companyId: '1',
    fechaInicio: '2024-02-01',
    contactPersons: [
      {
        id: 'pcp2',
        nombres: 'Carmen',
        apellidos: 'Vega Torres',
        email: 'carmen.vega@constructoraabc.com',
        telefono: '+51 987654331'
      }
    ],
    createdAt: '2024-01-20',
    isActive: true
  },
  {
    id: '4',
    sede: 'Lima - Miraflores',
    descripcion: 'Centro comercial de 5 niveles con estacionamiento subterráneo',
    companyId: '1',
    fechaInicio: '2024-03-01',
    contactPersons: [
      {
        id: 'pcp5',
        nombres: 'Carlos',
        apellidos: 'Mendoza García',
        email: 'carlos@constructoraabc.com',
        telefono: '+51 987654321'
      }
    ],
    createdAt: '2024-02-01',
    isActive: true
  },
  {
    id: '5',
    sede: 'Callao - Puerto',
    descripcion: 'Almacén logístico de 10,000 m2 para operaciones portuarias',
    companyId: '1',
    fechaInicio: '2024-04-01',
    contactPersons: [
      {
        id: 'pcp6',
        nombres: 'Ana',
        apellidos: 'Pérez López',
        email: 'ana.perez@constructoraabc.com',
        telefono: '+51 987654322'
      }
    ],
    createdAt: '2024-02-15',
    isActive: false
  },
  {
    id: '3',
    sede: 'Cusco - Espinar',
    descripcion: 'Proyecto de extracción de minerales en la provincia de Espinar',
    companyId: '2',
    fechaInicio: '2024-01-01',
    contactPersons: [
      {
        id: 'pcp3',
        nombres: 'Roberto',
        apellidos: 'Quispe Mamani',
        email: 'roberto.quispe@mineraxyz.com',
        telefono: '+51 987654332'
      }
    ],
    createdAt: '2024-01-25',
    isActive: true
  },
  {
    id: '6',
    sede: 'Arequipa - Cerro Verde',
    descripcion: 'Ampliación de planta concentradora de minerales',
    companyId: '2',
    fechaInicio: '2024-02-01',
    contactPersons: [
      {
        id: 'pcp7',
        nombres: 'María',
        apellidos: 'Rodriguez Silva',
        email: 'maria@mineraxyz.com',
        telefono: '+51 987654323'
      }
    ],
    createdAt: '2024-01-30',
    isActive: true
  },
  {
    id: '7',
    sede: 'Lima - Ate',
    descripcion: 'Planta de procesamiento de alimentos con certificación HACCP',
    companyId: '4',
    fechaInicio: '2024-01-15',
    contactPersons: [
      {
        id: 'pcp8',
        nombres: 'Luis',
        apellidos: 'Fernández Torres',
        email: 'luis@industriasdef.com',
        telefono: '+51 987654324'
      }
    ],
    createdAt: '2024-01-25',
    isActive: true
  },
  {
    id: '8',
    sede: 'Trujillo - Industrial',
    descripcion: 'Fábrica de productos químicos industriales',
    companyId: '4',
    fechaInicio: '2024-03-01',
    contactPersons: [
      {
        id: 'pcp9',
        nombres: 'Carmen',
        apellidos: 'Silva Mendoza',
        email: 'carmen.silva@industriasdef.com',
        telefono: '+51 987654325'
      }
    ],
    createdAt: '2024-02-10',
    isActive: true
  }
];

export const mockDocumentCategories: DocumentCategory[] = [
  {
    id: 'cat1',
    name: 'Política de SST',
    description: 'Política de Seguridad y Salud en el Trabajo',
    normativeReference: 'Ley 29783 - Art. 17',
    type: 'document',
    isRequired: true,
    renewalPeriodMonths: 12,
    createdAt: '2024-01-15',
    isActive: true
  },
  {
    id: 'cat2',
    name: 'IPERC',
    description: 'Identificación de Peligros y Evaluación de Riesgos',
    normativeReference: 'ISO 45001 - 6.1.2',
    type: 'document',
    isRequired: true,
    renewalPeriodMonths: 12,
    createdAt: '2024-01-15',
    isActive: true
  },
  {
    id: 'cat3',
    name: 'Registros de Capacitación',
    description: 'Registro de capacitaciones realizadas',
    normativeReference: 'Ley 29783 - Art. 27',
    type: 'record',
    isRequired: true,
    renewalPeriodMonths: 0,
    createdAt: '2024-01-15',
    isActive: true
  },
  {
    id: 'cat4',
    name: 'Plan de Emergencia',
    description: 'Plan de preparación y respuesta ante emergencias',
    normativeReference: 'Ley 29783 - Art. 61',
    type: 'document',
    isRequired: true,
    renewalPeriodMonths: 12,
    createdAt: '2024-01-20',
    isActive: true
  }
];

export const mockDocuments: Document[] = [
  {
    id: '1',
    nombre: 'Política de SST 2024',
    categoryId: 'cat1',
    projectId: '1',
    version: '2.0',
    codigo: 'POL-SST-001',
    fechaCreacion: '2024-01-15',
    fechaVencimiento: '2025-01-15',
    status: 'approved',
    versions: [
      {
        id: 'v1',
        versionNumber: '1.0',
        fileName: 'politica_sst_v1.pdf',
        fileSize: 245760,
        uploadedBy: 'Carlos Mendoza',
        uploadedAt: '2024-01-15',
        isActive: false
      },
      {
        id: 'v2',
        versionNumber: '2.0',
        fileName: 'politica_sst_v2.pdf',
        fileSize: 267890,
        uploadedBy: 'Carlos Mendoza',
        uploadedAt: '2024-01-20',
        changes: 'Actualización de objetivos y metas, inclusión de nuevos procedimientos de emergencia',
        isActive: true
      }
    ],
    elaborators: [
      { id: 'e1', nombres: 'Carlos', apellidos: 'Mendoza García', email: 'carlos@constructoraabc.com', role: 'elaborator' }
    ],
    reviewers: [
      { id: 'r1', nombres: 'Luis', apellidos: 'García Pérez', email: 'luis.garcia@constructoraabc.com', role: 'reviewer' }
    ],
    approvers: [
      { id: 'a1', nombres: 'Roberto', apellidos: 'Silva Martín', email: 'roberto.silva@constructoraabc.com', role: 'approver' }
    ],
    createdBy: 'Carlos Mendoza',
    approvedAt: '2024-01-22'
  },
  {
    id: '2',
    nombre: 'IPERC Línea Base 2024',
    categoryId: 'cat2',
    projectId: '1',
    version: '1.0',
    codigo: 'IPERC-001',
    fechaCreacion: '2024-01-20',
    fechaVencimiento: '2025-02-10',
    status: 'approved',
    versions: [
      {
        id: 'v3',
        versionNumber: '1.0',
        fileName: 'iperc_linea_base_v1.pdf',
        fileSize: 1245760,
        uploadedBy: 'Ana Pérez',
        uploadedAt: '2024-01-20',
        isActive: true
      }
    ],
    elaborators: [
      { id: 'e2', nombres: 'Ana', apellidos: 'Pérez López', email: 'ana.perez@constructoraabc.com', role: 'elaborator' }
    ],
    reviewers: [
      { id: 'r2', nombres: 'Luis', apellidos: 'García Pérez', email: 'luis.garcia@constructoraabc.com', role: 'reviewer' }
    ],
    approvers: [
      { id: 'a2', nombres: 'Roberto', apellidos: 'Silva Martín', email: 'roberto.silva@constructoraabc.com', role: 'approver' }
    ],
    createdBy: 'Ana Pérez',
    approvedAt: '2024-01-25'
  },
  {
    id: '3',
    nombre: 'Plan de Emergencia Minera',
    categoryId: 'cat4',
    projectId: '3',
    version: '1.0',
    codigo: 'PE-MIN-001',
    fechaCreacion: '2024-01-25',
    fechaVencimiento: '2025-01-28',
    status: 'pending_review',
    versions: [
      {
        id: 'v4',
        versionNumber: '1.0',
        fileName: 'plan_emergencia_minera_v1.pdf',
        fileSize: 845760,
        uploadedBy: 'María Rodriguez',
        uploadedAt: '2024-01-25',
        isActive: true
      }
    ],
    elaborators: [
      { id: 'e3', nombres: 'María', apellidos: 'Rodriguez Silva', email: 'maria@mineraxyz.com', role: 'elaborator' }
    ],
    reviewers: [
      { id: 'r3', nombres: 'Roberto', apellidos: 'Quispe Mamani', email: 'roberto.quispe@mineraxyz.com', role: 'reviewer' }
    ],
    approvers: [
      { id: 'a3', nombres: 'José', apellidos: 'Miranda Torres', email: 'jose.miranda@mineraxyz.com', role: 'approver' }
    ],
    createdBy: 'María Rodriguez'
  },
  {
    id: '4',
    nombre: 'Política SST Industrial',
    categoryId: 'cat1',
    projectId: '7',
    version: '1.0',
    codigo: 'POL-IND-001',
    fechaCreacion: '2024-01-30',
    fechaVencimiento: '2025-02-05',
    status: 'approved',
    versions: [
      {
        id: 'v5',
        versionNumber: '1.0',
        fileName: 'politica_sst_industrial_v1.pdf',
        fileSize: 345760,
        uploadedBy: 'Luis Fernández',
        uploadedAt: '2024-01-30',
        isActive: true
      }
    ],
    elaborators: [
      { id: 'e4', nombres: 'Luis', apellidos: 'Fernández Torres', email: 'luis@industriasdef.com', role: 'elaborator' }
    ],
    reviewers: [
      { id: 'r4', nombres: 'Carmen', apellidos: 'Silva Mendoza', email: 'carmen.silva@industriasdef.com', role: 'reviewer' }
    ],
    approvers: [
      { id: 'a4', nombres: 'Director', apellidos: 'General DEF', email: 'director@industriasdef.com', role: 'approver' }
    ],
    createdBy: 'Luis Fernández',
    approvedAt: '2024-02-02'
  },
  {
    id: '5',
    nombre: 'Manual de Procedimientos SST',
    categoryId: 'cat2',
    projectId: '2',
    version: '1.0',
    codigo: 'MAN-SST-002',
    fechaCreacion: '2024-02-05',
    fechaVencimiento: '2025-02-15',
    status: 'approved',
    versions: [
      {
        id: 'v6',
        versionNumber: '1.0',
        fileName: 'manual_procedimientos_sst_v1.pdf',
        fileSize: 567890,
        uploadedBy: 'Carmen Vega',
        uploadedAt: '2024-02-05',
        isActive: true
      }
    ],
    elaborators: [
      { id: 'e5', nombres: 'Carmen', apellidos: 'Vega Torres', email: 'carmen.vega@constructoraabc.com', role: 'elaborator' }
    ],
    reviewers: [
      { id: 'r5', nombres: 'Carlos', apellidos: 'Mendoza García', email: 'carlos@constructoraabc.com', role: 'reviewer' }
    ],
    approvers: [
      { id: 'a5', nombres: 'Roberto', apellidos: 'Silva Martín', email: 'roberto.silva@constructoraabc.com', role: 'approver' }
    ],
    createdBy: 'Carmen Vega',
    approvedAt: '2024-02-08'
  },
  {
    id: '6',
    nombre: 'Reglamento Interno de SST',
    categoryId: 'cat1',
    projectId: '4',
    version: '1.0',
    codigo: 'REG-SST-003',
    fechaCreacion: '2024-02-10',
    fechaVencimiento: '2025-03-01',
    status: 'pending_review',
    versions: [
      {
        id: 'v7',
        versionNumber: '1.0',
        fileName: 'reglamento_interno_sst_v1.pdf',
        fileSize: 423890,
        uploadedBy: 'Carlos Mendoza',
        uploadedAt: '2024-02-10',
        isActive: true
      }
    ],
    elaborators: [
      { id: 'e6', nombres: 'Carlos', apellidos: 'Mendoza García', email: 'carlos@constructoraabc.com', role: 'elaborator' }
    ],
    reviewers: [
      { id: 'r6', nombres: 'Ana', apellidos: 'Pérez López', email: 'ana.perez@constructoraabc.com', role: 'reviewer' }
    ],
    approvers: [
      { id: 'a6', nombres: 'Roberto', apellidos: 'Silva Martín', email: 'roberto.silva@constructoraabc.com', role: 'approver' }
    ],
    createdBy: 'Carlos Mendoza'
  },
  {
    id: '7',
    nombre: 'Plan de Respuesta ante Emergencias',
    categoryId: 'cat4',
    projectId: '5',
    version: '1.0',
    codigo: 'PRE-001',
    fechaCreacion: '2024-02-12',
    fechaVencimiento: '2025-02-20',
    status: 'draft',
    versions: [
      {
        id: 'v8',
        versionNumber: '1.0',
        fileName: 'plan_respuesta_emergencias_v1.pdf',
        fileSize: 634890,
        uploadedBy: 'Ana Pérez',
        uploadedAt: '2024-02-12',
        isActive: true
      }
    ],
    elaborators: [
      { id: 'e7', nombres: 'Ana', apellidos: 'Pérez López', email: 'ana.perez@constructoraabc.com', role: 'elaborator' }
    ],
    reviewers: [
      { id: 'r7', nombres: 'Carlos', apellidos: 'Mendoza García', email: 'carlos@constructoraabc.com', role: 'reviewer' }
    ],
    approvers: [
      { id: 'a7', nombres: 'Roberto', apellidos: 'Silva Martín', email: 'roberto.silva@constructoraabc.com', role: 'approver' }
    ],
    createdBy: 'Ana Pérez'
  }
];

export const mockRecordFormats: RecordFormat[] = [
  {
    id: 'rf1',
    nombre: 'Registro de Capacitaciones',
    categoryId: 'cat3',
    projectId: '1',
    version: '1.0',
    codigo: 'REG-CAP-001',
    fechaCreacion: '2024-01-10',
    fechaVencimiento: '2025-01-10',
    status: 'approved',
    versions: [
      {
        id: 'rfv1',
        versionNumber: '1.0',
        fileName: 'formato_capacitacion.xlsx',
        fileSize: 67890,
        uploadedBy: 'Ana Pérez',
        uploadedAt: '2024-01-10',
        isActive: true
      }
    ],
    elaborators: [
      { id: 'e4', nombres: 'Ana', apellidos: 'Pérez López', email: 'ana.perez@constructoraabc.com', role: 'elaborator' }
    ],
    reviewers: [
      { id: 'r3', nombres: 'Luis', apellidos: 'García Pérez', email: 'luis.garcia@constructoraabc.com', role: 'reviewer' }
    ],
    approvers: [
      { id: 'a3', nombres: 'Roberto', apellidos: 'Silva Martín', email: 'roberto.silva@constructoraabc.com', role: 'approver' }
    ],
    createdBy: 'Ana Pérez',
    createdAt: '2024-01-10'
  },
  {
    id: 'rf2',
    nombre: 'Registro de Inspecciones',
    categoryId: 'cat3',
    projectId: '2',
    version: '2.1',
    codigo: 'REG-INS-001',
    fechaCreacion: '2024-01-05',
    fechaVencimiento: '2025-01-05',
    status: 'approved',
    versions: [
      {
        id: 'rfv2',
        versionNumber: '1.0',
        fileName: 'formato_inspecciones_v1.xlsx',
        fileSize: 45678,
        uploadedBy: 'Carmen Vega',
        uploadedAt: '2024-01-05',
        isActive: false
      },
      {
        id: 'rfv3',
        versionNumber: '2.0',
        fileName: 'formato_inspecciones_v2.xlsx',
        fileSize: 52340,
        uploadedBy: 'Carmen Vega',
        uploadedAt: '2024-01-12',
        changes: 'Añadidos campos de criticidad y observaciones',
        isActive: false
      },
      {
        id: 'rfv4',
        versionNumber: '2.1',
        fileName: 'formato_inspecciones_v2.1.xlsx',
        fileSize: 54120,
        uploadedBy: 'Carmen Vega',
        uploadedAt: '2024-01-20',
        changes: 'Corrección de fórmulas y mejoras menores',
        isActive: true
      }
    ],
    elaborators: [
      { id: 'e5', nombres: 'Carmen', apellidos: 'Vega Torres', email: 'carmen.vega@constructoraabc.com', role: 'elaborator' }
    ],
    reviewers: [
      { id: 'r4', nombres: 'Luis', apellidos: 'García Pérez', email: 'luis.garcia@constructoraabc.com', role: 'reviewer' }
    ],
    approvers: [
      { id: 'a4', nombres: 'Roberto', apellidos: 'Silva Martín', email: 'roberto.silva@constructoraabc.com', role: 'approver' }
    ],
    createdBy: 'Carmen Vega',
    createdAt: '2024-01-05'
  },
  {
    id: 'rf3',
    nombre: 'Registro de Incidentes',
    categoryId: 'cat3',
    projectId: '3',
    version: '1.0',
    codigo: 'REG-INC-001',
    fechaCreacion: '2024-01-15',
    fechaVencimiento: '2025-02-15',
    status: 'approved',
    versions: [
      {
        id: 'rfv5',
        versionNumber: '1.0',
        fileName: 'formato_incidentes_v1.xlsx',
        fileSize: 67890,
        uploadedBy: 'María Rodriguez',
        uploadedAt: '2024-01-15',
        isActive: true
      }
    ],
    elaborators: [
      { id: 'e6', nombres: 'María', apellidos: 'Rodriguez Silva', email: 'maria@mineraxyz.com', role: 'elaborator' }
    ],
    reviewers: [
      { id: 'r5', nombres: 'Roberto', apellidos: 'Quispe Mamani', email: 'roberto.quispe@mineraxyz.com', role: 'reviewer' }
    ],
    approvers: [
      { id: 'a5', nombres: 'José', apellidos: 'Miranda Torres', email: 'jose.miranda@mineraxyz.com', role: 'approver' }
    ],
    createdBy: 'María Rodriguez',
    createdAt: '2024-01-15'
  },
  {
    id: 'rf4',
    nombre: 'Registro de Auditorías',
    categoryId: 'cat3',
    projectId: '7',
    version: '1.0',
    codigo: 'REG-AUD-001',
    fechaCreacion: '2024-02-01',
    fechaVencimiento: '2025-02-01',
    status: 'approved',
    versions: [
      {
        id: 'rfv6',
        versionNumber: '1.0',
        fileName: 'formato_auditorias_v1.xlsx',
        fileSize: 78900,
        uploadedBy: 'Luis Fernández',
        uploadedAt: '2024-02-01',
        isActive: true
      }
    ],
    elaborators: [
      { id: 'e7', nombres: 'Luis', apellidos: 'Fernández Torres', email: 'luis@industriasdef.com', role: 'elaborator' }
    ],
    reviewers: [
      { id: 'r6', nombres: 'Carmen', apellidos: 'Silva Mendoza', email: 'carmen.silva@industriasdef.com', role: 'reviewer' }
    ],
    approvers: [
      { id: 'a6', nombres: 'Director', apellidos: 'General DEF', email: 'director@industriasdef.com', role: 'approver' }
    ],
    createdBy: 'Luis Fernández',
    createdAt: '2024-02-01'
  },
  {
    id: 'rf5',
    nombre: 'Registro de EPP',
    categoryId: 'cat3',
    projectId: '2',
    version: '1.0',
    codigo: 'REG-EPP-001',
    fechaCreacion: '2024-02-01',
    fechaVencimiento: '2025-02-01',
    status: 'approved',
    versions: [
      {
        id: 'rfv7',
        versionNumber: '1.0',
        fileName: 'formato_epp_v1.xlsx',
        fileSize: 54321,
        uploadedBy: 'Carmen Vega',
        uploadedAt: '2024-02-01',
        isActive: true
      }
    ],
    elaborators: [
      { id: 'e8', nombres: 'Carmen', apellidos: 'Vega Torres', email: 'carmen.vega@constructoraabc.com', role: 'elaborator' }
    ],
    reviewers: [
      { id: 'r8', nombres: 'Carlos', apellidos: 'Mendoza García', email: 'carlos@constructoraabc.com', role: 'reviewer' }
    ],
    approvers: [
      { id: 'a8', nombres: 'Roberto', apellidos: 'Silva Martín', email: 'roberto.silva@constructoraabc.com', role: 'approver' }
    ],
    createdBy: 'Carmen Vega',
    createdAt: '2024-02-01'
  },
  {
    id: 'rf6',
    nombre: 'Registro de Reuniones de SST',
    categoryId: 'cat3',
    projectId: '4',
    version: '1.0',
    codigo: 'REG-REU-001',
    fechaCreacion: '2024-02-05',
    fechaVencimiento: '2025-02-05',
    status: 'approved',
    versions: [
      {
        id: 'rfv8',
        versionNumber: '1.0',
        fileName: 'formato_reuniones_sst_v1.xlsx',
        fileSize: 63456,
        uploadedBy: 'Carlos Mendoza',
        uploadedAt: '2024-02-05',
        isActive: true
      }
    ],
    elaborators: [
      { id: 'e9', nombres: 'Carlos', apellidos: 'Mendoza García', email: 'carlos@constructoraabc.com', role: 'elaborator' }
    ],
    reviewers: [
      { id: 'r9', nombres: 'Ana', apellidos: 'Pérez López', email: 'ana.perez@constructoraabc.com', role: 'reviewer' }
    ],
    approvers: [
      { id: 'a9', nombres: 'Roberto', apellidos: 'Silva Martín', email: 'roberto.silva@constructoraabc.com', role: 'approver' }
    ],
    createdBy: 'Carlos Mendoza',
    createdAt: '2024-02-05'
  },
  {
    id: 'rf7',
    nombre: 'Registro de Accidentes',
    categoryId: 'cat3',
    projectId: '5',
    version: '1.0',
    codigo: 'REG-ACC-001',
    fechaCreacion: '2024-02-08',
    fechaVencimiento: '2025-02-08',
    status: 'pending_review',
    versions: [
      {
        id: 'rfv9',
        versionNumber: '1.0',
        fileName: 'formato_accidentes_v1.xlsx',
        fileSize: 71234,
        uploadedBy: 'Ana Pérez',
        uploadedAt: '2024-02-08',
        isActive: true
      }
    ],
    elaborators: [
      { id: 'e10', nombres: 'Ana', apellidos: 'Pérez López', email: 'ana.perez@constructoraabc.com', role: 'elaborator' }
    ],
    reviewers: [
      { id: 'r10', nombres: 'Carlos', apellidos: 'Mendoza García', email: 'carlos@constructoraabc.com', role: 'reviewer' }
    ],
    approvers: [
      { id: 'a10', nombres: 'Roberto', apellidos: 'Silva Martín', email: 'roberto.silva@constructoraabc.com', role: 'approver' }
    ],
    createdBy: 'Ana Pérez',
    createdAt: '2024-02-08'
  }
];

export const mockRecordEntries: RecordEntry[] = [
  {
    id: 're1',
    formatId: 'rf1',
    nombre: 'Capacitación en Trabajo en Alturas',
    fechaRealizacion: '2024-01-15',
    fileName: 'capacitacion_alturas_enero.pdf',
    fileSize: 156789,
    uploadedBy: 'Ana Pérez',
    uploadedAt: '2024-01-16',
    status: 'approved',
    approvedBy: 'Luis García',
    approvedAt: '2024-01-17'
  },
  {
    id: 're2',
    formatId: 'rf1',
    nombre: 'Capacitación en Uso de EPP',
    fechaRealizacion: '2024-01-22',
    fileName: 'capacitacion_epp_enero.pdf',
    fileSize: 189456,
    uploadedBy: 'Ana Pérez',
    uploadedAt: '2024-01-23',
    status: 'pending'
  },
  {
    id: 're3',
    formatId: 'rf2',
    nombre: 'Inspección de Equipos - Enero',
    fechaRealizacion: '2024-01-25',
    fileName: 'inspeccion_equipos_enero.pdf',
    fileSize: 234567,
    uploadedBy: 'Carmen Vega',
    uploadedAt: '2024-01-26',
    status: 'approved',
    approvedBy: 'Luis García',
    approvedAt: '2024-01-27'
  },
  {
    id: 're4',
    formatId: 'rf3',
    nombre: 'Reporte de Incidente - Equipo A',
    fechaRealizacion: '2024-01-28',
    fileName: 'incidente_equipo_a.pdf',
    fileSize: 345678,
    uploadedBy: 'María Rodriguez',
    uploadedAt: '2024-01-29',
    status: 'approved',
    approvedBy: 'Roberto Quispe',
    approvedAt: '2024-01-30'
  },
  {
    id: 're5',
    formatId: 'rf4',
    nombre: 'Auditoría Interna - Febrero',
    fechaRealizacion: '2024-02-05',
    fileName: 'auditoria_febrero.pdf',
    fileSize: 456789,
    uploadedBy: 'Luis Fernández',
    uploadedAt: '2024-02-06',
    status: 'pending'
  },
  {
    id: 're6',
    formatId: 'rf1',
    nombre: 'Capacitación EPP - Febrero',
    fechaRealizacion: '2024-02-10',
    fileName: 'capacitacion_epp_febrero.pdf',
    fileSize: 198765,
    uploadedBy: 'Ana Pérez',
    uploadedAt: '2024-02-11',
    status: 'approved',
    approvedBy: 'Luis García',
    approvedAt: '2024-02-12'
  },
  {
    id: 're7',
    formatId: 'rf5',
    nombre: 'Control de EPP - Febrero',
    fechaRealizacion: '2024-02-15',
    fileName: 'control_epp_febrero.pdf',
    fileSize: 167890,
    uploadedBy: 'Carmen Vega',
    uploadedAt: '2024-02-16',
    status: 'approved',
    approvedBy: 'Carlos Mendoza',
    approvedAt: '2024-02-17'
  },
  {
    id: 're8',
    formatId: 'rf6',
    nombre: 'Reunión Comité SST - Febrero',
    fechaRealizacion: '2024-02-20',
    fileName: 'reunion_comite_febrero.pdf',
    fileSize: 145678,
    uploadedBy: 'Carlos Mendoza',
    uploadedAt: '2024-02-21',
    status: 'pending'
  },
  {
    id: 're9',
    formatId: 'rf7',
    nombre: 'Reporte Accidente Menor - Área A',
    fechaRealizacion: '2024-02-22',
    fileName: 'accidente_menor_area_a.pdf',
    fileSize: 234567,
    uploadedBy: 'Ana Pérez',
    uploadedAt: '2024-02-23',
    status: 'pending'
  },
  {
    id: 're10',
    formatId: 'rf1',
    nombre: 'Capacitación Primeros Auxilios',
    fechaRealizacion: '2024-02-25',
    fileName: 'capacitacion_primeros_auxilios.pdf',
    fileSize: 187654,
    uploadedBy: 'Carlos Mendoza',
    uploadedAt: '2024-02-26',
    status: 'approved',
    approvedBy: 'Roberto Silva',
    approvedAt: '2024-02-27'
  },
  {
    id: 're11',
    formatId: 'rf2',
    nombre: 'Inspección de Seguridad - Febrero',
    fechaRealizacion: '2024-02-28',
    fileName: 'inspeccion_seguridad_febrero.pdf',
    fileSize: 298765,
    uploadedBy: 'Carmen Vega',
    uploadedAt: '2024-03-01',
    status: 'pending'
  }
];