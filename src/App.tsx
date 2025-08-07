import React, { useState, useEffect } from 'react';
import { FileText, Bell, LogOut, BarChart3, Building, Users, FolderOpen, Settings, ChevronRight, List, Calendar } from 'lucide-react';
import { AuthProvider, useAuth } from './components/AuthContext';
import LoginForm from './components/LoginForm';
import NotificationCenter from './components/NotificationCenter';
import CompanyManagement from './components/CompanyManagement';
import ProjectManagement from './components/ProjectManagement';
import DocumentManagement from './components/DocumentManagement';
import ClientPortal from './components/ClientPortal';
import MasterDocumentList from './components/MasterDocumentList';
import ConfigurationPanel from './components/ConfigurationPanel';
import AnalyticsCharts from './components/AnalyticsCharts';
import Footer from './components/Footer';
import { supabase } from './lib/supabase';

// Componente para documentos por vencer
const ExpiringDocumentsList = ({ onNavigateToDocument, companies, projects, documents, recordFormats }: { 
  onNavigateToDocument: (type: string, projectId: string) => void;
  companies: any[];
  projects: any[];
  documents: any[];
  recordFormats: any[];
}) => {
  const today = new Date();
  const thirtyDaysLater = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Documentos por vencer
  const expiringDocuments = documents.filter(doc => {
    const expirationDate = new Date(doc.fecha_vencimiento);
    return expirationDate >= today && expirationDate <= thirtyDaysLater;
  }).map(doc => ({
    ...doc,
    type: 'document' as const,
    itemName: doc.nombre
  }));

  // Registros por vencer
  const expiringRecords = recordFormats.filter(record => {
    const expirationDate = new Date(record.fecha_vencimiento);
    return expirationDate >= today && expirationDate <= thirtyDaysLater;
  }).map(record => ({
    ...record,
    type: 'record' as const,
    itemName: record.nombre
  }));

  const allExpiringItems = [...expiringDocuments, ...expiringRecords].sort((a, b) => 
    new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime()
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
            <th className="px-4 py-2 font-medium text-gray-900">Empresa</th>
            <th className="px-4 py-2 font-medium text-gray-900">Proyecto</th>
            <th className="px-4 py-2 font-medium text-gray-900">Vencimiento</th>
            <th className="px-4 py-2 font-medium text-gray-900">Días Restantes</th>
            <th className="px-4 py-2 font-medium text-gray-900">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {allExpiringItems.map(item => {
            const project = projects.find(p => p.id === item.project_id);
            const company = companies.find(c => c.id === project?.company_id);
            const daysLeft = getDaysUntilExpiration(item.fecha_vencimiento);
            
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
                <td className="px-4 py-3 text-gray-600">{company?.razon_social}</td>
                <td className="px-4 py-3 text-gray-600">{project?.descripcion}</td>
                <td className="px-4 py-3 text-gray-600">{item.fecha_vencimiento}</td>
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
                    onClick={() => onNavigateToDocument(item.type, item.project_id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Gestionar
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

// Componente para listado de empresas por actividad
const CompanyActivityList = ({ onSelectCompany, companies, projects, documents, recordFormats, recordEntries }: { 
  onSelectCompany: (companyId: string) => void;
  companies: any[];
  projects: any[];
  documents: any[];
  recordFormats: any[];
  recordEntries: any[];
}) => {
  const [sortBy, setSortBy] = useState<'activity' | 'documents' | 'recordFormats' | 'recordEntries'>('activity');

  const getCompanyActivity = (companyId: string) => {
    const companyProjects = projects.filter(p => p.company_id === companyId);
    const companyDocs = documents.filter(doc => {
      const project = companyProjects.find(p => p.id === doc.project_id);
      return !!project;
    });
    const companyRecordFormats = recordFormats.filter(format => {
      const project = companyProjects.find(p => p.id === format.project_id);
      return !!project;
    });
    const companyRecordEntries = recordEntries.filter(entry => {
      const format = companyRecordFormats.find(f => f.id === entry.record_format_id);
      return !!format;
    });

    // Calcular actividad basada en documentos recientes
    const recentActivity = companyDocs.filter(doc => {
      const createdDate = new Date(doc.fecha_creacion);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return createdDate >= thirtyDaysAgo;
    }).length;

    return {
      companyId,
      projects: companyProjects.length,
      activeProjects: companyProjects.filter(p => p.isActive).length,
      documents: companyDocs.length,
      recordFormats: companyRecordFormats.length,
      recordEntries: companyRecordEntries.length,
      recentActivity,
      lastActivityDate: companyDocs.length > 0 ? 
        Math.max(...companyDocs.map(doc => new Date(doc.fecha_creacion).getTime())) : 0
    };
  };

  const companiesWithActivity = companies.map(company => ({
    ...company,
    activity: getCompanyActivity(company.id)
  }));

  const sortedCompanies = [...companiesWithActivity].sort((a, b) => {
    switch (sortBy) {
      case 'activity':
        return b.activity.lastActivityDate - a.activity.lastActivityDate;
      case 'documents':
        return b.activity.documents - a.activity.documents;
      case 'recordFormats':
        return b.activity.recordFormats - a.activity.recordFormats;
      case 'recordEntries':
        return b.activity.recordEntries - a.activity.recordEntries;
      default:
        return b.activity.lastActivityDate - a.activity.lastActivityDate;
    }
  });

  const formatLastActivity = (timestamp: number) => {
    if (timestamp === 0) return 'Sin actividad';
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return `Hace ${Math.floor(diffDays / 30)} meses`;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Empresas por Actividad</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          <option value="activity">Actividad Reciente</option>
          <option value="documents">Mayor N° Documentos</option>
          <option value="recordFormats">Mayor N° Registros Base</option>
          <option value="recordEntries">Mayor N° Registros Llenos</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-medium text-gray-900">#</th>
                <th className="px-6 py-3 font-medium text-gray-900">Empresa</th>
                <th className="px-6 py-3 font-medium text-gray-900">Estado</th>
                <th className="px-6 py-3 font-medium text-gray-900">Proyectos</th>
                <th className="px-6 py-3 font-medium text-gray-900">Documentos</th>
                <th className="px-6 py-3 font-medium text-gray-900">Reg. Base</th>
                <th className="px-6 py-3 font-medium text-gray-900">Reg. Llenos</th>
                <th className="px-6 py-3 font-medium text-gray-900">Última Actividad</th>
                <th className="px-6 py-3 font-medium text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedCompanies.map((company, index) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-600">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{company.razon_social}</p>
                        <p className="text-xs text-gray-500">RUC: {company.ruc}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      company.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {company.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-center">
                      <p className="font-bold text-green-900">{company.activity.activeProjects}</p>
                      <p className="text-xs text-gray-500">de {company.activity.projects}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-center">
                      <p className="font-bold text-blue-900">{company.activity.documents}</p>
                      <p className="text-xs text-blue-600">docs</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-center">
                      <p className="font-bold text-purple-900">{company.activity.recordFormats}</p>
                      <p className="text-xs text-purple-600">formatos</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-center">
                      <p className="font-bold text-orange-900">{company.activity.recordEntries}</p>
                      <p className="text-xs text-orange-600">registros</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatLastActivity(company.activity.lastActivityDate)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onSelectCompany(company.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Ver Empresa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function AppContent() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'companies' | 'projects' | 'documents' | 'configuration'>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [showMasterList, setShowMasterList] = useState(false);
  const [masterListCompanyId, setMasterListCompanyId] = useState<string>('');
  
  // Estados para datos reales de Supabase
  const [companies, setCompanies] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [recordFormats, setRecordFormats] = useState<any[]>([]);
  const [recordEntries, setRecordEntries] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos reales de Supabase
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando todos los datos de Supabase...');

      const [
        { data: companiesData },
        { data: projectsData },
        { data: documentsData },
        { data: recordFormatsData },
        { data: recordEntriesData },
        { data: usersData }
      ] = await Promise.all([
        supabase.from('companies').select('*').eq('is_active', true),
        supabase.from('projects').select('*').eq('is_active', true),
        supabase.from('documents').select('*'),
        supabase.from('record_formats').select('*'),
        supabase.from('record_entries').select('*'),
        supabase.from('users').select('*').eq('is_active', true)
      ]);

      console.log('✅ Datos cargados:', {
        companies: companiesData?.length || 0,
        projects: projectsData?.length || 0,
        documents: documentsData?.length || 0,
        recordFormats: recordFormatsData?.length || 0,
        recordEntries: recordEntriesData?.length || 0,
        users: usersData?.length || 0
      });

      setCompanies(companiesData || []);
      setProjects(projectsData || []);
      setDocuments(documentsData || []);
      setRecordFormats(recordFormatsData || []);
      setRecordEntries(recordEntriesData || []);
      setUsers(usersData || []);
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Si es usuario de empresa, configurar navegación específica
  if (user?.role === 'company_user') {
    // Configurar la empresa seleccionada para usuarios de empresa
    useEffect(() => {
      if (user?.companyId && !selectedCompanyId) {
        setSelectedCompanyId(user.companyId);
      }
    }, [user?.companyId]);
  }

  // Vista de administrador
  const DashboardContent = () => (
    <div className="space-y-6">
      {/* Métricas principales del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Empresas</p>
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Proyectos Activos</p>
              <p className="text-2xl font-bold text-gray-900">{projects.filter(p => p.is_active).length}</p>
            </div>
            <Building className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Documentos Sistema</p>
              <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Gráficos de analíticas */}
      <AnalyticsCharts user={user} companies={companies} projects={projects} documents={documents} recordFormats={recordFormats} recordEntries={recordEntries} />

      {/* Documentos y Registros por vencer */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Documentos y Registros por Vencer (Próximos 30 días)
        </h3>
        <ExpiringDocumentsList 
          onNavigateToDocument={(type, projectId) => {
            setSelectedProjectId(projectId);
            setActiveTab('documents');
          }}
          companies={companies}
          projects={projects}
          documents={documents}
          recordFormats={recordFormats}
        />
      </div>

      {/* Listado de empresas por actividad */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <CompanyActivityList 
          onSelectCompany={(companyId) => {
            setSelectedCompanyId(companyId);
            setActiveTab('companies');
          }}
          companies={companies}
          projects={projects}
          documents={documents}
          recordFormats={recordFormats}
          recordEntries={recordEntries}
        />
      </div>

    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del sistema...</p>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'dashboard': return <DashboardContent />;
      case 'companies': return (
        <CompanyManagement 
          onSelectCompany={(companyId) => {
            setSelectedCompanyId(companyId);
            setActiveTab('projects');
          }}
          onViewMasterList={(companyId) => {
            setMasterListCompanyId(companyId);
            setShowMasterList(true);
          }}
          onDataChange={loadAllData}
        />
      );
      case 'projects': return (
        <ProjectManagement 
          selectedCompanyId={selectedCompanyId}
          onSelectProject={(projectId) => {
            console.log('🎯 Navegando a documentos para proyecto:', projectId);
            setSelectedProjectId(projectId);
            setActiveTab('documents');
          }} 
          onDataChange={() => loadAllData()}
        />
      );
      case 'documents': return (
        <DocumentManagement 
          selectedProjectId={selectedProjectId}
          users={users}
          userRole={user?.role}
          canEdit={user?.role === 'admin'}
          canDelete={user?.role === 'admin'}
          canUpload={user?.role === 'admin'}
          canView={true} // Todos los usuarios autenticados pueden ver documentos
          canDownload={true} // Todos los usuarios autenticados pueden descargar documentos
        />
      );
      case 'configuration': return (
        <ConfigurationPanel 
          onClose={() => setActiveTab('dashboard')}
          onDataChange={loadAllData}
        />
      );
      default: return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo horizontal.png" 
                alt="GoodPro Logo" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">GoodPro</h1>
                <p className="text-sm text-gray-600">Gestión de Documentación en Seguridad y Salud en el Trabajo</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowNotifications(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-600">
                    {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 mb-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            ...(user?.role === 'admin' ? [
              { id: 'companies', label: 'Empresas', icon: Users },
              { id: 'configuration', label: 'Configuración', icon: Settings },
              { 
                id: 'master-list', 
                label: 'Lista Maestra', 
                icon: List,
                action: () => setShowMasterList(true)
              }
            ] : [
              { id: 'projects', label: 'Proyectos', icon: FolderOpen }
            ])
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => tab.action ? tab.action() : setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                (activeTab === tab.id || (tab.id === 'master-list' && showMasterList))
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {renderContent()}
      </div>

      <Footer />

      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
      
      {showMasterList && (
        <MasterDocumentList 
          onClose={() => {
            setShowMasterList(false);
            setMasterListCompanyId('');
          }}
          companyId={masterListCompanyId}
        />
      )}
      
      {showConfiguration && (
        <ConfigurationPanel 
          onClose={() => setShowConfiguration(false)}
        />
      )}
    </div>
  );
}

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/logo horizontal.png" 
            alt="GoodPro Logo" 
            className="h-16 w-auto mb-4 mx-auto"
          />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <AppContent />;
}

function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWrapper;