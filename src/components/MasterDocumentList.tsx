import React, { useState, useMemo } from 'react';
import { FileText, Download, Eye, Filter, Search, Calendar, Building, FolderOpen, X, ChevronDown, User, Mail, Phone, MapPin, CheckCircle, Clock, AlertTriangle, Edit } from 'lucide-react';
import { useAuth } from './AuthContext';
import { mockDocuments, mockProjects, mockCompanies, mockDocumentCategories, mockRecordFormats, mockRecordEntries } from '../data/mockData';

interface MasterDocumentListProps {
  onClose: () => void;
  companyId?: string; // Para filtrar por empresa específica desde vista admin
}

const MasterDocumentList: React.FC<MasterDocumentListProps> = ({ onClose, companyId }) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'document' | 'record'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Filtrar datos según el rol del usuario
  const filteredCompanies = useMemo(() => {
    if (user?.role === 'admin' && !companyId) {
      return mockCompanies;
    } else if (user?.role === 'admin' && companyId) {
      return mockCompanies.filter(company => company.id === companyId);
    } else if (user?.role === 'company_user' && user.companyId) {
      return mockCompanies.filter(company => company.id === user.companyId);
    }
    return [];
  }, [user, companyId]);

  const filteredProjects = useMemo(() => {
    if (user?.role === 'admin' && !companyId) {
      return selectedCompany === 'all' 
        ? mockProjects 
        : mockProjects.filter(project => project.companyId === selectedCompany);
    } else if (user?.role === 'admin' && companyId) {
      return mockProjects.filter(project => project.companyId === companyId);
    } else if (user?.role === 'company_user' && user.companyId) {
      const companyProjects = mockProjects.filter(project => project.companyId === user.companyId);
      
      // Si el usuario no tiene permisos para ver toda la empresa, solo ve proyectos donde es contacto
      if (!user.permissions?.canViewAllCompanyProjects) {
        return companyProjects.filter(project => 
          project.contactPersons.some(contact => 
            contact.email === user.email
          )
        );
      }
      
      return companyProjects;
    }
    return [];
  }, [user, selectedCompany, companyId]);

  // Crear lista unificada de documentos y registros
  const unifiedDocuments = useMemo(() => {
    const documents = mockDocuments
      .filter(doc => {
        const project = mockProjects.find(p => p.id === doc.projectId);
        
        if (companyId) {
          return project?.companyId === companyId;
        }
        
        if (user?.role === 'company_user' && user.companyId) {
          if (project?.companyId !== user.companyId) return false;
          
          // Si el usuario no tiene permisos para ver toda la empresa, solo ve documentos de proyectos donde es contacto
          if (!user.permissions?.canViewAllCompanyProjects) {
            return project.contactPersons.some(contact => contact.email === user.email);
          }
          
          return true;
        }
        return true;
      })
      .map(doc => ({
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

    const records = mockRecordFormats
      .filter(format => {
        const project = mockProjects.find(p => p.id === format.projectId);
        
        if (companyId) {
          return project?.companyId === companyId;
        }
        
        if (user?.role === 'company_user' && user.companyId) {
          if (project?.companyId !== user.companyId) return false;
          
          // Si el usuario no tiene permisos para ver toda la empresa, solo ve registros de proyectos donde es contacto
          if (!user.permissions?.canViewAllCompanyProjects) {
            return project.contactPersons.some(contact => contact.email === user.email);
          }
          
          return true;
        }
        return true;
      })
      .map(format => ({
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
        fileName: format.templateFile || 'Sin archivo',
        recordCount: mockRecordEntries.filter(entry => entry.formatId === format.id).length
      }));

    return [...documents, ...records];
  }, [user, companyId]);

  // Aplicar filtros
  const filteredDocuments = useMemo(() => {
    return unifiedDocuments.filter(doc => {
      const project = mockProjects.find(p => p.id === doc.projectId);
      const company = mockCompanies.find(c => c.id === project?.companyId);

      // Filtro de búsqueda
      if (searchTerm && !doc.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filtro de tipo
      if (selectedType !== 'all' && doc.type !== selectedType) {
        return false;
      }

      // Filtro de estado
      if (selectedStatus !== 'all' && doc.status !== selectedStatus) {
        return false;
      }

      // Filtro de categoría
      if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
        return false;
      }

      // Filtro de empresa (solo para admin)
      if (user?.role === 'admin' && !companyId && selectedCompany !== 'all' && project?.companyId !== selectedCompany) {
        return false;
      }

      // Filtro de proyecto
      if (selectedProject !== 'all' && doc.projectId !== selectedProject) {
        return false;
      }

      return true;
    });
  }, [unifiedDocuments, searchTerm, selectedType, selectedStatus, selectedCategory, selectedCompany, selectedProject, user, companyId]);

  const handleViewDocument = (doc: any) => {
    // Buscar el documento original para obtener toda la información
    let fullDocument = null;
    
    if (doc.type === 'document') {
      fullDocument = mockDocuments.find(d => d.id === doc.id);
    } else {
      fullDocument = mockRecordFormats.find(r => r.id === doc.id);
    }
    
    if (fullDocument) {
      setSelectedDocument({
        ...fullDocument,
        type: doc.type,
        category: doc.category,
        fileName: doc.fileName,
        recordCount: doc.recordCount
      });
      setShowDocumentModal(true);
    }
  };

  const handleDownloadDocument = (doc: any) => {
    // Simular descarga
    if (doc.type === 'document') {
      const originalDoc = mockDocuments.find(d => d.id === doc.id);
      const activeVersion = originalDoc?.versions.find(v => v.isActive);
      if (activeVersion) {
        alert(`Descargando: ${activeVersion.fileName}`);
        console.log('Descargando documento:', doc.name, activeVersion.fileName);
      } else {
        alert('No hay versión activa para descargar');
      }
    } else {
      const originalFormat = mockRecordFormats.find(r => r.id === doc.id);
      const activeVersion = originalFormat?.versions.find(v => v.isActive);
      if (activeVersion) {
        alert(`Descargando formato: ${activeVersion.fileName}`);
        console.log('Descargando formato:', doc.name, activeVersion.fileName);
      } else {
        alert('No hay archivo de formato para descargar');
      }
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

  const exportToCSV = () => {
    const headers = ['Nombre', 'Tipo', 'Categoría', 'Estado', 'Empresa', 'Proyecto', 'Código', 'Versión', 'Fecha Creación', 'Fecha Vencimiento'];
    const csvData = filteredDocuments.map(doc => {
      const project = mockProjects.find(p => p.id === doc.projectId);
      const company = mockCompanies.find(c => c.id === project?.companyId);
      return [
        doc.name,
        doc.type === 'document' ? 'Documento' : 'Registro',
        doc.category,
        getStatusText(doc.status),
        company?.razonSocial || 'Sin empresa',
        project?.sede || 'Sin proyecto',
        doc.code,
        doc.version,
        doc.createdDate,
        doc.expirationDate
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `documentos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedCategory('all');
    setSelectedCompany('all');
    setSelectedProject('all');
  };

  // Modal para ver documento/registro
  const DocumentViewModal = () => {
    if (!showDocumentModal || !selectedDocument) return null;

    const project = mockProjects.find(p => p.id === selectedDocument.projectId);
    const company = mockCompanies.find(c => c.id === project?.companyId);
    const category = mockDocumentCategories.find(cat => cat.id === selectedDocument.categoryId);

    return (
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
                  {selectedDocument.type === 'document' ? 'Documento' : 'Formato de Registro'} - {category?.name}
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
                    <span className="font-medium">{project?.sede}</span>
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
                      <span className="text-gray-600">Registros:</span>
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

            {/* Información del proyecto */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Proyecto</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{company?.razonSocial}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{project?.sede}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Inicio: {project?.fechaInicio}</span>
                  </div>
                  {project?.descripcion && (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Descripción:</p>
                      <p className="text-gray-700 text-sm">{project.descripcion}</p>
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

            {/* Historial de versiones (solo para documentos) */}
            {selectedDocument.type === 'document' && selectedDocument.versions && (
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

            {/* Botones de acción */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => handleDownloadDocument(selectedDocument)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Descargar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-7xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Lista Maestra de Documentos</h2>
            <p className="text-sm text-gray-600">
              {companyId 
                ? `Vista de ${mockCompanies.find(c => c.id === companyId)?.razonSocial}`
                : user?.role === 'admin' 
                  ? 'Vista completa del sistema' 
                  : `Vista de ${mockCompanies.find(c => c.id === user?.companyId)?.razonSocial}`
              }
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Búsqueda */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Botón de filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Exportar */}
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
          </div>

          {/* Panel de filtros expandible */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    <option value="document">Documentos</option>
                    <option value="record">Registros</option>
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    <option value="approved">Aprobado</option>
                    <option value="pending_review">En Revisión</option>
                    <option value="draft">Borrador</option>
                    <option value="expired">Vencido</option>
                    <option value="rejected">Rechazado</option>
                  </select>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todas</option>
                    {mockDocumentCategories.map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>

                {/* Empresa (solo para admin) */}
                {user?.role === 'admin' && !companyId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                    <select
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todas</option>
                      {filteredCompanies.map(company => (
                        <option key={company.id} value={company.id}>{company.razonSocial}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Proyecto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    {filteredProjects.map(project => (
                      <option key={project.id} value={project.id}>{project.sede}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        <div className="p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Mostrando {filteredDocuments.length} de {unifiedDocuments.length} elementos
            </p>
          </div>
        </div>

        {/* Lista de documentos */}
        <div className="flex-1 overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-900">Documento</th>
                  <th className="px-6 py-3 font-medium text-gray-900">Tipo</th>
                  <th className="px-6 py-3 font-medium text-gray-900">Categoría</th>
                  <th className="px-6 py-3 font-medium text-gray-900">Estado</th>
                  {user?.role === 'admin' && !companyId && (
                    <th className="px-6 py-3 font-medium text-gray-900">Empresa</th>
                  )}
                  <th className="px-6 py-3 font-medium text-gray-900">Proyecto</th>
                  <th className="px-6 py-3 font-medium text-gray-900">Código</th>
                  <th className="px-6 py-3 font-medium text-gray-900">Versión</th>
                  <th className="px-6 py-3 font-medium text-gray-900">Vencimiento</th>
                  <th className="px-6 py-3 font-medium text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDocuments.map(doc => {
                  const project = mockProjects.find(p => p.id === doc.projectId);
                  const company = mockCompanies.find(c => c.id === project?.companyId);
                  
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            doc.type === 'document' ? 'bg-blue-100' : 'bg-purple-100'
                          }`}>
                            {doc.type === 'document' ? (
                              <FileText className="w-4 h-4 text-blue-600" />
                            ) : (
                              <FolderOpen className="w-4 h-4 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500">{doc.fileName}</p>
                            {doc.type === 'record' && (
                              <p className="text-xs text-purple-600">{doc.recordCount} registros</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          doc.type === 'document' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {doc.type === 'document' ? 'Documento' : 'Registro'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{doc.category}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(doc.status)}
                          <span className="text-gray-700">{getStatusText(doc.status)}</span>
                        </div>
                      </td>
                      {user?.role === 'admin' && !companyId && (
                        <td className="px-6 py-4 text-gray-600">{company?.razonSocial}</td>
                      )}
                      <td className="px-6 py-4 text-gray-600">{project?.sede}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-900">{doc.code}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-900">v{doc.version}</span>
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
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Ver documento"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDownloadDocument(doc)}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Descargar documento"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron documentos</h3>
              <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>

        <DocumentViewModal />
      </div>
    </div>
  );
};

export default MasterDocumentList;