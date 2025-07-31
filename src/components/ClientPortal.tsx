import React, { useState } from 'react';
import { FileText, Download, Eye, Calendar, CheckCircle, Clock, AlertTriangle, XCircle, Building, BarChart3, FolderOpen, User, Mail, Phone, MapPin, Users, X, Edit, Upload, File, Search, Filter, ChevronDown } from 'lucide-react';
import AnalyticsCharts from './AnalyticsCharts';
import { useAuth } from './AuthContext';
import MasterDocumentList from './MasterDocumentList';
import DocumentManagement from './DocumentManagement';
import { mockCompanies, mockProjects, mockDocuments, mockDocumentCategories, mockRecordFormats, mockRecordEntries, mockUsers } from '../data/mockData';

interface ClientPortalProps {
  clientId: string;
}

// Componente para documentos por vencer (igual al admin pero filtrado)
const ExpiringDocumentsList = ({ 
  visibleProjects, 
  onNavigateToDocument 
}: { 
  visibleProjects: any[];
  onNavigateToDocument: (type: string, projectId: string) => void;
}) => {
  const today = new Date();
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Documentos por vencer (solo de proyectos visibles)
  const expiringDocuments = mockDocuments.filter(doc => {
    const expirationDate = new Date(doc.fechaVencimiento);
    const isInVisibleProject = visibleProjects.some(p => p.id === doc.projectId);
    return isInVisibleProject && expirationDate >= today && expirationDate <= thirtyDaysLater;
  }).map(doc => ({
    ...doc,
    type: 'document' as const,
    itemName: doc.nombre
  }));

  // Registros por vencer (solo de proyectos visibles)
  const expiringRecords = mockRecordFormats.filter(record => {
    const expirationDate = new Date(record.fechaVencimiento);
    const isInVisibleProject = visibleProjects.some(p => p.id === record.projectId);
    return isInVisibleProject && expirationDate >= today && expirationDate <= thirtyDaysLater;
  }).map(record => ({
    ...record,
    type: 'record' as const,
    itemName: record.nombre
  }));

  const allExpiringItems = [...expiringDocuments, ...expiringRecords].sort((a, b) => 
    new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime()
  );

  const getDaysUntilExpiration = (expirationDate: string) => {
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (allExpiringItems.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-600">No hay documentos o registros por vencer en los próximos 30 días</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 font-medium text-gray-900">Tipo</th>
            <th className="px-4 py-2 font-medium text-gray-900">Documento/Registro</th>
            <th className="px-4 py-2 font-medium text-gray-900">Proyecto</th>
            <th className="px-4 py-2 font-medium text-gray-900">Vencimiento</th>
            <th className="px-4 py-2 font-medium text-gray-900">Días Restantes</th>
            <th className="px-4 py-2 font-medium text-gray-900">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {allExpiringItems.map(item => {
            const project = visibleProjects.find(p => p.id === item.projectId);
            const daysLeft = getDaysUntilExpiration(item.fechaVencimiento);
            
            return (
              <tr key={`${item.type}-${item.id}`} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.type === 'document' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {item.type === 'document' ? 'Documento' : 'Registro'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    {item.type === 'document' ? (
                      <FileText className="w-4 h-4 text-blue-500" />
                    ) : (
                      <FolderOpen className="w-4 h-4 text-purple-500" />
                    )}
                    <span className="font-medium">{item.itemName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{project?.sede}</td>
                <td className="px-4 py-3 text-gray-600">{item.fechaVencimiento}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    daysLeft <= 7 ? 'bg-red-100 text-red-800' :
                    daysLeft <= 15 ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {daysLeft} días
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onNavigateToDocument(item.type, item.projectId)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const ClientPortal: React.FC<ClientPortalProps> = ({ clientId }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'documents'>('dashboard');
  const [documentTab, setDocumentTab] = useState<'documents' | 'records'>('documents');
  const [documentsSubTab, setDocumentsSubTab] = useState<'documents' | 'records'>('documents');
  const [activeProject, setActiveProject] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRecordFormat, setSelectedRecordFormat] = useState<any>(null);
  
  // Estados para separación de documentos y registros
  const [documentActiveTab, setDocumentActiveTab] = useState<'documents' | 'records'>('documents');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showEditRecordModal, setShowEditRecordModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all');
  const [editForm, setEditForm] = useState({
    nombre: '',
    fechaRealizacion: '',
    observaciones: ''
  });
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editDragActive, setEditDragActive] = useState(false);

  // Obtener información de la empresa
  const company = mockCompanies.find(c => c.id === clientId);

  // Filtrar proyectos según permisos del usuario
  const clientProjects = mockProjects.filter(project => project.companyId === clientId);
  const visibleProjects = user?.permissions?.canViewAllCompanyProjects 
    ? clientProjects 
    : clientProjects.filter(project => 
        project.contactPersons.some(contact => contact.email === user?.email)
      );

  const visibleDocuments = mockDocuments.filter(doc => {
    const project = visibleProjects.find(p => p.id === doc.projectId);
    if (!project) return false;
    
    if (activeProject === 'all') return true;
    return doc.projectId === activeProject;
  });

  // Obtener datos para métricas
  const visibleRecordFormats = mockRecordFormats.filter(format => {
    return visibleProjects.some(p => p.id === format.projectId);
  });

  const visibleRecordEntries = mockRecordEntries.filter(entry => {
    return visibleRecordFormats.some(f => f.id === entry.formatId);
  });

  const companyUsers = mockUsers.filter(u => u.companyId === clientId && u.isActive);

  // Proyectos accesibles para filtros
  const accessibleProjects = visibleProjects;

  // Obtener documentos filtrados según el tab activo
  const getFilteredDocuments = () => {
    let baseDocuments = [];
    
    if (documentActiveTab === 'documents') {
      baseDocuments = mockDocuments.filter(doc => {
        return visibleProjects.some(p => p.id === doc.projectId);
      }).map(doc => ({
        id: doc.id,
        name: doc.nombre,
        type: 'document' as const,
        category: mockDocumentCategories.find(cat => cat.id === doc.categoryId)?.name || 'Sin categoría',
        status: doc.status,
        projectId: doc.projectId,
        version: doc.version,
        code: doc.codigo,
        createdDate: doc.fechaCreacion,
        expirationDate: doc.fechaVencimiento,
        fileName: doc.versions.find(v => v.isActive)?.fileName || 'Sin archivo'
      }));
    } else {
      baseDocuments = mockRecordFormats.filter(format => {
        return visibleProjects.some(p => p.id === format.projectId);
      }).map(format => ({
        id: format.id,
        name: format.nombre,
        type: 'record' as const,
        category: mockDocumentCategories.find(cat => cat.id === format.categoryId)?.name || 'Sin categoría',
        status: format.status,
        projectId: format.projectId,
        version: format.version,
        code: format.codigo,
        createdDate: format.fechaCreacion,
        expirationDate: format.fechaVencimiento,
        templateFile: format.versions.find(v => v.isActive)?.fileName || 'Sin archivo'
      }));
    }

    // Aplicar filtros
    return baseDocuments.filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProject = selectedProjectFilter === 'all' || doc.projectId === selectedProjectFilter;
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
      
      return matchesSearch && matchesProject && matchesCategory && matchesStatus;
    });
  };

  const filteredDocuments = getFilteredDocuments();

  // Obtener categorías únicas
  const uniqueCategories = Array.from(new Set(
    (documentActiveTab === 'documents' ? mockDocuments : mockRecordFormats)
      .filter(item => visibleProjects.some(p => p.id === item.projectId))
      .map(item => mockDocumentCategories.find(cat => cat.id === item.categoryId)?.name || 'Sin categoría')
  ));

  // Obtener estados únicos
  const uniqueStatuses = Array.from(new Set(
    (documentActiveTab === 'documents' ? mockDocuments : mockRecordFormats)
      .filter(item => visibleProjects.some(p => p.id === item.projectId))
      .map(item => item.status)
  ));

  // Función para resetear filtros
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedProjectFilter('all');
    setSelectedCategory('all');
    setSelectedStatus('all');
  };

  // Funciones para editar registro
  const handleEditRecord = (record: any) => {
    setEditingRecord(record);
    setEditForm({
      nombre: record.nombre,
      fechaRealizacion: record.fechaRealizacion,
      observaciones: record.notes || ''
    });
    setEditFile(null);
    setShowEditRecordModal(true);
  };

  const resetEditForm = () => {
    setShowEditRecordModal(false);
    setEditingRecord(null);
    setEditForm({
      nombre: '',
      fechaRealizacion: '',
      observaciones: ''
    });
    setEditFile(null);
    setEditDragActive(false);
  };

  const handleEditDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setEditDragActive(true);
    } else if (e.type === 'dragleave') {
      setEditDragActive(false);
    }
  };

  const handleEditDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setEditFile(files[0]);
    }
  };

  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setEditFile(files[0]);
    }
  };

  const handleSaveEditRecord = () => {
    if (!editForm.nombre || !editForm.fechaRealizacion) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const updateMessage = editFile 
      ? `✅ Registro actualizado exitosamente!\n📁 Nuevo archivo: ${editFile.name}\n📋 El registro será enviado para revisión.`
      : `✅ Registro actualizado exitosamente!\n📋 Se mantiene el archivo original.\n📋 El registro será enviado para revisión.`;
    
    alert(updateMessage);
    resetEditForm();
  };

  // Funciones auxiliares para estados
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-orange-100 text-orange-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'pending_review': return 'En Revisión';
      case 'draft': return 'Borrador';
      case 'expired': return 'Vencido';
      case 'rejected': return 'Rechazado';
      default: return 'Desconocido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'pending_review': return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      case 'draft': return <div className="w-2 h-2 bg-orange-500 rounded-full" />;
      case 'expired': return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      case 'rejected': return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      default: return <div className="w-2 h-2 bg-gray-500 rounded-full" />;
    }
  };

  // Funciones para manejar documentos
  const handleDownloadDocument = (item: any) => {
    // Simular descarga
    const link = document.createElement('a');
    link.href = '#'; // En producción sería la URL real del archivo
    link.download = item.fileName || item.templateFile;
    link.click();
    
    // Mostrar notificación
    alert(`✅ Descargando: ${item.fileName || item.templateFile}\n📁 Archivo: ${item.name}`);
    console.log('Descargando:', item.name, item.fileName || item.templateFile);
  };

  const handleViewDocument = (item: any) => {
    // Buscar el documento/registro original para obtener toda la información
    let fullItem = null;
    
    if (item.type === 'document') {
      fullItem = mockDocuments.find(d => d.id === item.id);
    } else {
      fullItem = mockRecordFormats.find(r => r.id === item.id);
    }
    
    if (fullItem) {
      setSelectedDocument({
        ...fullItem,
        type: item.type,
        category: item.category,
        fileName: item.fileName || item.templateFile
      });
      setShowDocumentModal(true);
    }
  };

  const handleUploadRecordEntry = (format: any) => {
    setSelectedRecordFormat(format);
    setShowUploadModal(true);
  };

  const DashboardContent = () => (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Proyectos Activos</p>
              <p className="text-2xl font-bold text-gray-900">{visibleProjects.filter(p => p.isActive).length}</p>
            </div>
            <Building className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Documentos Total</p>
              <p className="text-2xl font-bold text-gray-900">{visibleDocuments.length}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{companyUsers.length}</p>
            </div>
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Segunda fila de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Registros Base Total</p>
              <p className="text-2xl font-bold text-gray-900">{visibleRecordFormats.length}</p>
            </div>
            <FolderOpen className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Registros Llenos Total</p>
              <p className="text-2xl font-bold text-gray-900">{visibleRecordEntries.length}</p>
            </div>
            <FolderOpen className="w-8 h-8 text-teal-600" />
          </div>
        </div>
      </div>

      {/* Gráficos de analíticas */}
      <AnalyticsCharts user={user} />

      {/* Documentos y Registros por vencer */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Documentos y Registros por Vencer (Próximos 30 días)
        </h3>
        <ExpiringDocumentsList 
          visibleProjects={visibleProjects}
          onNavigateToDocument={(type, projectId) => {
            setActiveProject(projectId);
            setActiveTab('documents');
          }}
        />
      </div>
    </div>
  );

  const ProjectsContent = () => (
    <div className="grid grid-cols-1 gap-6">
      {visibleProjects.map(project => {
        const projectDocs = visibleDocuments.filter(d => d.projectId === project.id);
        const projectRecordFormats = visibleRecordFormats.filter(r => r.projectId === project.id);
        const projectRecordEntries = visibleRecordEntries.filter(e => 
          projectRecordFormats.some(f => f.id === e.formatId)
        );
        
        return (
          <div key={project.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{project.sede}</h3>
                <p className="text-sm text-gray-600">Inicio: {project.fechaInicio}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {project.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="mb-4">
              <p className="text-gray-700">{project.descripcion}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center bg-blue-50 p-3 rounded-lg">
                <p className="text-lg font-bold text-blue-900">{projectDocs.length}</p>
                <p className="text-xs text-blue-600">Documentos</p>
              </div>
              <div className="text-center bg-orange-50 p-3 rounded-lg">
                <p className="text-lg font-bold text-orange-900">{projectRecordFormats.length}</p>
                <p className="text-xs text-orange-600">Reg. Base</p>
              </div>
              <div className="text-center bg-teal-50 p-3 rounded-lg">
                <p className="text-lg font-bold text-teal-900">{projectRecordEntries.length}</p>
                <p className="text-xs text-teal-600">Reg. Llenos</p>
              </div>
              <div className="text-center bg-green-50 p-3 rounded-lg">
                <p className="text-lg font-bold text-green-900">
                  {projectDocs.filter(d => d.status === 'approved').length}
                </p>
                <p className="text-xs text-green-600">Aprobados</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={() => setSelectedProject(project)}
                className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg text-sm hover:bg-green-100 transition-colors"
              >
                Ver Detalles
              </button>
              <button 
                onClick={() => {
                  setActiveProject(project.id);
                  setActiveTab('documents');
                }}
                className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-sm hover:bg-blue-100 transition-colors"
              >
                Ver Documentos
              </button>
            </div>
          </div>
        );
      })}
      
      {visibleProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No tienes proyectos asignados</p>
        </div>
      )}
    </div>
  );

  const DocumentsContent = () => {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Documentos y Registros</h2>
          <p className="text-gray-600">Administra documentos SST y formatos de registro</p>
        </div>

        {/* Tabs para alternar entre Documentos y Registros */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setDocumentActiveTab('documents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                documentActiveTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Documentos
            </button>
            <button
              onClick={() => setDocumentActiveTab('records')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                documentActiveTab === 'records'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FolderOpen className="w-4 h-4 inline mr-2" />
              Registros
            </button>
          </nav>
        </div>

        {/* Filtros */}
        <div className="space-y-4">
          {/* Barra de búsqueda y botón de filtros */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={documentActiveTab === 'documents' ? "Buscar documentos..." : "Buscar registros..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Gráficos de analíticas de la empresa */}
          <AnalyticsCharts user={user} />

          {/* Panel de filtros expandible */}
          {showFilters && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro por proyecto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
                  <select
                    value={selectedProjectFilter}
                    onChange={(e) => setSelectedProjectFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">Todos los proyectos</option>
                    {accessibleProjects.map(project => (
                      <option key={project.id} value={project.id}>{project.sede}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro por categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">Todas</option>
                    {uniqueCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Filtro por estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">Todos</option>
                    {uniqueStatuses.map(status => (
                      <option key={status} value={status}>
                        {status === 'approved' ? 'Aprobado' :
                         status === 'pending_review' ? 'En Revisión' :
                         status === 'draft' ? 'Borrador' :
                         status === 'expired' ? 'Vencido' :
                         status === 'rejected' ? 'Rechazado' : status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  Mostrando {filteredDocuments.length} {documentActiveTab === 'documents' ? 'documentos' : 'registros'}
                </div>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm transition-colors"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          )}

          {!showFilters && (
            <div className={`text-sm text-gray-600 p-3 rounded-lg ${documentActiveTab === 'documents' ? 'bg-blue-50' : 'bg-purple-50'}`}>
              📊 Mostrando <span className="font-medium">{filteredDocuments.length}</span> {documentActiveTab === 'documents' ? 'documentos' : 'registros'}
              {(searchTerm || selectedProjectFilter !== 'all' || selectedCategory !== 'all' || selectedStatus !== 'all') && (
                <span className="ml-2">
                  • <button onClick={resetFilters} className={`underline hover:opacity-80 ${documentActiveTab === 'documents' ? 'text-blue-600' : 'text-purple-600'}`}>Limpiar filtros</button>
                </span>
              )}
            </div>
          )}
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedProjectFilter !== 'all' || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'No se encontraron resultados' 
                : documentActiveTab === 'documents' ? 'No hay documentos' : 'No hay registros'
              }
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedProjectFilter !== 'all' || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : documentActiveTab === 'documents' ? 'No tienes acceso a documentos en este momento.' : 'No tienes acceso a registros en este momento.'
              }
            </p>
            {(searchTerm || selectedProjectFilter !== 'all' || selectedCategory !== 'all' || selectedStatus !== 'all') && (
              <button
                onClick={resetFilters}
                className={`mt-4 text-white px-4 py-2 rounded-lg transition-colors ${
                  documentActiveTab === 'documents' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {documentActiveTab === 'documents' ? (
              // Sección de Documentos
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 font-medium text-gray-900">Documento</th>
                      <th className="px-6 py-3 font-medium text-gray-900">Categoría</th>
                      <th className="px-6 py-3 font-medium text-gray-900">Estado</th>
                      <th className="px-6 py-3 font-medium text-gray-900">Proyecto</th>
                      <th className="px-6 py-3 font-medium text-gray-900">Código</th>
                      <th className="px-6 py-3 font-medium text-gray-900">Vencimiento</th>
                      <th className="px-6 py-3 font-medium text-gray-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDocuments.map(doc => {
                      const project = accessibleProjects.find(p => p.id === doc.projectId);
                      
                      return (
                        <tr key={doc.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{doc.name}</p>
                                <p className="text-xs text-gray-500">v{doc.version} • {doc.fileName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{doc.category}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                              {getStatusText(doc.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{project?.sede}</td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm text-gray-900">{doc.code}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{doc.expirationDate}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleViewDocument(doc)}
                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                              >
                                Ver
                              </button>
                              <button 
                                onClick={() => handleDownloadDocument(doc)}
                                className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200 transition-colors"
                              >
                                Descargar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              // Sección de Registros
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 font-medium text-gray-900">Registro</th>
                      <th className="px-6 py-3 font-medium text-gray-900">Categoría</th>
                      <th className="px-6 py-3 font-medium text-gray-900">Estado</th>
                      <th className="px-6 py-3 font-medium text-gray-900">Proyecto</th>
                      <th className="px-6 py-3 font-medium text-gray-900">Código</th>
                      <th className="px-6 py-3 font-medium text-gray-900">Vencimiento</th>
                      <th className="px-6 py-3 font-medium text-gray-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredDocuments.map(doc => {
                      const project = accessibleProjects.find(p => p.id === doc.projectId);
                      
                      return (
                        <tr key={doc.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FolderOpen className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{doc.name}</p>
                                <p className="text-xs text-gray-500">v{doc.version} • {doc.templateFile}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{doc.category}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                              {getStatusText(doc.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{project?.sede}</td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm text-gray-900">{doc.code}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{doc.expirationDate}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleViewDocument(doc)}
                                className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm hover:bg-purple-200 transition-colors"
                              >
                                Ver
                              </button>
                              <button 
                                onClick={() => handleDownloadDocument(doc)}
                                className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200 transition-colors"
                              >
                                Descargar
                              </button>
                              <button
                                onClick={() => handleUploadRecordEntry(doc)}
                                className="bg-orange-100 text-orange-700 px-3 py-1 rounded text-sm hover:bg-orange-200 transition-colors flex items-center space-x-1"
                                title="Subir registro lleno"
                              >
                                <FolderOpen className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'projects':
        return <ProjectsContent />;
      case 'documents':
        return (
          <DocumentManagement 
            selectedProjectId={accessibleProjects[0]?.id || ''}
            user={user}
          />
        );
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{company?.razonSocial}</h1>
              <p className="text-gray-600">Portal del Cliente - {user?.name}</p>
            </div>
          </div>
        </div>

        {/* Navegación por tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FolderOpen className="w-4 h-4 inline mr-2" />
              Mis Proyectos
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Mis Documentos
            </button>
          </nav>
        </div>

        {/* Contenido según tab activo */}
        {renderContent()}

        {/* Modal de Proyecto */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedProject.sede}</h2>
                    <p className="text-sm text-gray-600">{company?.razonSocial}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Información del Proyecto</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{company?.razonSocial}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{selectedProject.sede}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">Inicio: {selectedProject.fechaInicio}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedProject.descripcion}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Personas de Contacto del Proyecto</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedProject.contactPersons.map((contact: any) => (
                        <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <User className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">{contact.nombres} {contact.apellidos}</p>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{contact.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{contact.telefono}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para ver documento/registro */}
        {showDocumentModal && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedDocument.type === 'document' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {selectedDocument.type === 'document' ? (
                      <FileText className="w-6 h-6 text-blue-600" />
                    ) : (
                      <FolderOpen className="w-6 h-6 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedDocument.nombre || selectedDocument.name}</h2>
                    <p className="text-sm text-gray-600">
                      {selectedDocument.type === 'document' ? 'Documento' : 'Formato de Registro'} - {selectedDocument.category}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Información general */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Empresa:</span>
                        <span className="font-medium">{company?.razonSocial}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Proyecto:</span>
                        <span className="font-medium">{visibleProjects.find(p => p.id === selectedDocument.projectId)?.sede}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Código:</span>
                        <span className="font-mono text-sm">{selectedDocument.codigo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Versión:</span>
                        <span className="font-medium">v{selectedDocument.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(selectedDocument.status)}
                          <span className="font-medium">{getStatusText(selectedDocument.status)}</span>
                        </div>
                      </div>
                      {selectedDocument.type === 'record' && selectedDocument.recordCount !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Registros llenos:</span>
                          <span className="font-medium text-purple-600">{selectedDocument.recordCount}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Creación:</span>
                        <span className="font-medium">{selectedDocument.fechaCreacion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vencimiento:</span>
                        <span className="font-medium">{selectedDocument.fechaVencimiento}</span>
                      </div>
                      {selectedDocument.approvedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Aprobación:</span>
                          <span className="font-medium">{selectedDocument.approvedAt}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Roles (solo para documentos) */}
                {selectedDocument.type === 'document' && (selectedDocument.elaborators || selectedDocument.reviewers || selectedDocument.approvers) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {selectedDocument.elaborators && selectedDocument.elaborators.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Elaboradores</h4>
                        <div className="space-y-2">
                          {selectedDocument.elaborators.map((person: any) => (
                            <div key={person.id} className="text-sm">
                              <p className="font-medium">{person.nombres} {person.apellidos}</p>
                              <p className="text-gray-600">{person.email}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedDocument.reviewers && selectedDocument.reviewers.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Revisores</h4>
                        <div className="space-y-2">
                          {selectedDocument.reviewers.map((person: any) => (
                            <div key={person.id} className="text-sm">
                              <p className="font-medium">{person.nombres} {person.apellidos}</p>
                              <p className="text-gray-600">{person.email}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedDocument.approvers && selectedDocument.approvers.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Aprobadores</h4>
                        <div className="space-y-2">
                          {selectedDocument.approvers.map((person: any) => (
                            <div key={person.id} className="text-sm">
                              <p className="font-medium">{person.nombres} {person.apellidos}</p>
                              <p className="text-gray-600">{person.email}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Historial de versiones */}
                {selectedDocument.versions && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Versiones</h3>
                    <div className="space-y-3">
                      {selectedDocument.versions.map((version: any) => (
                        <div key={version.id} className={`border rounded-lg p-4 ${version.isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">Versión {version.versionNumber}</span>
                                {version.isActive && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Activa</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{version.fileName}</p>
                              <p className="text-xs text-gray-500">
                                Subido por {version.uploadedBy} el {version.uploadedAt}
                              </p>
                              {version.changes && (
                                <p className="text-sm text-gray-700 mt-2">{version.changes}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleDownloadDocument(selectedDocument)}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Descargar versión"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Registros llenos relacionados (solo para registros base) */}
                {selectedDocument.type === 'record' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Registros Llenos Relacionados</h3>
                    {(() => {
                      const relatedEntries = visibleRecordEntries.filter(entry => entry.formatId === selectedDocument.id);
                      
                      if (relatedEntries.length === 0) {
                        return (
                          <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600">No hay registros llenos para este formato</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3">
                          {relatedEntries.map(entry => (
                            <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <FolderOpen className="w-5 h-5 text-purple-600" />
                                    <h4 className="font-medium text-gray-900">{entry.nombre}</h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                                      entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {entry.status === 'approved' ? 'Aprobado' :
                                       entry.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                      <span className="font-medium">Fecha realización:</span> {entry.fechaRealizacion}
                                    </div>
                                    <div>
                                      <span className="font-medium">Subido por:</span> {entry.uploadedBy}
                                    </div>
                                    <div>
                                      <span className="font-medium">Archivo:</span> {entry.fileName}
                                    </div>
                                    <div>
                                      <span className="font-medium">Fecha subida:</span> {entry.uploadedAt}
                                    </div>
                                    {entry.approvedBy && (
                                      <div className="col-span-2">
                                        <span className="font-medium">Aprobado por:</span> {entry.approvedBy} el {entry.approvedAt}
                                      </div>
                                    )}
                                    {entry.notes && (
                                      <div className="col-span-2">
                                        <span className="font-medium">Notas:</span> {entry.notes}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                  <button
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = '#';
                                      link.download = entry.fileName;
                                      link.click();
                                      alert(`✅ Descargando: ${entry.fileName}\n📁 Registro: ${entry.nombre}`);
                                    }}
                                    className="text-green-600 hover:text-green-800 p-1"
                                    title="Descargar registro lleno"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                  {(entry.uploadedBy === user?.name || user?.email === 'carlos@constructoraabc.com') && (
                                    <button
                                      onClick={() => handleEditRecord(entry)}
                                      className="text-blue-600 hover:text-blue-800 p-1"
                                      title="Editar registro lleno"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => handleDownloadDocument(selectedDocument)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar</span>
                  </button>
                  {selectedDocument.type === 'record' && (
                    <button
                      onClick={() => {
                        setShowDocumentModal(false);
                        handleUploadRecordEntry(selectedDocument);
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                    >
                      <FolderOpen className="w-4 h-4" />
                      <span>Subir Registro Lleno</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para subir registro lleno */}
        {showUploadModal && selectedRecordFormat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Subir Registro Lleno</h2>
                    <p className="text-sm text-gray-600">Formato: {selectedRecordFormat.nombre || selectedRecordFormat.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900 mb-2">Formato Base:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-purple-700">Código:</span>
                      <span className="font-mono">{selectedRecordFormat.codigo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Versión:</span>
                      <span>v{selectedRecordFormat.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-700">Proyecto:</span>
                      <span>{visibleProjects.find(p => p.id === selectedRecordFormat.projectId)?.sede}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Registro Lleno *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ej: Capacitación en Trabajo en Alturas - Marzo 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Realización *
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Archivo del Registro Lleno *
                  </label>
                  <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                    <FolderOpen className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Arrastra el archivo aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-gray-600 mb-3">
                      Formatos soportados: PDF, DOC, DOCX, XLS, XLSX (máx. 10MB)
                    </p>
                    <button
                      type="button"
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm transition-colors"
                    >
                      Seleccionar Archivo
                    </button>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="Observaciones adicionales sobre el registro..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    alert('✅ Registro lleno subido exitosamente!\n📋 Será enviado para revisión y aprobación.');
                    setShowUploadModal(false);
                  }}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                >
                  Subir Registro
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de editar registro lleno */}
        {showEditRecordModal && editingRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Edit className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Editar Registro Lleno</h2>
                    <p className="text-sm text-gray-600">
                      Formato: {mockRecordFormats.find(f => f.id === editingRecord.formatId)?.nombre}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetEditForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Información del registro actual */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Registro Actual</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">ID:</span>
                      <span className="ml-2 font-mono">{editingRecord.id}</span>
                    </div>
                    <div>
                      <span className="text-blue-600">Estado:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        editingRecord.status === 'approved' ? 'bg-green-100 text-green-800' :
                        editingRecord.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {editingRecord.status === 'approved' ? 'Aprobado' :
                         editingRecord.status === 'pending' ? 'Pendiente' : 'Rechazado'}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-600">Archivo actual:</span>
                      <span className="ml-2 font-mono text-xs">{editingRecord.fileName}</span>
                    </div>
                    <div>
                      <span className="text-blue-600">Subido:</span>
                      <span className="ml-2">{editingRecord.uploadedAt}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Registro *
                  </label>
                  <input
                    type="text"
                    value={editForm.nombre}
                    onChange={(e) => setEditForm(prev => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Capacitación en Trabajo en Alturas - Marzo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Realización *
                  </label>
                  <input
                    type="date"
                    value={editForm.fechaRealizacion}
                    onChange={(e) => setEditForm(prev => ({ ...prev, fechaRealizacion: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nuevo Archivo (opcional)
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Si no seleccionas un archivo, se mantendrá el archivo actual
                  </p>
                  
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      editDragActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleEditDrag}
                    onDragLeave={handleEditDrag}
                    onDragOver={handleEditDrag}
                    onDrop={handleEditDrop}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      Arrastra el nuevo archivo aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-gray-600 mb-3">
                      PDF, DOC, DOCX, XLS, XLSX (máx. 10MB)
                    </p>
                    <button
                      type="button"
                      onClick={() => document.getElementById('edit-file-input')?.click()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Seleccionar Archivo
                    </button>
                    <input
                      id="edit-file-input"
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleEditFileSelect}
                      className="hidden"
                    />
                  </div>

                  {editFile && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">{editFile.name}</p>
                        <p className="text-xs text-blue-600">
                          {(editFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditFile(null)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                  </label>
                  <textarea
                    value={editForm.observaciones}
                    onChange={(e) => setEditForm(prev => ({ ...prev, observaciones: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Notas o comentarios adicionales sobre el registro..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={resetEditForm}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEditRecord}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientPortal;