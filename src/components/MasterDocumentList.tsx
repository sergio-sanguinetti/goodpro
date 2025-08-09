import React, { useState, useMemo, useEffect } from 'react';
import { FileText, Download, Eye, Filter, Search, Calendar, Building, FolderOpen, X, ChevronDown, MapPin } from 'lucide-react';
import { useAuth } from './AuthContext';
import { DatabaseService } from '../services/database';
import { StorageService } from '../services/storage';

interface MasterDocumentListProps {
  onClose: () => void;
  companyId?: string; // Para filtrar por empresa específica desde vista admin
}

// Tipos de datos minimizados para la UI
interface UnifiedItem {
  id: string;
  type: 'document' | 'record';
  name: string;
  category: string;
  status: string;
  projectId: string;
  code: string;
  version: string;
  createdDate?: string;
  expirationDate?: string;
  fileName?: string;
  recordCount?: number;
  bucket: 'documents' | 'records';
  filePath?: string; // ruta del archivo activo
  raw?: any;
}

const MasterDocumentList: React.FC<MasterDocumentListProps> = ({ onClose, companyId }) => {
  const { user } = useAuth();

  // Estados UI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'document' | 'record'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  // Estados de datos reales
  const [companies, setCompanies] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [unified, setUnified] = useState<UnifiedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cargar datos desde Supabase
  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        const allCompanies = await DatabaseService.getCompanies();
        setCompanies(allCompanies);

        // Proyectos visibles según permisos
        const projs = await DatabaseService.getProjectsVisibleToUser({
          role: user?.role || 'company_user',
          userId: user?.id || '',
          companyId: companyId || user?.company_id,
          canViewAllCompanyProjects: user?.permissions?.canViewAllCompanyProjects
        });
        setProjects(projs);

        const cats = await DatabaseService.getDocumentCategories();
        setCategories(cats);

        const allUnified: UnifiedItem[] = [];
        const projectEntriesCount: Record<string, number> = {};
        for (const p of projs) {
          const entries = await DatabaseService.getRecordEntriesByProject(p.id);
          for (const e of entries) {
            const fid = e.record_format_id;
            projectEntriesCount[fid] = (projectEntriesCount[fid] || 0) + 1;
          }
        }

        await Promise.all(
          projs.map(async (p) => {
            const docs = await DatabaseService.getDocumentsByProject(p.id);
            docs.forEach((doc: any) => {
              const active = (doc.versions || []).find((v: any) => v.is_active);

              // Si es usuario limitado, solo documentos donde está asignado
              if (user?.role !== 'admin' && !user?.permissions?.canViewAllCompanyProjects) {
                const roles = doc.roles || [];
                const isAssigned = roles.some((r: any) => r.user_id === user?.id || r.email?.toLowerCase() === user?.email?.toLowerCase());
                if (!isAssigned) return; // saltar no asignados
              }

              allUnified.push({
                id: doc.id,
                type: 'document',
                name: doc.nombre,
                category: doc.category?.name || 'Sin categoría',
                status: doc.status,
                projectId: doc.project_id,
                code: doc.codigo,
                version: doc.version || (active?.version_number ?? ''),
                createdDate: doc.fecha_creacion,
                expirationDate: doc.fecha_vencimiento,
                fileName: active?.file_name,
                bucket: 'documents',
                filePath: active?.file_path,
                raw: doc
              });
            });

            const recs = await DatabaseService.getRecordFormatsByProject(p.id);
            recs.forEach((rf: any) => {
              const active = (rf.versions || []).find((v: any) => v.is_active);

              if (user?.role !== 'admin' && !user?.permissions?.canViewAllCompanyProjects) {
                const roles = rf.roles || [];
                const isAssigned = roles.some((r: any) => r.user_id === user?.id || r.email?.toLowerCase() === user?.email?.toLowerCase());
                if (!isAssigned) return;
              }

              allUnified.push({
                id: rf.id,
                type: 'record',
                name: rf.nombre,
                category: rf.category?.name || 'Sin categoría',
                status: rf.status,
                projectId: rf.project_id,
                code: rf.codigo,
                version: rf.version || (active?.version_number ?? ''),
                createdDate: rf.fecha_creacion,
                expirationDate: rf.fecha_vencimiento,
                fileName: active?.file_name,
                recordCount: projectEntriesCount[rf.id] || 0,
                bucket: 'records',
                filePath: active?.file_path,
                raw: rf
              });
            });
          })
        );

        setUnified(allUnified);
      } catch (err) {
        console.error('❌ Error cargando datos para Lista Maestra:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [user?.id, user?.role, user?.company_id, user?.permissions?.canViewAllCompanyProjects, companyId]);

  // Listas derivadas para filtros
  const filteredCompanies = useMemo(() => {
    if (user?.role === 'admin' && !companyId) return companies;
    if (user?.role === 'admin' && companyId) return companies.filter(c => c.id === companyId);
    if (user?.role === 'company_user' && user.company_id) return companies.filter(c => c.id === user.company_id);
    return [];
  }, [user, companyId, companies]);

  const filteredProjects = useMemo(() => {
    if (user?.role === 'admin' && !companyId) {
      return selectedCompany === 'all' ? projects : projects.filter((p: any) => p.company_id === selectedCompany);
    } else if (user?.role === 'admin' && companyId) {
      return projects.filter((p: any) => p.company_id === companyId);
    } else if (user?.role === 'company_user' && user.company_id) {
      return projects.filter((p: any) => p.company_id === user.company_id);
    }
    return [];
  }, [user, selectedCompany, companyId, projects]);

  // Filtros
  const filteredDocuments = useMemo(() => {
    return unified.filter(doc => {
      const project = projects.find((p: any) => p.id === doc.projectId);
      const company = companies.find((c: any) => c.id === project?.company_id);

      if (searchTerm && !doc.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (selectedType !== 'all' && doc.type !== selectedType) return false;
      if (selectedStatus !== 'all' && doc.status !== selectedStatus) return false;
      if (selectedCategory !== 'all' && doc.category !== selectedCategory) return false;
      if (user?.role === 'admin' && !companyId && selectedCompany !== 'all' && company?.id !== selectedCompany) return false;
      if (selectedProject !== 'all' && doc.projectId !== selectedProject) return false;
      return true;
    });
  }, [unified, searchTerm, selectedType, selectedStatus, selectedCategory, selectedCompany, selectedProject, user, companyId, projects, companies]);

  const handleViewDocument = (doc: UnifiedItem) => {
    setSelectedDocument({ ...doc, raw: doc.raw });
    setShowDocumentModal(true);
  };

  const handleDownloadDocument = async (doc: UnifiedItem) => {
    try {
      if (!doc.filePath) {
        alert('No hay versión activa para descargar');
        return;
      }
      const { success, url, error } = await StorageService.getDownloadUrl(doc.bucket, doc.filePath);
      if (!success || !url) {
        alert(`Error obteniendo enlace de descarga: ${error}`);
        return;
      }
      window.open(url, '_blank');
    } catch (e: any) {
      alert(`Error al descargar: ${e.message || e}`);
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
      const project = projects.find((p: any) => p.id === doc.projectId);
      const company = companies.find((c: any) => c.id === project?.company_id);
      return [
        doc.name,
        doc.type === 'document' ? 'Documento' : 'Registro',
        doc.category,
        getStatusText(doc.status),
        company?.razon_social || 'Sin empresa',
        project?.sede || 'Sin proyecto',
        doc.code,
        doc.version,
        doc.createdDate || '',
        doc.expirationDate || ''
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

    const project = projects.find((p: any) => p.id === selectedDocument.projectId);
    const company = companies.find((c: any) => c.id === project?.company_id);
    const category = categories.find((cat: any) => cat.name === selectedDocument.category);

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
                <h2 className="text-xl font-semibold text-gray-900">{selectedDocument.name}</h2>
                <p className="text-sm text-gray-600">
                  {selectedDocument.type === 'document' ? 'Documento' : 'Formato de Registro'} - {category?.name}
                </p>
              </div>
            </div>
            <button onClick={() => setShowDocumentModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-gray-600">Empresa:</span><span className="font-medium">{company?.razon_social}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Proyecto:</span><span className="font-medium">{project?.sede}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Código:</span><span className="font-mono text-sm">{selectedDocument.code}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Versión:</span><span className="font-medium">v{selectedDocument.version}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Estado:</span><div className="flex items-center space-x-2">{getStatusIcon(selectedDocument.status)}<span className="font-medium">{getStatusText(selectedDocument.status)}</span></div></div>
                  {selectedDocument.type === 'record' && selectedDocument.recordCount !== undefined && (
                    <div className="flex justify-between"><span className="text-gray-600">Registros:</span><span className="font-medium text-purple-600">{selectedDocument.recordCount}</span></div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas</h3>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-gray-600">Creación:</span><span className="font-medium">{selectedDocument.createdDate || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Vencimiento:</span><span className="font-medium">{selectedDocument.expirationDate || '-'}</span></div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Proyecto</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center space-x-3"><Building className="w-5 h-5 text-gray-400" /><span className="text-gray-700">{company?.razon_social}</span></div>
                <div className="flex items-center space-x-3"><MapPin className="w-5 h-5 text-gray-400" /><span className="text-gray-700">{project?.sede}</span></div>
                <div className="flex items-center space-x-3"><Calendar className="w-5 h-5 text-gray-400" /><span className="text-gray-700">Inicio: {project?.fecha_inicio}</span></div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button onClick={() => handleDownloadDocument(selectedDocument)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
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
                ? `Vista de ${companies.find(c => c.id === companyId)?.razon_social || ''}`
                : user?.role === 'admin' ? 'Vista completa del sistema' : `Vista de ${companies.find(c => c.id === user?.company_id)?.razon_social || ''}`}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Búsqueda */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Buscar documentos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button onClick={exportToCSV} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select value={selectedType} onChange={(e) => setSelectedType(e.target.value as any)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">Todos</option>
                    <option value="document">Documentos</option>
                    <option value="record">Registros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">Todos</option>
                    <option value="approved">Aprobado</option>
                    <option value="pending_review">En Revisión</option>
                    <option value="draft">Borrador</option>
                    <option value="expired">Vencido</option>
                    <option value="rejected">Rechazado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">Todas</option>
                    {categories.map((category: any) => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>
                {user?.role === 'admin' && !companyId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                    <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="all">Todas</option>
                      {filteredCompanies.map((company: any) => (
                        <option key={company.id} value={company.id}>{company.razon_social}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto</label>
                  <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">Todos</option>
                    {filteredProjects.map((project: any) => (
                      <option key={project.id} value={project.id}>{project.sede}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={resetFilters} className="px-4 py-2 text-gray-600 hover:text-gray-800">Limpiar Filtros</button>
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        <div className="p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">{loading ? 'Cargando…' : `Mostrando ${filteredDocuments.length} de ${unified.length} elementos`}</p>
          </div>
        </div>

        {/* Lista */}
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
                {filteredDocuments.map((doc) => {
                  const project = projects.find((p: any) => p.id === doc.projectId);
                  const company = companies.find((c: any) => c.id === project?.company_id);
                  return (
                    <tr key={`${doc.type}_${doc.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${doc.type === 'document' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                            {doc.type === 'document' ? (
                              <FileText className="w-4 h-4 text-blue-600" />
                            ) : (
                              <FolderOpen className="w-4 h-4 text-purple-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <p className="text-xs text-gray-500">{doc.fileName || '—'}</p>
                            {doc.type === 'record' && (
                              <p className="text-xs text-purple-600">{doc.recordCount || 0} registros</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${doc.type === 'document' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{doc.type === 'document' ? 'Documento' : 'Registro'}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{doc.category}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">{getStatusIcon(doc.status)}<span className="text-gray-700">{getStatusText(doc.status)}</span></div>
                      </td>
                      {user?.role === 'admin' && !companyId && (
                        <td className="px-6 py-4 text-gray-600">{company?.razon_social}</td>
                      )}
                      <td className="px-6 py-4 text-gray-600">{project?.sede}</td>
                      <td className="px-6 py-4"><span className="font-mono text-sm text-gray-900">{doc.code}</span></td>
                      <td className="px-6 py-4"><span className="font-mono text-sm text-gray-900">v{doc.version}</span></td>
                      <td className="px-6 py-4"><div className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-gray-400" /><span className="text-gray-600">{doc.expirationDate || '—'}</span></div></td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button onClick={() => handleViewDocument(doc)} className="text-blue-600 hover:text-blue-800 p-1" title="Ver">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDownloadDocument(doc)} className="text-green-600 hover:text-green-800 p-1" title="Descargar">
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
          {!loading && filteredDocuments.length === 0 && (
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