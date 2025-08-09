import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, Calendar, Building, FileText, X, MapPin, Edit, Trash2, User, Mail, Phone, Eye, EyeOff } from 'lucide-react';
import { Project, Company, ContactPerson } from '../types';
import { supabase } from '../lib/supabase';
import { DatabaseService } from '../services/database';
import { useAuth } from './AuthContext';

interface ProjectManagementProps {
  selectedCompanyId: string;
  onSelectProject: (projectId: string) => void;
  onDataChange: () => void;
}

// Modal extraído como componente independiente
const NewProjectModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingProject,
  formData,
  setFormData,
  selectedCompanyId,
  selectedContactIds,
  setSelectedContactIds,
  availableUsers
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingProject: Project | null;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  selectedCompanyId: string;
  selectedContactIds: string[];
  setSelectedContactIds: React.Dispatch<React.SetStateAction<string[]>>;
  availableUsers: any[];
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
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
                Sede *
              </label>
              <input
                type="text"
                value={formData.sede}
                onChange={(e) => setFormData(prev => ({ ...prev, sede: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Lima - San Isidro"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del Proyecto *
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Describe el proyecto en detalle..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio del Proyecto *
              </label>
              <input
                type="date"
                value={formData.fechaInicio}
                onChange={(e) => setFormData(prev => ({ ...prev, fechaInicio: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personas de Contacto del Proyecto *
              </label>
              
              {availableUsers.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Selecciona los usuarios de la empresa que serán contactos del proyecto:
                  </p>
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
                    {availableUsers.map(user => (
                      <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          id={`user-${user.id}`}
                          checked={selectedContactIds.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedContactIds(prev => [...prev, user.id]);
                            } else {
                              setSelectedContactIds(prev => prev.filter(id => id !== user.id));
                            }
                          }}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <User className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          {user.telefono && (
                            <p className="text-xs text-gray-500">{user.telefono}</p>
                          )}
                        </div>
                        {selectedContactIds.includes(user.id) && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Seleccionado
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  {selectedContactIds.length === 0 && (
                    <p className="text-sm text-red-600">
                      Debes seleccionar al menos un contacto para el proyecto
                    </p>
                  )}
                  {selectedContactIds.length > 0 && (
                    <p className="text-sm text-green-600">
                      {selectedContactIds.length} contacto{selectedContactIds.length > 1 ? 's' : ''} seleccionado{selectedContactIds.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">No hay usuarios disponibles en esta empresa</p>
                  <p className="text-sm text-gray-500">
                    Primero debes crear usuarios para esta empresa en la sección de Configuración
                  </p>
                </div>
              )}
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
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                {editingProject ? 'Actualizar' : 'Crear'} Proyecto
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ProjectManagement: React.FC<ProjectManagementProps> = ({ selectedCompanyId, onSelectProject, onDataChange }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [projects, setProjects] = useState<Project[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [projectContacts, setProjectContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [newProjectForm, setNewProjectForm] = useState({
    sede: '',
    descripcion: '',
    fechaInicio: ''
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, [selectedCompanyId]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 ProjectManagement - Cargando datos...');
      console.log('🏢 Empresa seleccionada ID:', selectedCompanyId);

      // Proyectos visibles según permisos del usuario
      const projectsVisible = await DatabaseService.getProjectsVisibleToUser({
        role: (user?.role || 'company_user') as 'admin' | 'company_user',
        userId: user?.id || '',
        companyId: selectedCompanyId,
        canViewAllCompanyProjects: user?.permissions?.canViewAllCompanyProjects,
      });

      const [companiesData, usersData, contactsData] = await Promise.all([
        DatabaseService.getCompanies(),
        supabase.from('users').select('*').eq('is_active', true).order('name'),
        supabase.from('project_contacts').select(`
          *,
          user:users(id, name, email, telefono),
          project:projects(id, sede)
        `).order('created_at')
      ]);

      const projectsData = projectsVisible || [];

      console.log('📊 Datos cargados:', {
        projects: projectsData?.length || 0,
        companies: companiesData?.length || 0,
        users: usersData?.data?.length || 0,
        contacts: contactsData?.data?.length || 0
      });

      console.log('📋 Proyectos de BD:', projectsData?.map(p => ({
        id: p.id.substring(0, 8),
        sede: p.sede,
        company_id: p.company_id?.substring(0, 8),
        is_active: p.is_active
      })));

      // Procesar project_contacts para crear contactPersons
      const processedProjects = (projectsData || []).map(project => {
        const projectContactsForProject = (contactsData?.data || []).filter(
          contact => contact.project_id === project.id
        );
        const contactPersons = projectContactsForProject.map(contact => {
          const u = contact.user;
          if (u) {
            const nameParts = u.name.split(' ');
            const nombres = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
            const apellidos = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');
            return {
              id: u.id,
              nombres,
              apellidos,
              email: u.email,
              telefono: u.telefono || ''
            };
          }
          return null;
        }).filter(contact => contact !== null);

        return {
          id: project.id,
          sede: project.sede,
          descripcion: project.descripcion,
          companyId: project.company_id,
          fechaInicio: project.fecha_inicio,
          fechaFin: project.fecha_fin,
          status: project.status,
          contactPersons: contactPersons as any[],
          createdAt: project.created_at,
          isActive: project.is_active
        };
      });

      const formattedCompanies = (companiesData || []).map(company => ({
        id: company.id,
        razonSocial: company.razon_social,
        ruc: company.ruc,
        contactPersons: [],
        createdAt: company.created_at,
        isActive: company.is_active
      }));

      console.log('🏢 Proyectos procesados para empresa:', selectedCompanyId);
      console.log('📋 Total proyectos:', processedProjects.length);

      setProjects(processedProjects);
      setCompanies(formattedCompanies);
      setUsers(usersData?.data || []);
      setProjectContacts(contactsData?.data || []);
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      alert(`Error cargando datos: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  // Obtener usuarios disponibles de la empresa seleccionada
  const availableUsers = users.filter(dbUser => 
    dbUser.role === 'company_user' && dbUser.company_id === selectedCompanyId && dbUser.is_active
  );

  console.log('👥 Usuarios disponibles para empresa', selectedCompanyId, ':', availableUsers);

  const filteredProjects = projects.filter(project => project.companyId === selectedCompanyId);
  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedContactIds.length === 0) {
      alert('Debes seleccionar al menos un contacto para el proyecto');
      return;
    }

    try {
      console.log('➕ Creando nuevo proyecto...');
      setLoading(true);
      
      // Crear proyecto usando DatabaseService
      const newProject = await DatabaseService.createProject({
        sede: newProjectForm.sede,
        descripcion: newProjectForm.descripcion,
        company_id: selectedCompanyId,
        fecha_inicio: newProjectForm.fechaInicio
      });

      console.log('✅ Proyecto creado con ID:', newProject.id);

      // Crear contactos del proyecto
      const contactInserts = selectedContactIds.map(userId => ({
        project_id: newProject.id,
        user_id: userId
      }));

      const { error: contactsError } = await supabase
        .from('project_contacts')
        .insert(contactInserts);

      if (contactsError) {
        console.error('❌ Error creando contactos:', contactsError);
        alert(`Error asignando contactos: ${contactsError.message}`);
      }

      alert('Proyecto creado correctamente');
      await loadData();
      onDataChange?.(); // Actualizar datos en componente padre
      resetForm();
    } catch (error) {
      console.error('❌ Error general creando proyecto:', error);
      alert(`Error creando proyecto: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este proyecto? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setLoading(true);
      console.log('🗑️ Marcando proyecto como inactivo ID:', projectId.substring(0, 8));
      
      // 1. Eliminar contactos del proyecto primero (por foreign key)
      console.log('🗑️ Eliminando contactos del proyecto...');
      const { error: contactsError } = await supabase
        .from('project_contacts')
        .delete()
        .eq('project_id', projectId);

      if (contactsError) {
        console.error('❌ Error eliminando contactos:', contactsError);
        alert(`Error eliminando contactos: ${contactsError.message}`);
        return;
      }

      // 2. Eliminar el proyecto físicamente de la base de datos
      console.log('🗑️ Eliminando proyecto de la base de datos...');
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (projectError) {
        console.error('❌ Error eliminando proyecto:', projectError);
        alert(`Error eliminando proyecto: ${projectError.message}`);
        return;
      }

      console.log('✅ Proyecto ELIMINADO FÍSICAMENTE de la BD');
      
      // Recargar datos
      console.log('🔄 Recargando datos después de eliminación...');
      await loadData();
      onDataChange();
      
      console.log('✅ Datos recargados - proyecto completamente eliminado');
      alert('Proyecto eliminado correctamente');
    } catch (error) {
      console.error('❌ Error general eliminando proyecto:', error);
      alert(`Error eliminando proyecto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProject = async (project: Project) => {
    setEditingProject(project);
    setNewProjectForm({
      sede: project.sede,
      descripcion: project.descripcion,
      fechaInicio: project.fechaInicio
    });
    
    // Obtener contactos del proyecto desde project_contacts
    const contactUserIds = project.contactPersons.map(contact => contact.id);
    setSelectedContactIds(contactUserIds);
    setShowNewProjectModal(true);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProject) return;
    
    if (selectedContactIds.length === 0) {
      alert('Debes seleccionar al menos un contacto para el proyecto');
      return;
    }

    try {
      console.log('✏️ Actualizando proyecto:', editingProject.id);
      
      // Actualizar proyecto en Supabase
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          sede: newProjectForm.sede,
          descripcion: newProjectForm.descripcion,
          fecha_inicio: newProjectForm.fechaInicio
        })
        .eq('id', editingProject.id);

      if (projectError) {
        console.error('❌ Error actualizando proyecto:', projectError);
        alert(`Error actualizando proyecto: ${projectError.message}`);
        return;
      }

      // Eliminar contactos existentes
      await supabase
        .from('project_contacts')
        .delete()
        .eq('project_id', editingProject.id);

      // Agregar nuevos contactos
      const contactInserts = selectedContactIds.map(userId => ({
        project_id: editingProject.id,
        user_id: userId
      }));

      const { error: contactsError } = await supabase
        .from('project_contacts')
        .insert(contactInserts);

      if (contactsError) {
        console.error('❌ Error actualizando contactos:', contactsError);
        alert(`Error actualizando contactos: ${contactsError.message}`);
        return;
      }

      console.log('✅ Proyecto actualizado correctamente');
      alert('Proyecto actualizado correctamente');
      
      await loadData();
      onDataChange();
      console.log('✅ Datos recargados después de crear');
      resetForm();
    } catch (error) {
      console.error('❌ Error general actualizando proyecto:', error);
      alert('Error actualizando proyecto');
    }
  };

  const resetForm = () => {
    setNewProjectForm({
      sede: '',
      descripcion: '',
      fechaInicio: ''
    });
    setSelectedContactIds([]);
    setEditingProject(null);
    setShowNewProjectModal(false);
  };

  const handleToggleProjectStatus = async (projectId: string) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;
      
      const newStatus = !project.isActive;
      
      await DatabaseService.updateProject(projectId, { is_active: newStatus });

      alert(`Proyecto ${newStatus ? 'activado' : 'desactivado'} correctamente`);
      await loadData();
      onDataChange();
    } catch (error) {
      console.error('❌ Error general:', error);
      alert('Error cambiando estado del proyecto');
    }
  };

  const ProjectModal = () => {
    if (!selectedProject) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedProject.sede}</h2>
                <p className="text-sm text-gray-600">{selectedCompany?.razonSocial}</p>
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
                  <span className="text-gray-700">{selectedCompany?.razonSocial}</span>
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
                  {selectedProject.contactPersons.map(contact => (
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

            <div className="flex justify-end">
              <button 
                onClick={() => onSelectProject(selectedProject.id)}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Gestionar Documentos</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!selectedCompanyId) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona una empresa</h3>
        <p className="text-gray-600">Para ver y gestionar proyectos, primero selecciona una empresa.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando proyectos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Proyectos</h2>
          <p className="text-gray-600">Empresa: {selectedCompany?.razonSocial}</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowNewProjectModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nuevo Proyecto</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <div key={project.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{project.sede}</h3>
                <p className="text-sm text-gray-600">Inicio: {project.fechaInicio}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {project.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-700 line-clamp-3">{project.descripcion}</p>
            </div>

            <div className="space-y-2">
              <div className="flex space-x-2">
                <button onClick={() => setSelectedProject(project)} className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg text-sm hover:bg-green-100 transition-colors">
                  Ver Detalles
                </button>
                {isAdmin && (
                  <button onClick={() => handleEditProject(project)} className="flex-1 bg-yellow-50 text-yellow-600 py-2 px-3 rounded-lg text-sm hover:bg-yellow-100 transition-colors">
                    Editar
                  </button>
                )}
              </div>
              <div className="flex space-x-2">
                <button onClick={() => onSelectProject(project.id)} disabled={loading} className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-sm hover:bg-blue-100 transition-colors disabled:opacity-50">
                  Documentos
                </button>
                {isAdmin && (
                  <button onClick={() => handleToggleProjectStatus(project.id)} disabled={loading} className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${project.isActive ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'} disabled:opacity-50`}>
                    {project.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                )}
              </div>
              {isAdmin && (
                <button onClick={() => handleDeleteProject(project.id)} disabled={loading} className="w-full bg-red-50 text-red-600 py-2 px-3 rounded-lg text-sm hover:bg-red-100 transition-colors flex items-center justify-center space-x-1 disabled:opacity-50">
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay proyectos</h3>
          <p className="text-gray-600 mb-4">Esta empresa aún no tiene proyectos registrados.</p>
          {isAdmin && (
            <button onClick={() => setShowNewProjectModal(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Crear Primer Proyecto
            </button>
          )}
        </div>
      )}

      {selectedProject && <ProjectModal />}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={resetForm}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
        editingProject={editingProject}
        formData={newProjectForm}
        setFormData={setNewProjectForm}
        selectedCompanyId={selectedCompanyId}
        selectedContactIds={selectedContactIds}
        setSelectedContactIds={setSelectedContactIds}
        availableUsers={availableUsers}
      />
    </div>
  );
};

export default ProjectManagement;