import React, { useState, useEffect } from 'react';
import { Building, Plus, Edit, Eye, Users, FolderOpen, Calendar, Phone, Mail, X, User, Trash2, List } from 'lucide-react';
import { Company, Project, ContactPerson } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { DatabaseService } from '../services/database';

interface CompanyManagementProps {
  onSelectCompany: (companyId: string) => void;
  onViewMasterList?: (companyId: string) => void;
}

// Modal extraído como componente independiente
const NewCompanyModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingCompany,
  formData,
  setFormData
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingCompany: Company | null;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingCompany ? 'Editar Empresa' : 'Nueva Empresa'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razón Social *
              </label>
              <input
                type="text"
                value={formData.razonSocial}
                onChange={(e) => setFormData(prev => ({ ...prev, razonSocial: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Constructora ABC S.A.C."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RUC *
              </label>
              <input
                type="text"
                value={formData.ruc}
                onChange={(e) => setFormData(prev => ({ ...prev, ruc: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                pattern="[0-9]{11}"
                placeholder="20123456789"
                required
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-700">
                    Una vez creada la empresa, ve a <strong>Configuración → Usuarios</strong> para crear los usuarios que tendrán acceso al sistema.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingCompany ? 'Actualizar' : 'Crear'} Empresa
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const CompanyManagement: React.FC<CompanyManagementProps> = ({ onSelectCompany, onViewMasterList }) => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [newCompanyForm, setNewCompanyForm] = useState({
    razonSocial: '',
    ruc: ''
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [companiesData, projectsData, usersData] = await Promise.all([
        DatabaseService.getCompanies(),
        DatabaseService.getAllProjects(),
        supabase.from('users').select('*').eq('is_active', true)
      ]);
      
      console.log('📊 Datos cargados:', {
        companies: companiesData?.length || 0,
        projects: projectsData?.length || 0,
        users: usersData?.data?.length || 0
      });
      
      // Convertir formato de base de datos a frontend
      const formattedCompanies = companiesData.map(company => {
        // Encontrar usuarios de esta empresa
        const companyUsers = (usersData?.data || []).filter(user => user.company_id === company.id);
        
        // Convertir usuarios a formato contactPerson
        const contactPersons = companyUsers.map(user => {
          const nameParts = user.name.split(' ');
          const nombres = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
          const apellidos = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');
          
          return {
            id: user.id,
            nombres: nombres,
            apellidos: apellidos,
            email: user.email,
            telefono: user.telefono || ''
          };
        });

        return {
        id: company.id,
        razonSocial: company.razon_social,
        ruc: company.ruc,
        contactPersons: contactPersons,
        createdAt: company.created_at,
        isActive: company.is_active
      };
      });
      
      const formattedProjects = projectsData.map(project => ({
        id: project.id,
        sede: project.sede,
        descripcion: project.descripcion,
        companyId: project.company_id,
        fechaInicio: project.fecha_inicio,
        fechaFin: project.fecha_fin,
        status: project.status,
        contactPersons: [], // Se cargarán por separado
        createdAt: project.created_at,
        isActive: project.is_active
      }));
      
      setCompanies(formattedCompanies);
      setProjects(formattedProjects);
      setUsers(usersData?.data || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error cargando datos de empresas');
    } finally {
      setLoading(false);
    }
  };

  const getCompanyProjects = (companyId: string) => {
    return projects.filter(project => project.companyId === companyId);
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCompany) {
        // Editar empresa existente
        await DatabaseService.updateCompany(editingCompany.id, {
          razon_social: newCompanyForm.razonSocial,
          ruc: newCompanyForm.ruc
        });
      } else {
        // Crear nueva empresa
        await DatabaseService.createCompany({
          razon_social: newCompanyForm.razonSocial,
          ruc: newCompanyForm.ruc
        });
      }
      
      // Recargar datos
      await loadData();
      alert(editingCompany ? 'Empresa actualizada correctamente' : 'Empresa creada correctamente');
    } catch (error) {
      console.error('Error guardando empresa:', error);
      alert('Error guardando empresa');
    }
    
    resetForm();
  };

  const resetForm = () => {
    setNewCompanyForm({
      razonSocial: '',
      ruc: ''
    });
    setEditingCompany(null);
    setShowNewCompanyModal(false);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setNewCompanyForm({
      razonSocial: company.razonSocial,
      ruc: company.ruc
    });
    setShowNewCompanyModal(true);
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta empresa? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await DatabaseService.updateCompany(companyId, { is_active: false });
      await loadData();
      alert('Empresa eliminada correctamente');
    } catch (error) {
      console.error('Error eliminando empresa:', error);
      alert('Error eliminando empresa');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando empresas...</p>
        </div>
      </div>
    );
  }

  // CAMBIOS

  const CompanyModal = () => {
    if (!selectedCompany) return null;
    
    const companyProjects = getCompanyProjects(selectedCompany.id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedCompany.razonSocial}</h2>
                <p className="text-sm text-gray-600">RUC: {selectedCompany.ruc}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedCompany(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Información de la Empresa</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Building className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{selectedCompany.razonSocial}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Registrado: {selectedCompany.createdAt}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Estadísticas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600">Proyectos Activos</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {companyProjects.filter(p => p.isActive).length}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Total Proyectos</p>
                    <p className="text-2xl font-bold text-green-900">{companyProjects.length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personas de Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCompany.contactPersons.map(contact => (
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

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Proyectos</h3>
                <button 
                  onClick={() => onSelectCompany(selectedCompany.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Gestionar Proyectos</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {companyProjects.map(project => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <FolderOpen className="w-5 h-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">{project.sede}</h4>
                          <p className="text-sm text-gray-600">{project.descripcion}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {project.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Inicio:</span>
                        <span>{project.fechaInicio}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Empresas</h2>
          <p className="text-gray-600">Administra las empresas y sus proyectos</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowNewCompanyModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Empresa</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(company => {
          const companyProjects = getCompanyProjects(company.id);
          const activeProjects = companyProjects.filter(p => p.isActive).length;
          
          return (
            <div key={company.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{company.razonSocial}</h3>
                  <p className="text-sm text-gray-600">RUC: {company.ruc}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${company.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Contactos:</p>
                  {company.contactPersons.slice(0, 2).map(contact => (
                    <p key={contact.id} className="text-xs">{contact.nombres} {contact.apellidos}</p>
                  ))}
                  {company.contactPersons.length > 2 && (
                    <p className="text-xs">+{company.contactPersons.length - 2} más</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{companyProjects.length}</p>
                  <p className="text-xs text-gray-600">Total Proyectos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{activeProjects}</p>
                  <p className="text-xs text-gray-600">Activos</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <button 
                  onClick={() => setSelectedCompany(company)}
                  className="bg-blue-50 text-blue-600 py-2 px-1 rounded-lg text-xs hover:bg-blue-100 transition-colors flex items-center justify-center"
                  title="Ver detalles"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleEditCompany(company)}
                  className="bg-yellow-50 text-yellow-600 py-2 px-1 rounded-lg text-xs hover:bg-yellow-100 transition-colors flex items-center justify-center"
                  title="Editar empresa"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onSelectCompany(company.id)}
                  className="bg-green-50 text-green-600 py-2 px-1 rounded-lg text-xs hover:bg-green-100 transition-colors flex items-center justify-center"
                  title="Gestionar proyectos"
                >
                  <FolderOpen className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1 mt-2">
                <button 
                  onClick={() => onViewMasterList?.(company.id)}
                  className="bg-purple-50 text-purple-600 py-2 px-1 rounded-lg text-xs hover:bg-purple-100 transition-colors flex items-center justify-center space-x-1"
                  title="Ver lista maestra de documentos"
                >
                  <List className="w-4 h-4" />
                  <span className="text-xs">Lista Maestra</span>
                </button>
                <button 
                  onClick={() => handleDeleteCompany(company.id)}
                  className="bg-red-50 text-red-600 py-2 px-1 rounded-lg text-xs hover:bg-red-100 transition-colors flex items-center justify-center space-x-1"
                  title="Eliminar empresa"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-xs">Eliminar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedCompany && <CompanyModal />}
      <NewCompanyModal
        isOpen={showNewCompanyModal}
        onClose={resetForm}
        onSubmit={handleCreateCompany}
        editingCompany={editingCompany}
        formData={newCompanyForm}
        setFormData={setNewCompanyForm}
      />
    </div>
  );
};

export default CompanyManagement;