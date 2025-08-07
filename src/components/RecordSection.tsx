import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, Upload, Download, Edit, Trash2, Eye, Calendar, User, X, CheckCircle, XCircle, Clock, AlertTriangle, FileText, MoreVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { Project, Company, DocumentCategory, DocumentRole, RecordEntry, RecordFormat } from '../types';
import { mockProjects, mockCompanies, mockDocumentCategories, mockRecordEntries, mockRecordFormats } from '../data/mockData';
import RecordUploadModal from './RecordUploadModal';
import { DatabaseService } from '../services/database';
import { StorageService } from '../services/storage';
import { useAuth } from './AuthContext';

interface RecordSectionProps {
  selectedProjectId: string;
  users: any[];
  userRole?: 'admin' | 'company_user';
  canEdit?: boolean;
  canDelete?: boolean;
  canUploadNewFormats?: boolean;
  canUploadFilledRecords?: boolean;
}

const RecordSection: React.FC<RecordSectionProps> = ({ 
  selectedProjectId,
  users,
  userRole = 'admin',
  canEdit = true,
  canDelete = true,
  canUploadNewFormats = true, 
  canUploadFilledRecords = true
}) => {
  // Hook de autenticación con verificación de disponibilidad
  const authContext = useAuth();
  const currentUser = authContext?.user || null;
  
  // Verificar si el contexto está disponible
  if (!authContext) {
    console.warn('AuthContext no disponible en RecordSection');
  }
  
  const [records, setRecords] = useState<any[]>([]);
  const [recordEntries, setRecordEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecordEntries, setLoadingRecordEntries] = useState(false);
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RecordFormat | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showFilledRecordModal, setShowFilledRecordModal] = useState(false);
  const [selectedRecordEntry, setSelectedRecordEntry] = useState<RecordEntry | null>(null);
  const [showEditFilledRecordModal, setShowEditFilledRecordModal] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [showRecordUploadModal, setShowRecordUploadModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'entries' | 'versions'>('entries');
  const [selectedRecordForModal, setSelectedRecordForModal] = useState<any>(null);
  const [recordEntriesForModal, setRecordEntriesForModal] = useState<any[]>([]);
  const [selectedRecordForEntries, setSelectedRecordForEntries] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingEntry, setUploadingEntry] = useState(false);
  const [filledRecordForm, setFilledRecordForm] = useState({
    nombre: '',
    fechaRealizacion: '',
    file: null as File | null,
    notes: ''
  });
  const [editRecordForm, setEditRecordForm] = useState({
    nombre: '',
    codigo: '',
    version: '',
    fechaVencimiento: '',
    notes: ''
  });
  const [newVersionForm, setNewVersionForm] = useState({
    version: '',
    changes: '',
    file: null as File | null
  });

  // Cargar record formats al montar el componente o cambiar proyecto
  useEffect(() => {
    if (selectedProjectId) {
      loadRecordFormats();
      loadRecordEntries();
    } else {
      setRecords([]);
      setRecordEntries([]);
      setLoading(false);
    }
  }, [selectedProjectId]);

  // Función para obtener el nombre del usuario que subió el archivo
  const getUploadedByName = (userId: string): string => {
    if (!userId) return 'Usuario desconocido';
    const user = users.find(u => u.id === userId);
    return user?.name || 'Usuario desconocido';
  };

  const loadRecordFormats = async () => {
    try {
      setLoading(true);
      console.log('🔄 RecordSection.loadRecordFormats - Cargando para proyecto:', selectedProjectId);
      
      const recordFormatsData = await DatabaseService.getRecordFormatsByProject(selectedProjectId);
      console.log('📊 Record formats desde BD:', recordFormatsData?.length || 0);
      
      // Mapear datos de BD a formato frontend
      const mappedRecords = recordFormatsData.map(record => ({
        id: record.id,
        nombre: record.nombre,
        categoryId: record.category_id,
        projectId: record.project_id,
        version: record.version,
        codigo: record.codigo,
        fechaCreacion: record.fecha_creacion,
        fechaVencimiento: record.fecha_vencimiento,
        status: record.status,
        versions: (record.versions || []).map(v => ({
          id: v.id,
          versionNumber: v.version_number,
          fileName: v.file_name,
          filePath: v.file_path,
          fileSize: v.file_size,
          uploadedBy: v.uploaded_by,
          uploadedAt: v.uploaded_at,
          changes: v.changes,
          isActive: v.is_active
        })),
        elaborators: (record.roles || []).filter(r => r.role === 'elaborator'),
        reviewers: (record.roles || []).filter(r => r.role === 'reviewer'),
        approvers: (record.roles || []).filter(r => r.role === 'approver'),
        createdBy: record.created_by,
        createdAt: record.created_at,
        notes: record.notes
      }));
      
      console.log('✅ RecordSection - Record formats mapeados:', mappedRecords.length);
      mappedRecords.forEach(record => {
        console.log(`  📄 ${record.nombre} - Versiones: ${record.versions?.length || 0}`);
      });
      
      setRecords(mappedRecords);
    } catch (error) {
      console.error('❌ Error cargando record formats:', error);
      alert(`Error cargando registros: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadRecordEntries = async () => {
    try {
      setLoadingRecordEntries(true);
      console.log('🔄 RecordSection.loadRecordEntries - Cargando para proyecto:', selectedProjectId);
      console.log('🔄 Timestamp de recarga:', new Date().toISOString());
      
      const entriesData = await DatabaseService.getRecordEntriesByProject(selectedProjectId);
      console.log('📊 RecordSection - Record entries cargados:', {
        count: entriesData?.length || 0,
        entries: entriesData?.map(e => ({ id: e.id.substring(0, 8), nombre: e.nombre }))
      });
      
      setRecordEntries(entriesData || []);
    } catch (error) {
      console.error('❌ Error cargando record entries:', error);
      setRecordEntries([]);
    } finally {
      setLoadingRecordEntries(false);
    }
  };

  // Función específica para recargar después de upload
  const handleAfterUpload = async () => {
    console.log('🎯 RecordSection.handleAfterUpload - Recargando todos los datos...');
    await Promise.all([
      loadRecordFormats(),
      loadRecordEntries()
    ]);
    console.log('✅ RecordSection.handleAfterUpload - Recarga completada');
  };

  // Función para manejar upload de registro lleno
  const handleRecordEntryUpload = async (
    recordFormatId: string,
    file: File,
    entryData: any
  ) => {
    try {
      console.log('📤 RecordSection.handleRecordEntryUpload - Iniciando...');
      setUploadingEntry(true);
      
      // El upload ya se maneja en RecordEntryUploadModal
      // Aquí solo recargamos los datos
      console.log('🔄 Recargando record entries después de upload...');
      await handleAfterUpload();
      
    } catch (error) {
      console.error('❌ Error en handleRecordEntryUpload:', error);
    } finally {
      setUploadingEntry(false);
    }
  };

  // Función para manejar upload de formato de registro
  const handleRecordFormatUpload = async (files: File[], category: string, projectId: string, recordData: any) => {
    try {
      console.log('📤 RecordSection.handleRecordFormatUpload - Iniciando...');
      setUploading(true);
      
      // El upload ya se maneja en RecordUploadModal
      // Aquí solo recargamos los datos
      console.log('🔄 Recargando record formats después de upload...');
      await handleAfterUpload();
      
    } catch (error) {
      console.error('❌ Error en handleRecordFormatUpload:', error);
    } finally {
      setUploading(false);
    }
  };

  // Los records ya están filtrados por proyecto en loadRecordFormats
  const filteredRecords = records;

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => setOpenActionMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleRecordExpansion = (recordId: string) => {
    setExpandedRecords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recordId)) {
        newSet.delete(recordId);
      } else {
        newSet.add(recordId);
      }
      return newSet;
    });
  };

  const handleFileUpload = async (files: File[], categoryId: string, projectId: string, recordData: any) => {
    console.log('🎉 RecordSection.handleFileUpload - Callback ejecutado');
    console.log('📊 Datos recibidos:', { files: files.length, categoryId, projectId, recordData });
    
    try {
      // Esperar un momento para que se complete la transacción
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('🔄 Recargando record formats...');
      await loadRecordFormats();
      console.log('✅ Record formats recargados');
    } catch (error) {
      console.error('❌ Error en callback:', error);
    }
    setShowUploadModal(false);
  };

  const handleFilledRecordUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRecord || !filledRecordForm.nombre || !filledRecordForm.fechaRealizacion || !filledRecordForm.file) {
      alert('Por favor completa todos los campos requeridos y selecciona un archivo');
      return;
    }
    
    try {
      setLoading(true);
      console.log('🚀 RecordSection.handleFilledRecordUpload - Iniciando...');
      console.log('📋 Datos del formulario:', {
        recordFormatId: selectedRecord.id,
        nombre: filledRecordForm.nombre,
        fechaRealizacion: filledRecordForm.fechaRealizacion,
        file: filledRecordForm.file.name
      });
      
      // 1. Subir archivo al storage
      console.log('📁 Subiendo archivo al storage...');
      const uploadResult = await StorageService.uploadRecordEntry(
        filledRecordForm.file,
        '',
        selectedProjectId,
        selectedRecord.id,
        `entry_${Date.now()}`
      );
      
      if (!uploadResult.success) {
        throw new Error(`Error subiendo archivo: ${uploadResult.error}`);
      }
      
      console.log('✅ Archivo subido al storage:', uploadResult.filePath);
      
      // 2. Crear registro lleno en BD
      console.log('📄 Creando record entry en BD...');
      await DatabaseService.createRecordEntry({
        record_format_id: selectedRecord.id,
        nombre: filledRecordForm.nombre,
        fecha_realizacion: filledRecordForm.fechaRealizacion,
        file_name: filledRecordForm.file.name,
        file_path: uploadResult.filePath!,
        file_size: filledRecordForm.file.size,
        uploaded_by: currentUser?.id || 'unknown',
        status: 'pending',
        notes: filledRecordForm.notes
      });
      
      console.log('✅ Record entry creado exitosamente');
      alert('Registro lleno subido correctamente');
      
      // 3. Recargar datos
      console.log('🔄 Recargando datos...');
      await loadRecordEntries();
      
      // 4. Cerrar modal y resetear formulario
      setShowFilledRecordModal(false);
      setFilledRecordForm({
        nombre: '',
        fechaRealizacion: '',
        file: null,
        notes: ''
      });
      setSelectedRecord(null);
      
    } catch (error) {
      console.error('❌ Error subiendo registro lleno:', error);
      alert(`Error subiendo registro lleno: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecord = (record: RecordFormat) => {
    setSelectedRecord(record);
    setSelectedRecordForEntries(record);
    
    // Cargar registros llenos relacionados
    const relatedEntries = recordEntries.filter(entry => entry.record_format_id === record.id);
    setRecordEntriesForModal(relatedEntries);
    
    setShowViewModal(true);
    setOpenActionMenu(null);
  };

  const handleEditRecord = (record: any) => {
    console.log('✏️ Editando record format:', record.id);
    setSelectedRecord(record);
    setEditRecordForm({
      nombre: record.nombre,
      codigo: record.codigo,
      version: record.version,
      fechaVencimiento: record.fechaVencimiento,
      notes: record.notes || ''
    });
    setShowEditModal(true);
    setOpenActionMenu(null);
  };

  const handleNewVersion = (record: any) => {
    console.log('🆕 Nueva versión para record format:', record.id);
    setSelectedRecord(record);
    const currentVersion = parseFloat(record.version);
    const newVersion = (currentVersion + 0.1).toFixed(1);
    setNewVersionForm({
      version: newVersion,
      changes: '',
      file: null
    });
    setShowVersionModal(true);
    setOpenActionMenu(null);
  };

  const handleDownloadRecord = async (record: any) => {
    console.log('💾 Descargando record format:', record.id);
    const activeVersion = record.versions.find(v => v.isActive);
    console.log('📋 Versión activa encontrada:', activeVersion);
    
    if (activeVersion) {
      try {
        console.log('🔗 Generando URL de descarga para:', activeVersion.filePath);
        const result = await StorageService.getDownloadUrl('records', activeVersion.filePath);
        
        if (result.success && result.url) {
          console.log('✅ URL generada, abriendo descarga');
          window.open(result.url, '_blank');
        } else {
          console.error('❌ Error generando URL:', result.error);
          alert(`Error generando URL de descarga: ${result.error}`);
        }
      } catch (error) {
        console.error('❌ Error en descarga:', error);
        alert('Error descargando archivo');
      }
    } else {
      console.warn('⚠️ No hay versión activa');
      alert('No hay versión activa para descargar');
    }
  };

  const handleDeleteRecord = async (record: any) => {
    const confirmMessage = `¿Estás seguro de que deseas eliminar el registro "${record.nombre}"?\n\nEsta acción no se puede deshacer.`;
    if (!confirm(confirmMessage)) {
      return;
    }
    
    try {
      console.log('🗑️ RecordSection.handleDeleteRecord - Eliminando:', record.id);
      await DatabaseService.deleteRecordFormat(record.id);
      console.log('✅ Record format eliminado de BD');
      alert('Registro eliminado correctamente');
      
      console.log('🔄 Recargando lista...');
      await loadRecordFormats();
      console.log('✅ Lista recargada');
    } catch (error) {
      console.error('❌ Error eliminando record format:', error);
      alert(`Error eliminando registro: ${error.message}`);
    }
    setOpenActionMenu(null);
  };

  const handleUploadFilledRecord = (record: RecordFormat) => {
    setSelectedRecord(record);
    setShowFilledRecordModal(true);
    setOpenActionMenu(null);
  };

  const handleEditFilledRecord = (entry: RecordEntry) => {
    setSelectedRecordEntry(entry);
    setShowEditFilledRecordModal(true);
    setOpenActionMenu(null);
  };

  const handleDeleteFilledRecord = (entry: RecordEntry) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${entry.nombre}"?`)) {
      return;
    }
    
    try {
      console.log('🗑️ Eliminando registro lleno:', entry.id);
      DatabaseService.deleteRecordEntry(entry.id);
      alert('Registro lleno eliminado correctamente');
      loadRecordEntries();
    } catch (error) {
      console.error('❌ Error eliminando registro lleno:', error);
      alert(`Error eliminando registro lleno: ${error.message}`);
    }
    setOpenActionMenu(null);
  };

  const handleDeleteRecordEntry = async (entryId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro lleno?')) {
      return;
    }
    
    try {
      console.log('🗑️ Eliminando registro lleno:', entryId);
      await DatabaseService.deleteRecordEntry(entryId);
      alert('Registro lleno eliminado correctamente');
      
      // Recargar datos
      await loadRecordEntries();
      
      // Actualizar modal si está abierto
      if (selectedRecordForEntries) {
        const relatedEntries = recordEntries.filter(entry => entry.record_format_id === selectedRecordForEntries.id);
        setRecordEntriesForModal(relatedEntries);
      }
    } catch (error) {
      console.error('❌ Error eliminando registro lleno:', error);
      alert(`Error eliminando registro lleno: ${error.message}`);
    }
  };

  const handleDownloadRecordEntry = async (entry: any) => {
    try {
      console.log('💾 Descargando registro lleno:', entry.id);
      const result = await StorageService.getDownloadUrl('record-entries', entry.file_path);
      
      if (result.success && result.url) {
        console.log('✅ URL generada, abriendo descarga');
        window.open(result.url, '_blank');
      } else {
        console.error('❌ Error generando URL:', result.error);
        alert(`Error generando URL de descarga: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Error en descarga:', error);
      alert('Error descargando archivo');
    }
  };

  const handleDownloadRecordFormat = async (record: any) => {
    console.log('💾 Descargando record format:', record.id);
    const activeVersion = record.versions.find(v => v.isActive);
    
    if (activeVersion) {
      try {
        console.log('🔗 Generando URL de descarga para:', activeVersion.filePath);
        const result = await StorageService.getDownloadUrl('records', activeVersion.filePath);
        
        if (result.success && result.url) {
          console.log('✅ URL generada, abriendo descarga');
          window.open(result.url, '_blank');
        } else {
          console.error('❌ Error generando URL:', result.error);
          alert(`Error generando URL de descarga: ${result.error}`);
        }
      } catch (error) {
        console.error('❌ Error en descarga:', error);
        alert('Error descargando archivo');
      }
    } else {
      console.warn('⚠️ No hay versión activa');
      alert('No hay versión activa para descargar');
    }
  };

  const handleEditRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    
    try {
      console.log('💾 Guardando cambios del record format:', selectedRecord.id);
      
      await DatabaseService.updateRecordFormat(selectedRecord.id, {
        nombre: editRecordForm.nombre,
        codigo: editRecordForm.codigo,
        version: editRecordForm.version,
        fecha_vencimiento: editRecordForm.fechaVencimiento,
        notes: editRecordForm.notes
      });
      
      console.log('✅ Record format actualizado');
      alert('Registro actualizado correctamente');
      
      await loadRecordFormats();
      setShowEditModal(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error('❌ Error actualizando record format:', error);
      alert(`Error actualizando registro: ${error.message}`);
    }
  };

  const handleNewVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !newVersionForm.file) {
      alert('Debes seleccionar un archivo para la nueva versión');
      return;
    }
    
    try {
      console.log('🆕 Creando nueva versión para record format:', selectedRecord.id);
      
      // 1. Subir archivo nuevo
      const uploadResult = await StorageService.uploadRecord(
        newVersionForm.file,
        '',
        selectedProjectId,
        selectedRecord.id,
        newVersionForm.version
      );
      
      if (!uploadResult.success) {
        throw new Error(`Error subiendo archivo: ${uploadResult.error}`);
      }
      
      console.log('📁 Archivo subido, creando versión en BD...');
      
      // 2. Crear versión en BD
      await DatabaseService.createRecordFormatVersion({
        record_format_id: selectedRecord.id,
        version_number: newVersionForm.version,
        file_name: newVersionForm.file.name,
        file_path: uploadResult.filePath!,
        file_size: newVersionForm.file.size,
        uploaded_by: currentUser?.id || 'unknown',
        changes: newVersionForm.changes,
        is_active: true
      });
      
      // 3. Actualizar número de versión del record format
      await DatabaseService.updateRecordFormat(selectedRecord.id, {
        version: newVersionForm.version
      });
      
      console.log('✅ Nueva versión creada');
      alert('Nueva versión creada correctamente');
      
      await loadRecordFormats();
      setShowVersionModal(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error('❌ Error creando nueva versión:', error);
      alert(`Error creando nueva versión: ${error.message}`);
    }
  };

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

  const getRecordEntryStatusClass = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecordEntryStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'pending': return 'Pendiente';
      case 'rejected': return 'Rechazado';
      default: return 'Desconocido';
    }
  };

  const getUserName = (userId: string) => {
    if (!userId) return 'Usuario desconocido';
    const user = users.find(u => u.id === userId);
    return user?.name || 'Usuario desconocido';
  };

  if (!selectedProjectId) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un proyecto</h3>
        <p className="text-gray-600">Para gestionar registros, primero selecciona un proyecto.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Registros del Proyecto</h3>
          <p className="text-gray-600">Gestión de registros y formatos</p>
        </div>
        {canUploadNewFormats && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Subir Registro</span>
          </button>
        )}
      </div>

      {filteredRecords.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros</h3>
          <p className="text-gray-600 mb-4">Este proyecto aún no tiene registros base.</p>
          {canUploadNewFormats && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Subir Primer Registro
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md">
          <div className="divide-y divide-gray-200">
            {filteredRecords.map(record => {
              const category = mockDocumentCategories.find(cat => cat.id === record.categoryId);
              const activeVersion = record.versions.find(v => v.isActive);
              const relatedEntries = recordEntries.filter(entry => entry.formatId === record.id);
              const selectedFormatEntries = recordEntries.filter(entry => entry.record_format_id === record.id);
              
              return (
                <div key={record.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FolderOpen className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{record.nombre}</h4>
                            <p className="text-sm text-gray-600">{category?.name}</p>
                          </div>
                          <div className="text-sm">
                            <span className="font-mono text-gray-700">{record.codigo}</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="font-mono text-gray-700">v{record.version}</span>
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                              {getStatusText(record.status)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span>Vence: {record.fechaVencimiento}</span>
                          </div>
                          <div className="text-xs text-purple-600">
                            {recordEntries.filter(entry => entry.record_format_id === record.id).length} registro{recordEntries.filter(entry => entry.record_format_id === record.id).length !== 1 ? 's' : ''} lleno{recordEntries.filter(entry => entry.record_format_id === record.id).length !== 1 ? 's' : ''}
                          </div>
                          {activeVersion && (
                            <div className="text-xs text-purple-600">
                              {activeVersion.fileName}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button 
                        onClick={() => handleViewRecord(record)}
                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm hover:bg-purple-200 transition-colors"
                      >
                        Ver
                      </button>
                      <button 
                        onClick={() => handleDownloadRecord(record)}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200 transition-colors"
                      >
                        Descargar
                      </button>
                      <button
                        onClick={() => toggleRecordExpansion(record.id)}
                        className="text-gray-600 hover:text-gray-800 p-1"
                        title={expandedRecords.has(record.id) ? "Ocultar registros llenos" : "Mostrar registros llenos"}
                      >
                        {expandedRecords.has(record.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      {(canEdit || canDelete) && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionMenu(openActionMenu === record.id ? null : record.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openActionMenu === record.id && (
                            <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
                              {canEdit && (
                                <button
                                  onClick={() => handleNewVersion(record)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <Upload className="w-4 h-4" />
                                  <span>Nueva Versión</span>
                                </button>
                              )}
                              {canEdit && (
                                <>
                                  <div className="border-t border-gray-100"></div>
                                  <button
                                    onClick={() => handleEditRecord(record)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                    <span>Editar Registro</span>
                                  </button>
                                </>
                              )}
                              {canDelete && (
                                <>
                                  <div className="border-t border-gray-100"></div>
                                  <button
                                    onClick={() => handleDeleteRecord(record)}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Eliminar</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Sección de registros llenos relacionados - solo mostrar si está expandido */}
                  {expandedRecords.has(record.id) && (
                    <div className="mt-4 pl-14">
                      <div className="text-sm text-gray-600 mb-2">
                        Registros Llenos Relacionados ({selectedFormatEntries.length})
                      </div>
                      
                      {loadingRecordEntries ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Cargando registros llenos...</p>
                        </div>
                      ) : selectedFormatEntries.length === 0 ? (
                        <div className="text-center py-4 bg-gray-50 rounded-lg">
                          <p className="text-gray-500 text-sm">No hay registros llenos para este formato</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedFormatEntries.map(entry => (
                            <div key={entry.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <FileText className="w-4 h-4 text-orange-600" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{entry.nombre}</p>
                                  <p className="text-xs text-gray-600">
                                    {entry.fecha_realizacion} • {entry.file_name}
                                  </p>
                                  <p className="text-sm text-gray-600">{getUploadedByName(entry.uploaded_by)}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecordEntryStatusClass(entry.status)}`}>
                                  {getRecordEntryStatusText(entry.status)}
                                </span>
                                <button
                                  onClick={() => handleDownloadRecordEntry(entry)}
                                  className="text-green-600 hover:text-green-800 p-1"
                                  title="Descargar"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                {userRole === 'admin' && (
                                  <button
                                    onClick={() => handleDeleteRecordEntry(entry.id)}
                                    className="text-red-600 hover:text-red-800 p-1"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de subida de registros */}
      <RecordUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onFileUpload={handleFileUpload}
        projectId={selectedProjectId}
        companyId={''}
      />

      {/* Modal de vista de registro */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedRecord.nombre}</h2>
                  <p className="text-sm text-gray-600">Registro Base - {mockDocumentCategories.find(cat => cat.id === selectedRecord.categoryId)?.name}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Pestañas del modal */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveModalTab('entries')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeModalTab === 'entries'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Registros Llenos Relacionados ({recordEntriesForModal.length})
                </button>
                <button
                  onClick={() => setActiveModalTab('versions')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeModalTab === 'versions'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Versiones del Registro ({selectedRecordForEntries?.versions?.length || 0})
                </button>
              </nav>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Código:</span>
                      <span className="font-mono text-sm">{selectedRecord.codigo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Versión:</span>
                      <span className="font-medium">v{selectedRecord.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRecord.status)}`}>
                        {getStatusText(selectedRecord.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vencimiento:</span>
                      <span className="font-medium">{selectedRecord.fechaVencimiento}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Creación:</span>
                      <span className="font-medium">{selectedRecord.fechaCreacion}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contenido según pestaña activa */}
              {activeModalTab === 'entries' ? (
                /* Lista de registros llenos relacionados */
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Registros Llenos Relacionados
                  </h3>
                  
                  {recordEntriesForModal.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No hay registros llenos para este formato</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Los usuarios pueden subir registros llenos usando este formato base
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recordEntriesForModal.map(entry => (
                        <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <FileText className="w-5 h-5 text-orange-600" />
                                <div>
                                  <h4 className="font-medium text-gray-900">{entry.nombre}</h4>
                                  <p className="text-sm text-gray-600">{entry.file_name}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Fecha de realización:</span>
                                  <p className="font-medium">{entry.fecha_realizacion}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Subido por:</span>
                                  <p className="font-medium">{getUploadedByName(entry.uploaded_by)}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Fecha de subida:</span>
                                  <p className="font-medium">{new Date(entry.uploaded_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Estado:</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecordEntryStatusClass(entry.status)}`}>
                                    {getRecordEntryStatusText(entry.status)}
                                  </span>
                                </div>
                              </div>
                              
                              {entry.notes && (
                                <div className="mt-3">
                                  <span className="text-gray-600 text-sm">Notas:</span>
                                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-1">{entry.notes}</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => handleDownloadRecordEntry(entry)}
                                className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50"
                                title="Descargar registro lleno"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              
                              {/* Botones de aprobación solo para admin */}
                              {userRole === 'admin' && (entry.status === 'pending' || entry.status === 'pending_review') && (
                                <>
                                  <button
                                    onClick={async () => {
                                      if (confirm('¿Aprobar este registro lleno?')) {
                                        try {
                                          console.log('✅ Aprobando registro lleno:', entry.id);
                                          
                                          // 1. Aprobar el registro lleno
                                          await DatabaseService.updateRecordEntry(entry.id, {
                                            status: 'approved',
                                            approved_by: currentUser?.id,
                                            approved_at: new Date().toISOString()
                                          });
                                          console.log('✅ Registro lleno aprobado correctamente');
                                          
                                          // 2. Si el registro base está en borrador, cambiarlo a activo
                                          if (selectedRecordForEntries && selectedRecordForEntries.status === 'draft') {
                                            console.log('🔄 Cambiando estado del registro base de borrador a activo');
                                            await DatabaseService.updateRecordFormat(selectedRecordForEntries.id, {
                                              status: 'approved',
                                              approved_by: currentUser?.id,
                                              approved_at: new Date().toISOString()
                                            });
                                            console.log('✅ Registro base cambiado a activo correctamente');
                                          }
                                          
                                          alert('Registro lleno aprobado correctamente');
                                          
                                          // 3. Recargar datos
                                          await loadRecordEntries();
                                          await loadRecordFormats();
                                          
                                          // 4. Actualizar estado local inmediatamente
                                          setRecordEntriesForModal(prev => prev.map(e => 
                                            e.id === entry.id 
                                              ? { ...e, status: 'approved', approved_by: currentUser?.id, approved_at: new Date().toISOString() }
                                              : e
                                          ));
                                          
                                          // 5. Actualizar modal si está abierto
                                          if (selectedRecordForEntries) {
                                            const relatedEntries = recordEntries.filter(e => e.record_format_id === selectedRecordForEntries.id);
                                            setRecordEntriesForModal(relatedEntries);
                                            
                                            // 6. Actualizar el registro base en el modal
                                            setSelectedRecordForEntries(prev => prev ? {
                                              ...prev,
                                              status: 'approved',
                                              approved_by: currentUser?.id,
                                              approved_at: new Date().toISOString()
                                            } : null);
                                          }
                                          
                                        } catch (error: any) {
                                          console.error('❌ Error aprobando registro lleno:', error);
                                          alert(`Error aprobando registro lleno: ${error.message}`);
                                        }
                                      }
                                    }}
                                    className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50"
                                    title="Aprobar registro lleno"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (confirm('¿Rechazar este registro lleno?')) {
                                        try {
                                          console.log('❌ Rechazando registro lleno:', entry.id);
                                          
                                          // 1. Rechazar el registro lleno
                                          await DatabaseService.updateRecordEntry(entry.id, {
                                            status: 'rejected',
                                            approved_by: user?.id,
                                            approved_at: new Date().toISOString()
                                          });
                                          console.log('✅ Registro lleno rechazado correctamente');
                                          
                                          // 2. Si el registro base está en borrador, cambiarlo a rechazado
                                          if (selectedRecordForEntries && selectedRecordForEntries.status === 'draft') {
                                            console.log('🔄 Cambiando estado del registro base de borrador a rechazado');
                                            await DatabaseService.updateRecordFormat(selectedRecordForEntries.id, {
                                              status: 'rejected',
                                              approved_by: user?.id,
                                              approved_at: new Date().toISOString()
                                            });
                                            console.log('✅ Registro base cambiado a rechazado correctamente');
                                          }
                                          
                                          alert('Registro lleno rechazado correctamente');
                                          
                                          // 3. Recargar datos
                                          await loadRecordEntries();
                                          await loadRecordFormats();
                                          
                                          // 4. Actualizar estado local inmediatamente
                                          setRecordEntriesForModal(prev => prev.map(e => 
                                            e.id === entry.id 
                                              ? { ...e, status: 'rejected', approved_by: user?.id, approved_at: new Date().toISOString() }
                                              : e
                                          ));
                                          
                                          // 5. Actualizar modal si está abierto
                                          if (selectedRecordForEntries) {
                                            const relatedEntries = recordEntries.filter(e => e.record_format_id === selectedRecordForEntries.id);
                                            setRecordEntriesForModal(relatedEntries);
                                            
                                            // 6. Actualizar el registro base en el modal
                                            setSelectedRecordForEntries(prev => prev ? {
                                              ...prev,
                                              status: 'rejected',
                                              approved_by: user?.id,
                                              approved_at: new Date().toISOString()
                                            } : null);
                                          }
                                          
                                        } catch (error: any) {
                                          console.error('❌ Error rechazando registro lleno:', error);
                                          alert(`Error rechazando registro lleno: ${error.message}`);
                                        }
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                                    title="Rechazar registro lleno"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              
                              <button
                                onClick={() => handleDeleteRecordEntry(entry.id)}
                                className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                                title="Eliminar registro lleno"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Historial de versiones del registro */
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Historial de Versiones del Registro
                  </h3>
                  
                  {(!selectedRecordForEntries?.versions || selectedRecordForEntries.versions.length === 0) ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No hay versiones disponibles</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Este registro base no tiene versiones guardadas
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedRecordForEntries.versions
                        .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
                        .map((version, index) => (
                        <div 
                          key={version.id} 
                          className={`border rounded-lg p-4 ${
                            version.is_active 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  version.is_active ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  v{version.version_number}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-900">
                                      Versión {version.version_number}
                                    </span>
                                    {version.is_active && (
                                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                                        Activa
                                      </span>
                                    )}
                                    {index === 0 && !version.is_active && (
                                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                        Más reciente
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">{version.file_name}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                <div>
                                  <span className="text-gray-600">Subido por:</span>
                                  <p className="font-medium">{getUserName(version.uploaded_by)}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Fecha:</span>
                                  <p className="font-medium">{version.uploaded_at ? new Date(version.uploaded_at).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Tamaño:</span>
                                  <p className="font-medium">{version.file_size ? (version.file_size / 1024 / 1024).toFixed(2) : 'N/A'} MB</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Tipo:</span>
                                  <p className="font-medium">{version.file_name?.split('.').pop()?.toUpperCase() || 'N/A'}</p>
                                </div>
                              </div>
                              
                              {version.changes && (
                                <div className="mb-3">
                                  <span className="text-gray-600 text-sm">Cambios realizados:</span>
                                  <p className="text-sm text-gray-700 bg-white p-2 rounded border mt-1">
                                    {version.changes}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => handleDownloadRecordFormat(selectedRecordForEntries)}
                                className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50"
                                title="Descargar esta versión"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              {userRole === 'admin' && !version.is_active && (
                                <button
                                  onClick={async () => {
                                    if (confirm('¿Activar esta versión? Se desactivará la versión actual.')) {
                                      try {
                                        console.log('🔄 Activando versión específica:', version.id);
                                        
                                        // 1. Desactivar todas las versiones del registro
                                        await DatabaseService.deactivateAllRecordVersions(selectedRecordForEntries.id);
                                        
                                        // 2. Activar la versión seleccionada
                                        await DatabaseService.activateRecordVersion(version.id);
                                        
                                        // 3. Actualizar el número de versión del record format
                                        await DatabaseService.updateRecordFormat(selectedRecordForEntries.id, {
                                          version: version.version_number
                                        });
                                        
                                        console.log('✅ Versión activada correctamente');
                                        alert('Versión activada correctamente');
                                        
                                        // 4. Recargar datos y cerrar modal
                                        await loadRecordFormats();
                                        setShowViewModal(false);
                                        
                                      } catch (error: any) {
                                        console.error('❌ Error activando versión:', error);
                                        alert(`Error activando versión: ${error.message}`);
                                      }
                                    }
                                  }}
                                  className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50"
                                  title="Activar esta versión"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {canUploadFilledRecords && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleUploadFilledRecord(selectedRecord);
                    }}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Subir Registro Lleno</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de subida de registro lleno */}
      {showFilledRecordModal && selectedRecord && canUploadFilledRecords && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Subir Registro Lleno</h2>
              </div>
              <button onClick={() => setShowFilledRecordModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleFilledRecordUpload} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900">Formato Base: {selectedRecord.nombre}</h3>
                  <p className="text-sm text-gray-600">Código: {selectedRecord.codigo} • Versión: v{selectedRecord.version}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Registro Lleno *
                  </label>
                  <input
                    type="text"
                    value={filledRecordForm.nombre}
                    onChange={(e) => setFilledRecordForm(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder={`Ej: ${selectedRecord.nombre} - Enero 2024`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Realización *
                  </label>
                  <input
                    type="date"
                    value={filledRecordForm.fechaRealizacion}
                    onChange={(e) => setFilledRecordForm(prev => ({ ...prev, fechaRealizacion: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas
                  </label>
                  <textarea
                    value={filledRecordForm.notes}
                    onChange={(e) => setFilledRecordForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows={3}
                    placeholder="Observaciones, comentarios adicionales..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Archivo del Registro Lleno *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Arrastra el archivo aquí o haz clic para seleccionar</p>
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => setFilledRecordForm(prev => ({ 
                        ...prev, 
                        file: e.target.files?.[0] || null 
                      }))}
                      className="hidden"
                      id="record-file-input"
                      required
                    />
                    <label 
                      htmlFor="record-file-input" 
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 cursor-pointer inline-block"
                    >
                      Seleccionar Archivo
                    </label>
                    {filledRecordForm.file && (
                      <p className="text-sm text-gray-600 mt-2">
                        Archivo seleccionado: {filledRecordForm.file.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 p-6">
                <div className="flex justify-end space-x-3">
                  <button 
                    type="button"
                    onClick={() => setShowFilledRecordModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={loading || !filledRecordForm.nombre || !filledRecordForm.fechaRealizacion || !filledRecordForm.file}
                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                  >
                    {loading ? 'Subiendo...' : 'Subir Registro Lleno'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de edición de registro lleno */}
      {showEditFilledRecordModal && selectedRecordEntry && canUploadFilledRecords && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Edit className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Editar Registro Lleno</h2>
              </div>
              <button onClick={() => setShowEditFilledRecordModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Registro Lleno
                </label>
                <input
                  type="text"
                  defaultValue={selectedRecordEntry?.nombre || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Realización
                </label>
                <input
                  type="date"
                  defaultValue={selectedRecordEntry?.fecha_realizacion || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivo Actual
                </label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedRecordEntry?.file_name}</p>
                  <p className="text-xs text-gray-500">Subido: {selectedRecordEntry?.uploaded_at}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reemplazar Archivo (opcional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-600 mb-2">Arrastra un nuevo archivo aquí</p>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    className="hidden"
                    id="edit-record-file-input"
                  />
                  <label 
                    htmlFor="edit-record-file-input" 
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 cursor-pointer inline-block"
                  >
                    Seleccionar
                  </label>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 p-6">
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={() => setShowEditFilledRecordModal(false)}
                  className="px-4 py-2 text-gray-600"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    alert('Registro lleno actualizado correctamente');
                    setShowEditFilledRecordModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modales de edición y nueva versión (solo para admin) */}
      {showEditModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Editar Registro: {selectedRecord.nombre}</h2>
              <button onClick={() => setShowEditModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <form onSubmit={handleEditRecordSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Registro
                    </label>
                    <input
                      type="text"
                      value={editRecordForm.nombre}
                      onChange={(e) => setEditRecordForm(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Código
                      </label>
                      <input
                        type="text"
                        value={editRecordForm.codigo}
                        onChange={(e) => setEditRecordForm(prev => ({ ...prev, codigo: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Versión
                      </label>
                      <input
                        type="text"
                        value={editRecordForm.version}
                        onChange={(e) => setEditRecordForm(prev => ({ ...prev, version: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Vencimiento
                    </label>
                    <input
                      type="date"
                      value={editRecordForm.fechaVencimiento}
                      onChange={(e) => setEditRecordForm(prev => ({ ...prev, fechaVencimiento: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas
                    </label>
                    <textarea
                      value={editRecordForm.notes}
                      onChange={(e) => setEditRecordForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-gray-600"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showVersionModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Nueva Versión: {selectedRecord.nombre}</h2>
              <button onClick={() => setShowVersionModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleNewVersionSubmit}>
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900">Versión Actual: v{selectedRecord.version}</h3>
                    <p className="text-sm text-gray-600">Se creará la versión v{newVersionForm.version}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Versión *
                    </label>
                    <input
                      type="text"
                      value={newVersionForm.version}
                      onChange={(e) => setNewVersionForm(prev => ({ ...prev, version: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ej: 2.0, 1.1"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Archivo del Registro *
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={(e) => setNewVersionForm(prev => ({ 
                        ...prev, 
                        file: e.target.files?.[0] || null 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                    {newVersionForm.file && (
                      <p className="text-sm text-gray-600 mt-1">
                        Archivo seleccionado: {newVersionForm.file.name}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción de Cambios *
                    </label>
                    <textarea
                      value={newVersionForm.changes}
                      onChange={(e) => setNewVersionForm(prev => ({ ...prev, changes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={3}
                      placeholder="Describe los cambios realizados en esta versión..."
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    type="button"
                    onClick={() => setShowVersionModal(false)}
                    className="px-4 py-2 text-gray-600"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Crear Nueva Versión
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordSection;