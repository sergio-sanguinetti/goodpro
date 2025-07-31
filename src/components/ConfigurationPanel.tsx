import React, { useState, useEffect } from 'react';
import { Settings, Users, FileText, Plus, Edit, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface ConfigurationPanelProps {
  onClose: () => void;
  onDataChange?: () => void;
}

interface Company {
  id: string;
  razon_social: string;
  ruc: string;
  is_active: boolean;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  telefono: string | null;
  role: 'admin' | 'company_user';
  company_id: string | null;
  is_active: boolean;
  can_view_all_company_projects: boolean;
  created_at: string;
}

interface DocumentCategory {
  id: string;
  name: string;
  description: string | null;
  normative_reference: string | null;
  type: 'document' | 'record';
  is_required: boolean;
  renewal_period_months: number;
  is_active: boolean;
  created_at: string;
}

// Componente modal para usuarios
const UserModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingUser, 
  formData, 
  setFormData,
  showPassword,
  setShowPassword,
  companies,
  loading
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingUser: User | null;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  companies: Company[];
  loading: boolean;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombres *
                </label>
                <input
                  type="text"
                  value={formData.nombres}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombres: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellidos *
                </label>
                <input
                  type="text"
                  value={formData.apellidos}
                  onChange={(e) => setFormData(prev => ({ ...prev, apellidos: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+51 987654321"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña {editingUser ? '(dejar vacío para mantener actual)' : '*'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!editingUser}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'company_user' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="admin">Administrador</option>
                  <option value="company_user">Usuario de Empresa</option>
                </select>
              </div>

              {formData.role === 'company_user' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa *
                  </label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">
                      {loading ? 'Cargando empresas...' : 'Seleccionar empresa...'}
                    </option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.razon_social}
                      </option>
                    ))}
                  </select>
                  {companies.length === 0 && !loading && (
                    <p className="text-sm text-orange-600 mt-1">
                      No hay empresas. Primero crea una empresa.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Usuario activo (puede iniciar sesión)
              </label>
            </div>

            {formData.role === 'company_user' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Permisos de Acceso</h4>
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="canViewAllCompanyProjects"
                    checked={formData.canViewAllCompanyProjects}
                    onChange={(e) => setFormData(prev => ({ ...prev, canViewAllCompanyProjects: e.target.checked }))}
                    className="mt-1"
                  />
                  <div>
                    <label htmlFor="canViewAllCompanyProjects" className="text-sm font-medium text-gray-700">
                      Puede ver todos los proyectos de la empresa
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      {formData.canViewAllCompanyProjects 
                        ? "✅ El usuario verá todos los documentos y proyectos de su empresa"
                        : "⚠️ El usuario solo verá documentos de proyectos donde esté asignado como contacto"
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Procesando...' : editingUser ? 'Actualizar' : 'Crear'} Usuario
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Componente modal para categorías
const CategoryModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingCategory, 
  formData, 
  setFormData 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingCategory: DocumentCategory | null;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Categoría *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referencia Normativa
              </label>
              <input
                type="text"
                value={formData.normativeReference}
                onChange={(e) => setFormData(prev => ({ ...prev, normativeReference: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Ley 29783 - Art. 17"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'document' | 'record' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="document">Documento</option>
                  <option value="record">Registro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período de Renovación (meses)
                </label>
                <input
                  type="number"
                  value={formData.renewalPeriodMonths}
                  onChange={(e) => setFormData(prev => ({ ...prev, renewalPeriodMonths: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRequired"
                checked={formData.isRequired}
                onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="isRequired" className="text-sm text-gray-700">
                Categoría requerida por normativa
              </label>
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
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                {editingCategory ? 'Actualizar' : 'Crear'} Categoría
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ onClose, onDataChange }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'categories' | 'users'>('users');
  const [loading, setLoading] = useState(false);
  
  // Estados para empresas
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  
  // Estados para usuarios
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  // Estados para categorías
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Modales
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingCategory, setEditingCategory] = useState<DocumentCategory | null>(null);

  // Formularios
  const [userForm, setUserForm] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    password: '',
    role: 'company_user' as 'admin' | 'company_user',
    companyId: '',
    isActive: true,
    canViewAllCompanyProjects: true
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    normativeReference: '',
    type: 'document' as 'document' | 'record',
    isRequired: false,
    renewalPeriodMonths: 12
  });

  const [showPassword, setShowPassword] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadCompanies();
    loadUsers();
    loadCategories();
  }, []);

  // Cargar empresas desde Supabase
  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      console.log('🏢 Cargando empresas...');
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('is_active', true)
        .order('razon_social');

      if (error) {
        console.error('❌ Error cargando empresas:', error);
        alert(`Error cargando empresas: ${error.message}`);
        return;
      }

      console.log('✅ Empresas cargadas:', data);
      setCompanies(data || []);
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error cargando empresas');
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Cargar usuarios desde Supabase
  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      console.log('👥 Cargando usuarios...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Error cargando usuarios:', error);
        alert(`Error cargando usuarios: ${error.message}`);
        return;
      }

      console.log('✅ Usuarios cargados:', data);
      setUsers(data || []);
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error cargando usuarios');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Cargar categorías desde Supabase
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      console.log('📂 Cargando categorías...');
      
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ Error cargando categorías:', error);
        alert(`Error cargando categorías: ${error.message}`);
        return;
      }

      console.log('✅ Categorías cargadas:', data);
      setCategories(data || []);
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Error cargando categorías');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Crear usuario directamente con Supabase
  const createUser = async () => {
    try {
      setLoading(true);
      console.log('👤 Creando usuario...', userForm);

      // 1. Crear usuario en auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userForm.email,
        password: userForm.password,
        options: {
          data: {
            name: `${userForm.nombres} ${userForm.apellidos}`
          }
        }
      });

      if (authError) {
        console.error('❌ Error creando auth:', authError);
        alert(`Error creando usuario: ${authError.message}`);
        return;
      }

      console.log('✅ Usuario auth creado:', authData.user?.id);

      // 2. Actualizar perfil en tabla users
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .update({
            name: `${userForm.nombres} ${userForm.apellidos}`,
            telefono: userForm.telefono || null,
            role: userForm.role,
            company_id: userForm.companyId || null,
            is_active: userForm.isActive,
            can_view_all_company_projects: userForm.canViewAllCompanyProjects
          })
          .eq('id', authData.user.id);

        if (profileError) {
          console.error('❌ Error actualizando perfil:', profileError);
          alert(`Error configurando perfil: ${profileError.message}`);
          return;
        }

        console.log('✅ Perfil actualizado');
        alert('Usuario creado correctamente');
        await loadUsers();
        onDataChange?.(); // Actualizar datos en componente padre
        resetUserForm();
      }
    } catch (error) {
      console.error('❌ Error general:', error);
      alert(`Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  // Crear categoría
  const createCategory = async () => {
    try {
      setLoading(true);
      console.log('📂 Creando categoría...', categoryForm);

      const { error } = await supabase
        .from('document_categories')
        .insert({
          name: categoryForm.name,
          description: categoryForm.description || null,
          normative_reference: categoryForm.normativeReference || null,
          type: categoryForm.type,
          is_required: categoryForm.isRequired,
          renewal_period_months: categoryForm.renewalPeriodMonths
        });

      if (error) {
        console.error('❌ Error creando categoría:', error);
        alert(`Error creando categoría: ${error.message}`);
        return;
      }

      console.log('✅ Categoría creada');
      alert('Categoría creada correctamente');
      await loadCategories();
      resetCategoryForm();
    } catch (error) {
      console.error('❌ Error:', error);
      alert(`Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  // Manejadores de formularios
  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      // Lógica de editar usuario
      console.log('Editando usuario:', editingUser.id);
    } else {
      createUser();
    }
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      // Lógica de editar categoría
      console.log('Editando categoría:', editingCategory.id);
    } else {
      createCategory();
    }
  };

  const resetUserForm = () => {
    setUserForm({
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      password: '',
      role: 'company_user',
      companyId: '',
      isActive: true,
      canViewAllCompanyProjects: true
    });
    setEditingUser(null);
    setShowUserModal(false);
    setShowPassword(false);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      normativeReference: '',
      type: 'document',
      isRequired: false,
      renewalPeriodMonths: 12
    });
    setEditingCategory(null);
    setShowCategoryModal(false);
  };

  const handleEditUser = (user: User) => {
    const nameParts = user.name.split(' ');
    const nombres = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
    const apellidos = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');
    
    setEditingUser(user);
    setUserForm({
      nombres: nombres,
      apellidos: apellidos,
      email: user.email,
      telefono: user.telefono || '',
      password: '',
      role: user.role,
      companyId: user.company_id || '',
      isActive: user.is_active,
      canViewAllCompanyProjects: user.can_view_all_company_projects
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) {
        alert(`Error eliminando usuario: ${error.message}`);
        return;
      }

      alert('Usuario eliminado correctamente');
      await loadUsers();
    } catch (error) {
      alert('Error eliminando usuario');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Configuración del Sistema</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 flex-shrink-0">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Usuarios
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Categorías
            </button>
          </nav>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h3>
                  <p className="text-gray-600">Administra los usuarios del sistema y sus accesos</p>
                </div>
                <button
                  onClick={() => setShowUserModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Usuario</span>
                </button>
              </div>

              {loadingUsers ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando usuarios...</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 font-medium text-gray-900">Usuario</th>
                          <th className="px-6 py-3 font-medium text-gray-900">Email</th>
                          <th className="px-6 py-3 font-medium text-gray-900">Rol</th>
                          <th className="px-6 py-3 font-medium text-gray-900">Empresa</th>
                          <th className="px-6 py-3 font-medium text-gray-900">Estado</th>
                          <th className="px-6 py-3 font-medium text-gray-900">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map(user => {
                          const company = companies.find(c => c.id === user.company_id);
                          return (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-medium text-sm">
                                      {user.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{user.name}</p>
                                    {user.telefono && (
                                      <p className="text-xs text-gray-500">{user.telefono}</p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600">{user.email}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {user.role === 'admin' ? 'Administrador' : 'Usuario Empresa'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {company?.razon_social || '-'}
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {user.is_active ? 'Activo' : 'Inactivo'}
                                  </span>
                                  {user.role === 'company_user' && (
                                    <div className="text-xs text-gray-600">
                                      {user.can_view_all_company_projects ? 'Acceso total' : 'Acceso limitado'}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEditUser(user)}
                                    className="text-blue-600 hover:text-blue-800 p-1"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600 hover:text-red-800 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {users.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No hay usuarios en el sistema</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Categorías de Documentos y Registros</h3>
                  <p className="text-gray-600">Gestiona las categorías disponibles para todas las empresas</p>
                </div>
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nueva Categoría</span>
                </button>
              </div>

              {loadingCategories ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando categorías...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map(category => (
                    <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            category.type === 'document' ? 'bg-blue-100' : 'bg-purple-100'
                          }`}>
                            <FileText className={`w-5 h-5 ${
                              category.type === 'document' ? 'text-blue-600' : 'text-purple-600'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{category.name}</h4>
                            <p className="text-sm text-gray-600">{category.normative_reference}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingCategory(category);
                              setCategoryForm({
                                name: category.name,
                                description: category.description || '',
                                normativeReference: category.normative_reference || '',
                                type: category.type,
                                isRequired: category.is_required,
                                renewalPeriodMonths: category.renewal_period_months
                              });
                              setShowCategoryModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
                                const { error } = await supabase
                                  .from('document_categories')
                                  .update({ is_active: false })
                                  .eq('id', category.id);
                                
                                if (error) {
                                  alert(`Error: ${error.message}`);
                                } else {
                                  alert('Categoría eliminada');
                                  loadCategories();
                                }
                              }
                            }}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-3">{category.description}</p>

                      <div className="flex justify-between items-center text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          category.type === 'document' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {category.type === 'document' ? 'Documento' : 'Registro'}
                        </span>
                        <span className="text-gray-600">
                          {category.renewal_period_months} meses
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {categories.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No hay categorías configuradas</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modales */}
        <UserModal
          isOpen={showUserModal}
          onClose={resetUserForm}
          onSubmit={handleUserSubmit}
          editingUser={editingUser}
          formData={userForm}
          setFormData={setUserForm}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          companies={companies}
          loading={loading}
        />

        <CategoryModal
          isOpen={showCategoryModal}
          onClose={resetCategoryForm}
          onSubmit={handleCategorySubmit}
          editingCategory={editingCategory}
          formData={categoryForm}
          setFormData={setCategoryForm}
        />
      </div>
    </div>
  );
};

export default ConfigurationPanel;