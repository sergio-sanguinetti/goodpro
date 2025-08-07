import React, { useState, useRef, useEffect } from 'react';
import { FileText, Plus, Download, Eye, Calendar, Edit, Trash2, MoreVertical, Upload, X, History, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import { Document, Project, Company, DocumentCategory, DocumentRole } from '../types';
import { DatabaseService } from '../services/database';
import { StorageService } from '../services/storage';
import { supabase } from '../lib/supabase';
import DocumentUploadModal from './DocumentUploadModal';
import { useAuth } from './AuthContext';
import { mockProjects, mockCompanies, mockDocumentCategories } from '../data/mockData';

interface DocumentSectionProps {
  selectedProjectId: string;
  userRole?: 'admin' | 'company_user';
  canEdit?: boolean;
  canDelete?: boolean;
  canUpload?: boolean;
  canView?: boolean;
  canDownload?: boolean;
}

const DocumentSection: React.FC<DocumentSectionProps> = ({ 
  selectedProjectId,
  userRole = 'admin',
  canEdit = true,
  canDelete = true,
  canUpload = true,
  canView = true,
  canDownload = true
}) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [editDocumentFile, setEditDocumentFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para roles en edición
  const [editElaborators, setEditElaborators] = useState<DocumentRole[]>([]);
  const [editReviewers, setEditReviewers] = useState<DocumentRole[]>([]);
  const [editApprovers, setEditApprovers] = useState<DocumentRole[]>([]);

  // Estados para roles en nueva versión
  const [versionElaborators, setVersionElaborators] = useState<DocumentRole[]>([]);
  const [versionReviewers, setVersionReviewers] = useState<DocumentRole[]>([]);
  const [versionApprovers, setVersionApprovers] = useState<DocumentRole[]>([]);

  // Cargar datos al cambiar proyecto
  useEffect(() => {
    if (selectedProjectId) {
      loadData();
    }
  }, [selectedProjectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [documentsData, projectsData, companiesData, categoriesData] = await Promise.all([
        DatabaseService.getDocumentsByProject(selectedProjectId),
        DatabaseService.getAllProjects(),
        DatabaseService.getCompanies(),
        DatabaseService.getDocumentCategories()
      ]);

      // Convertir formatos de base de datos a frontend
      const formattedDocuments = documentsData.map(doc => ({
        id: doc.id,
        nombre: doc.nombre,
        categoryId: doc.category_id,
        projectId: doc.project_id,
        version: doc.version,
        codigo: doc.codigo,
        fechaCreacion: doc.fecha_creacion,
        fechaVencimiento: doc.fecha_vencimiento,
        status: doc.status,
        versions: (doc.versions || []).map(v => ({
          id: v.id,
          versionNumber: v.version_number,
          fileName: v.file_name,
          fileSize: v.file_size,
          uploadedBy: v.uploaded_by,
          uploadedAt: v.uploaded_at,
          changes: v.changes,
          isActive: v.is_active,
          file_path: v.file_path
        })),
        elaborators: doc.roles?.filter(r => r.role === 'elaborator') || [],
        reviewers: doc.roles?.filter(r => r.role === 'reviewer') || [],
        approvers: doc.roles?.filter(r => r.role === 'approver') || [],
        createdBy: doc.created_by || '',
        approvedAt: doc.approved_at || undefined,
        notes: doc.notes || undefined
      }));

      console.log('🔄 Formatted documents:', formattedDocuments.map(doc => ({
        nombre: doc.nombre,
        versionsCount: doc.versions.length,
        activeVersion: doc.versions.find(v => v.isActive)?.fileName || 'NONE'
      })));
      
      setDocuments(formattedDocuments);
      setProjects(projectsData.map(p => ({
        id: p.id,
        sede: p.sede,
        descripcion: p.descripcion,
        companyId: p.company_id,
        fechaInicio: p.fecha_inicio,
        fechaFin: p.fecha_fin || undefined,
        status: p.status,
        contactPersons: [],
        createdAt: p.created_at,
        isActive: p.is_active
      })));
      setCompanies(companiesData.map(c => ({
        id: c.id,
        razonSocial: c.razon_social,
        ruc: c.ruc,
        contactPersons: [],
        createdAt: c.created_at,
        isActive: c.is_active
      })));
      setCategories(categoriesData.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
        normativeReference: cat.normative_reference || '',
        type: cat.type,
        isRequired: cat.is_required,
        renewalPeriodMonths: cat.renewal_period_months,
        createdAt: cat.created_at,
        isActive: cat.is_active
      })));
    } catch (error: any) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEditElaborator = () => {
    const newRole: DocumentRole = {
      id: `elaborator_${Date.now()}`,
      nombres: '',
      apellidos: '',
      email: '',
      role: 'elaborator'
    };
    setEditElaborators(prev => [...prev, newRole]);
  };

  const updateEditElaborator = (id: string, field: 'nombres' | 'apellidos' | 'email', value: string) => {
    setEditElaborators(prev => prev.map(role => 
      role.id === id ? { ...role, [field]: value } : role
    ));
  };

  const removeEditElaborator = (id: string) => {
    setEditElaborators(prev => prev.filter(role => role.id !== id));
  };

  const addEditReviewer = () => {
    const newRole: DocumentRole = {
      id: `reviewer_${Date.now()}`,
      nombres: '',
      apellidos: '',
      email: '',
      role: 'reviewer'
    };
    setEditReviewers(prev => [...prev, newRole]);
  };

  const updateEditReviewer = (id: string, field: 'nombres' | 'apellidos' | 'email', value: string) => {
    setEditReviewers(prev => prev.map(role => 
      role.id === id ? { ...role, [field]: value } : role
    ));
  };

  const removeEditReviewer = (id: string) => {
    setEditReviewers(prev => prev.filter(role => role.id !== id));
  };

  const addEditApprover = () => {
    const newRole: DocumentRole = {
      id: `approver_${Date.now()}`,
      nombres: '',
      apellidos: '',
      email: '',
      role: 'approver'
    };
    setEditApprovers(prev => [...prev, newRole]);
  };

  const updateEditApprover = (id: string, field: 'nombres' | 'apellidos' | 'email', value: string) => {
    setEditApprovers(prev => prev.map(role => 
      role.id === id ? { ...role, [field]: value } : role
    ));
  };

  const removeEditApprover = (id: string) => {
    setEditApprovers(prev => prev.filter(role => role.id !== id));
  };

  // Funciones para manejar roles en nueva versión
  const addVersionElaborator = () => {
    const newRole: DocumentRole = {
      id: `elaborator_${Date.now()}`,
      nombres: '',
      apellidos: '',
      email: '',
      role: 'elaborator'
    };
    setVersionElaborators(prev => [...prev, newRole]);
  };

  const updateVersionElaborator = (id: string, field: 'nombres' | 'apellidos' | 'email', value: string) => {
    setVersionElaborators(prev => prev.map(role => 
      role.id === id ? { ...role, [field]: value } : role
    ));
  };

  const removeVersionElaborator = (id: string) => {
    setVersionElaborators(prev => prev.filter(role => role.id !== id));
  };

  const addVersionReviewer = () => {
    const newRole: DocumentRole = {
      id: `reviewer_${Date.now()}`,
      nombres: '',
      apellidos: '',
      email: '',
      role: 'reviewer'
    };
    setVersionReviewers(prev => [...prev, newRole]);
  };

  const updateVersionReviewer = (id: string, field: 'nombres' | 'apellidos' | 'email', value: string) => {
    setVersionReviewers(prev => prev.map(role => 
      role.id === id ? { ...role, [field]: value } : role
    ));
  };

  const removeVersionReviewer = (id: string) => {
    setVersionReviewers(prev => prev.filter(role => role.id !== id));
  };

  const addVersionApprover = () => {
    const newRole: DocumentRole = {
      id: `approver_${Date.now()}`,
      nombres: '',
      apellidos: '',
      email: '',
      role: 'approver'
    };
    setVersionApprovers(prev => [...prev, newRole]);
  };

  const updateVersionApprover = (id: string, field: 'nombres' | 'apellidos' | 'email', value: string) => {
    setVersionApprovers(prev => prev.map(role => 
      role.id === id ? { ...role, [field]: value } : role
    ));
  };

  const removeVersionApprover = (id: string) => {
    setVersionApprovers(prev => prev.filter(role => role.id !== id));
  };

  const [editDocumentForm, setEditDocumentForm] = useState({
    nombre: '',
    codigo: '',
    version: '',
    fechaVencimiento: '',
    notes: ''
  });

  const [newVersionForm, setNewVersionForm] = useState({
    versionNumber: '',
    changes: ''
  });

  const filteredDocuments = documents.filter(doc => {
    // Todos los usuarios pueden ver documentos del proyecto seleccionado
    return doc.projectId === selectedProjectId;
  });

  const project = mockProjects.find(p => p.id === selectedProjectId);
  const company = mockCompanies.find(c => c.id === project?.companyId);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => setOpenActionMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleFileUpload = async () => {
    // Recargar documentos después de subir
    await loadData();
    setShowUploadModal(false);
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setShowViewModal(true);
    setOpenActionMenu(null);
  };

  const handleEditDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setEditDocumentForm({
      nombre: doc.nombre,
      codigo: doc.codigo,
      version: doc.version,
      fechaVencimiento: doc.fechaVencimiento,
      notes: doc.notes || ''
    });
    setEditElaborators(doc.elaborators || []);
    setEditReviewers(doc.reviewers || []);
    setEditApprovers(doc.approvers || []);
    setEditDocumentFile(null);
    setShowEditModal(true);
    setOpenActionMenu(null);
  };

  const handleNewVersion = (doc: Document) => {
    setSelectedDocument(doc);
    setNewVersionForm({
      versionNumber: '',
      changes: ''
    });
    setVersionElaborators(doc.elaborators || []);
    setVersionReviewers(doc.reviewers || []);
    setVersionApprovers(doc.approvers || []);
    setEditDocumentFile(null);
    setShowVersionModal(true);
    setOpenActionMenu(null);
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      console.log('📥 Intentando descargar documento:', doc.nombre);
      console.log('📋 Versiones disponibles:', doc.versions);
      console.log('👤 Usuario actual:', user);
      console.log('🏢 CompanyId del usuario:', user?.companyId);
      console.log('📂 ProjectId seleccionado:', selectedProjectId);
      
      const activeVersion = doc.versions.find(v => v.isActive);
      console.log('🎯 Versión activa encontrada:', activeVersion);
      
      if (activeVersion && activeVersion.file_path) {
        console.log('📂 Generando URL de descarga para:', activeVersion.file_path);
        console.log('📂 Tipo de ruta:', typeof activeVersion.file_path);
        console.log('📂 Longitud de ruta:', activeVersion.file_path.length);
        
        const downloadResult = await StorageService.getDownloadUrl('documents', activeVersion.file_path);
        console.log('🔗 Resultado URL descarga:', downloadResult);
        
        if (downloadResult.success && downloadResult.url) {
          console.log('✅ Abriendo URL de descarga:', downloadResult.url);
          // Abrir en nueva ventana para descarga
          window.open(downloadResult.url, '_blank');
        } else {
          console.error('❌ Error generando URL:', downloadResult.error);
          alert(`Error generando enlace de descarga: ${downloadResult.error}`);
        }
      } else {
        console.error('❌ No hay versión activa. Versiones:', doc.versions);
        console.error('❌ ¿Versión activa?:', activeVersion);
        alert(`No hay versión activa para descargar. Total versiones: ${doc.versions?.length || 0}`);
      }
    } catch (error: any) {
      console.error('Error descargando documento:', error);
      alert(`Error al descargar el documento: ${error.message}`);
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el documento "${doc.nombre}"?`)) {
      return;
    }
    
    try {
      // Eliminar físicamente el documento
      await DatabaseService.deleteDocument(doc.id);
      
      await loadData();
      alert('Documento eliminado correctamente');
    } catch (error: any) {
      console.error('Error eliminando documento:', error);
      alert(`Error eliminando documento: ${error.message}`);
    }
    setOpenActionMenu(null);
  };

  // Funciones de aprobación
  const handleApproveDocument = async (doc: Document) => {
    try {
      console.log('✅ DocumentSection.handleApproveDocument - Aprobando:', doc.id);
      await DatabaseService.updateDocument(doc.id, {
        status: 'approved',
        approved_by: user?.id,
        approved_at: new Date().toISOString()
      });
      console.log('✅ Documento aprobado en BD');
      
      // Actualizar estado local inmediatamente
      setDocuments(prev => prev.map(document => 
        document.id === doc.id 
          ? { ...document, status: 'approved', approvedAt: new Date().toISOString() }
          : document
      ));
      
      alert('Documento aprobado correctamente');
    } catch (error: any) {
      console.error('❌ Error aprobando documento:', error);
      alert(`Error aprobando documento: ${error.message}`);
    }
  };

  const handleRejectDocument = async (doc: Document) => {
    try {
      console.log('❌ DocumentSection.handleRejectDocument - Rechazando:', doc.id);
      await DatabaseService.updateDocument(doc.id, {
        status: 'rejected',
        approved_by: user?.id,
        approved_at: new Date().toISOString()
      });
      console.log('✅ Documento rechazado en BD');
      
      // Actualizar estado local inmediatamente
      setDocuments(prev => prev.map(document => 
        document.id === doc.id 
          ? { ...document, status: 'rejected', approvedAt: new Date().toISOString() }
          : document
      ));
      
      alert('Documento rechazado correctamente');
    } catch (error: any) {
      console.error('❌ Error rechazando documento:', error);
      alert(`Error rechazando documento: ${error.message}`);
    }
  };

  const handleSaveDocumentChanges = async () => {
    if (!selectedDocument) return;
    
    try {
      console.log('💾 Guardando cambios del documento:', editDocumentForm);
      
      // 1. Actualizar documento en BD
      await DatabaseService.updateDocument(selectedDocument.id, {
        nombre: editDocumentForm.nombre,
        codigo: editDocumentForm.codigo,
        version: editDocumentForm.version,
        fecha_vencimiento: editDocumentForm.fechaVencimiento,
        notes: editDocumentForm.notes
      });
      
      console.log('✅ Documento actualizado en BD');
      
      // 2. Si hay nuevo archivo, subir y crear nueva versión
      if (editDocumentFile) {
        console.log('📁 Subiendo nuevo archivo:', editDocumentFile.name);
        
        const uploadResult = await StorageService.uploadDocument(
          editDocumentFile,
          project?.companyId || '',
          selectedProjectId,
          selectedDocument.id,
          editDocumentForm.version
        );
        
        if (uploadResult.success && uploadResult.filePath) {
          console.log('📝 Creando nueva versión con archivo actualizado...');
          await DatabaseService.createDocumentVersion({
            document_id: selectedDocument.id,
            version_number: editDocumentForm.version,
            file_name: editDocumentFile.name,
            file_path: uploadResult.filePath,
            file_size: editDocumentFile.size,
            uploaded_by: user?.id || 'unknown',
            changes: 'Archivo actualizado desde edición',
            is_active: true
          });
          console.log('✅ Nueva versión creada');
        }
      }
      
      // 3. Actualizar roles si hay cambios
      const allRoles = [
        ...editElaborators.filter(e => e.nombres && e.apellidos && e.email),
        ...editReviewers.filter(r => r.nombres && r.apellidos && r.email),
        ...editApprovers.filter(a => a.nombres && a.apellidos && a.email)
      ];
      
      if (allRoles.length > 0) {
        console.log('👥 Actualizando roles del documento...');
        // Primero eliminar roles existentes
        await supabase.from('document_roles').delete().eq('document_id', selectedDocument.id);
        // Crear nuevos roles
        await DatabaseService.createDocumentRoles(selectedDocument.id, allRoles);
        console.log('✅ Roles actualizados');
      }
      
      alert('Documento actualizado correctamente');
      await loadData(); // Recargar datos
      setShowEditModal(false);
      setSelectedDocument(null);
      setEditDocumentFile(null);
    } catch (error: any) {
      console.error('❌ Error guardando cambios:', error);
      alert(`Error guardando cambios: ${error.message}`);
    }
  };

  const handleSaveNewVersion = async () => {
    if (!selectedDocument) return;
    
    if (!editDocumentFile || !newVersionForm.versionNumber) {
      alert('Debes subir un archivo y especificar el número de versión');
      return;
    }
    
    try {
      console.log('🆕 Creando nueva versión:', newVersionForm);
      
      // 1. Subir archivo al storage
      console.log('📁 Subiendo archivo de nueva versión:', editDocumentFile.name);
      const uploadResult = await StorageService.uploadDocument(
        editDocumentFile,
        project?.companyId || '',
        selectedProjectId,
        selectedDocument.id,
        newVersionForm.versionNumber
      );
      
      if (!uploadResult.success || !uploadResult.filePath) {
        throw new Error(`Error subiendo archivo: ${uploadResult.error}`);
      }
      
      console.log('✅ Archivo subido al storage:', uploadResult.filePath);
      
      // 2. Crear versión en BD
      console.log('📝 Creando versión en BD...');
      await DatabaseService.createDocumentVersion({
        document_id: selectedDocument.id,
        version_number: newVersionForm.versionNumber,
        file_name: editDocumentFile.name,
        file_path: uploadResult.filePath,
        file_size: editDocumentFile.size,
        uploaded_by: user?.id || 'unknown',
        changes: newVersionForm.changes,
        is_active: true
      });
      
      console.log('✅ Versión creada en BD');
      
      // 3. Actualizar documento con nueva versión
      await DatabaseService.updateDocument(selectedDocument.id, {
        version: newVersionForm.versionNumber
      });
      
      console.log('✅ Documento actualizado con nueva versión');
      
      // 4. Actualizar roles si hay cambios
      const allRoles = [
        ...versionElaborators.filter(e => e.nombres && e.apellidos && e.email),
        ...versionReviewers.filter(r => r.nombres && r.apellidos && r.email),
        ...versionApprovers.filter(a => a.nombres && a.apellidos && a.email)
      ];
      
      if (allRoles.length > 0) {
        console.log('👥 Actualizando roles...');
        // Eliminar roles existentes
        await supabase.from('document_roles').delete().eq('document_id', selectedDocument.id);
        // Crear nuevos roles
        await DatabaseService.createDocumentRoles(selectedDocument.id, allRoles);
        console.log('✅ Roles actualizados');
      }
      
      alert(`Nueva versión ${newVersionForm.versionNumber} creada correctamente`);
      await loadData(); // Recargar datos
      setShowVersionModal(false);
      setSelectedDocument(null);
      setEditDocumentFile(null);
    } catch (error: any) {
      console.error('❌ Error creando nueva versión:', error);
      alert(`Error creando nueva versión: ${error.message}`);
    }
  };

  // Funciones de drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setEditDocumentFile(droppedFiles[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setEditDocumentFile(e.target.files[0]);
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

  if (!selectedProjectId) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un proyecto</h3>
        <p className="text-gray-600">Para gestionar documentos, primero selecciona un proyecto.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">Documentos del Proyecto</h3>
          <p className="text-gray-600">{project?.sede} - {company?.razonSocial}</p>
        </div>
        {canUpload && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Subir Documento</span>
          </button>
        )}
      </div>

      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos</h3>
          <p className="text-gray-600 mb-4">Este proyecto aún no tiene documentos registrados.</p>
          {canUpload && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Subir Primer Documento
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md">
          <div className="divide-y divide-gray-200">
            {filteredDocuments.map(doc => {
              const category = mockDocumentCategories.find(cat => cat.id === doc.categoryId);
              const activeVersion = doc.versions.find(v => v.isActive);
              return (
                <div key={doc.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">{doc.nombre}</h4>
                            <p className="text-sm text-gray-600">{category?.name}</p>
                          </div>
                          <div className="text-sm">
                            <span className="font-mono text-gray-700">{doc.codigo}</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="font-mono text-gray-700">v{doc.version}</span>
                          </div>
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                              {getStatusText(doc.status)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span>Vence: {doc.fechaVencimiento}</span>
                          </div>
                          {activeVersion && (
                            <div className="text-xs text-blue-600">
                              {activeVersion.fileName}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {canView && (
                        <button 
                          onClick={() => handleViewDocument(doc)}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                        >
                          Ver
                        </button>
                      )}
                      {canDownload && (
                        <button 
                          onClick={() => handleDownloadDocument(doc)}
                          className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200 transition-colors"
                        >
                          Descargar
                        </button>
                      )}
                      {(canEdit || canDelete) && (
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionMenu(openActionMenu === doc.id ? null : doc.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 p-1"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openActionMenu === doc.id && (
                            <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48">
                              {canEdit && (
                                <button
                                  onClick={() => handleNewVersion(doc)}
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
                                    onClick={() => handleEditDocument(doc)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                    <span>Editar Documento</span>
                                  </button>
                                </>
                              )}
                              {canDelete && (
                                <>
                                  <div className="border-t border-gray-100"></div>
                                  <button
                                    onClick={() => handleDeleteDocument(doc)}
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
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de subida de documentos */}
      {canUpload && (
        <DocumentUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onFileUpload={handleFileUpload}
          projectId={selectedProjectId}
          companyId={project?.companyId || ''}
        />
      )}

      {/* Modal de vista de documento */}
      {showViewModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedDocument.nombre}</h2>
                  <p className="text-sm text-gray-600">
                    {categories.find(cat => cat.id === selectedDocument.categoryId)?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
                  <div className="space-y-3">
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDocument.status)}`}>
                        {getStatusText(selectedDocument.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vencimiento:</span>
                      <span className="font-medium">{selectedDocument.fechaVencimiento}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Elaborador:</span>
                      <span className="font-medium text-sm">
                        {selectedDocument.elaborators && selectedDocument.elaborators.length > 0 
                          ? `${selectedDocument.elaborators[0].nombres} ${selectedDocument.elaborators[0].apellidos}`
                          : 'No asignado'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revisor:</span>
                      <span className="font-medium text-sm">
                        {selectedDocument.reviewers && selectedDocument.reviewers.length > 0 
                          ? `${selectedDocument.reviewers[0].nombres} ${selectedDocument.reviewers[0].apellidos}`
                          : 'No asignado'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Aprobador:</span>
                      <span className="font-medium text-sm">
                        {selectedDocument.approvers && selectedDocument.approvers.length > 0 
                          ? `${selectedDocument.approvers[0].nombres} ${selectedDocument.approvers[0].apellidos}`
                          : 'No asignado'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Fechas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Creación:</span>
                      <span className="font-medium">{selectedDocument.fechaCreacion}</span>
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

              {/* Historial de versiones */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <History className="w-5 h-5" />
                  <span>Historial de Versiones</span>
                </h3>
                <div className="space-y-3">
                  {selectedDocument.versions.map((version) => (
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
                        {canDownload && (
                          <button
                            onClick={() => handleDownloadDocument(selectedDocument)}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Descargar versión"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                {canDownload && (
                  <button
                    onClick={() => handleDownloadDocument(selectedDocument)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar</span>
                  </button>
                )}
                
                {/* Botones de aprobación solo para admin */}
                {userRole === 'admin' && selectedDocument.status === 'pending_review' && (
                  <>
                    <button
                      onClick={() => handleApproveDocument(selectedDocument)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Aprobar</span>
                    </button>
                    <button
                      onClick={() => handleRejectDocument(selectedDocument)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Rechazar</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {canEdit && showEditModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Edit className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Editar Documento</h2>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Documento
                </label>
                <input
                  type="text"
                  value={editDocumentForm.nombre}
                  onChange={(e) => setEditDocumentForm(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código
                  </label>
                  <input
                    type="text"
                    value={editDocumentForm.codigo}
                    onChange={(e) => setEditDocumentForm(prev => ({ ...prev, codigo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Versión
                  </label>
                  <input
                    type="text"
                    value={editDocumentForm.version}
                    onChange={(e) => setEditDocumentForm(prev => ({ ...prev, version: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  value={editDocumentForm.fechaVencimiento}
                  onChange={(e) => setEditDocumentForm(prev => ({ ...prev, fechaVencimiento: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={editDocumentForm.notes}
                  onChange={(e) => setEditDocumentForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Observaciones adicionales..."
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Roles del Documento</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <RoleSection 
                    title="Elaboradores" 
                    roles={editElaborators} 
                    onAddRole={addEditElaborator}
                    onUpdateRole={updateEditElaborator}
                    onRemoveRole={removeEditElaborator}
                  />
                  <RoleSection 
                    title="Revisores" 
                    roles={editReviewers} 
                    onAddRole={addEditReviewer}
                    onUpdateRole={updateEditReviewer}
                    onRemoveRole={removeEditReviewer}
                  />
                  <RoleSection 
                    title="Aprobadores" 
                    roles={editApprovers} 
                    onAddRole={addEditApprover}
                    onUpdateRole={updateEditApprover}
                    onRemoveRole={removeEditApprover}
                  />
                </div>
              </div>

              {/* Cambio de archivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivo Adjunto
                </label>
                
                <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                      Archivo actual: {selectedDocument.versions.find(v => v.isActive)?.fileName || 'Sin archivo'}
                    </span>
                  </div>
                </div>

                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Arrastra un nuevo archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    Formatos soportados: PDF, DOC, DOCX, XLS, XLSX (máx. 10MB)
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm transition-colors"
                  >
                    Seleccionar Archivo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {editDocumentFile && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">{editDocumentFile.name}</p>
                          <p className="text-xs text-blue-600">
                            {(editDocumentFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditDocumentFile(null)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveDocumentChanges}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de nueva versión */}
      {canEdit && showVersionModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Nueva Versión</h2>
              </div>
              <button
                onClick={() => setShowVersionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Documento: {selectedDocument.nombre}</h3>
                <p className="text-sm text-gray-600">Versión actual: v{selectedDocument.version}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Nueva Versión *
                </label>
                <input
                  type="text"
                  value={newVersionForm.versionNumber}
                  onChange={(e) => setNewVersionForm(prev => ({ ...prev, versionNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ej: 2.0, 1.1, 3.0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción de Cambios *
                </label>
                <textarea
                  value={newVersionForm.changes}
                  onChange={(e) => setNewVersionForm(prev => ({ ...prev, changes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe los cambios realizados en esta versión..."
                  required
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Roles del Documento</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <RoleSection 
                    title="Elaboradores" 
                    roles={versionElaborators} 
                    onAddRole={addVersionElaborator}
                    onUpdateRole={updateVersionElaborator}
                    onRemoveRole={removeVersionElaborator}
                  />
                  <RoleSection 
                    title="Revisores" 
                    roles={versionReviewers} 
                    onAddRole={addVersionReviewer}
                    onUpdateRole={updateVersionReviewer}
                    onRemoveRole={removeVersionReviewer}
                  />
                  <RoleSection 
                    title="Aprobadores" 
                    roles={versionApprovers} 
                    onAddRole={addVersionApprover}
                    onUpdateRole={updateVersionApprover}
                    onRemoveRole={removeVersionApprover}
                  />
                </div>
              </div>

              {/* Subida de archivo obligatoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivo de Nueva Versión *
                </label>
                
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Arrastra el archivo de la nueva versión aquí
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    Formatos soportados: PDF, DOC, DOCX, XLS, XLSX (máx. 10MB)
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm transition-colors"
                  >
                    Seleccionar Archivo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {editDocumentFile && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-900">{editDocumentFile.name}</p>
                          <p className="text-xs text-green-600">
                            {(editDocumentFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditDocumentFile(null)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowVersionModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveNewVersion}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Crear Nueva Versión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente independiente para la sección de roles
const RoleSection = React.memo(({ 
  title, 
  roles, 
  onAddRole, 
  onUpdateRole, 
  onRemoveRole 
}: {
  title: string;
  roles: DocumentRole[];
  onAddRole: () => void;
  onUpdateRole: (id: string, field: 'nombres' | 'apellidos' | 'email', value: string) => void;
  onRemoveRole: (id: string) => void;
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-medium text-gray-700">{title}</label>
        <button
          type="button"
          onClick={onAddRole}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar</span>
        </button>
      </div>
      <div className="space-y-2">
        {roles.map(role => (
          <div key={role.id} className="grid grid-cols-12 gap-2 items-center">
            <input
              type="text"
              placeholder="Nombres"
              value={role.nombres || ''}
              onChange={(e) => onUpdateRole(role.id, 'nombres', e.target.value)}
              className="col-span-4 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Apellidos"
              value={role.apellidos || ''}
              onChange={(e) => onUpdateRole(role.id, 'apellidos', e.target.value)}
              className="col-span-4 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="email"
              placeholder="Email"
              value={role.email || ''}
              onChange={(e) => onUpdateRole(role.id, 'email', e.target.value)}
              className="col-span-3 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => onRemoveRole(role.id)}
              className="col-span-1 text-red-600 hover:text-red-800 p-1 flex justify-center"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        {roles.length === 0 && (
          <p className="text-sm text-gray-500 italic">No hay {title.toLowerCase()} asignados</p>
        )}
      </div>
    </div>
  );
});

RoleSection.displayName = 'RoleSection';

export default DocumentSection;