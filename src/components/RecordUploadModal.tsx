import React, { useState, useRef, useEffect } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { DocumentRole, DocumentCategory } from '../types';
import { DatabaseService } from '../services/database';
import { StorageService } from '../services/storage';
import { useAuth } from './AuthContext';

interface RecordUploadModalProps {
  onFileUpload: (files: File[], category: string, projectId: string, recordData: any) => void;
  projectId: string;
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
}

const RecordUploadModal: React.FC<RecordUploadModalProps> = ({ 
  onFileUpload, 
  projectId, 
  companyId, 
  isOpen, 
  onClose 
}) => {
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [recordName, setRecordName] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [lifecycleStage, setLifecycleStage] = useState('Elaboración');
  const [recordCode, setRecordCode] = useState('');
  const [recordVersion, setRecordVersion] = useState('1.0');
  const [normativeReference, setNormativeReference] = useState('');
  const [elaborators, setElaborators] = useState<DocumentRole[]>([]);
  const [reviewers, setReviewers] = useState<DocumentRole[]>([]);
  const [approvers, setApprovers] = useState<DocumentRole[]>([]);
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);

  // Cargar categorías al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const categoriesData = await DatabaseService.getDocumentCategories();
      const recordCategories = categoriesData.filter(cat => 
        cat.is_active && cat.type === 'record'
      );
      setCategories(recordCategories);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  // Funciones para manejar roles de elaboradores
  const addElaborator = () => {
    const newRole: DocumentRole = {
      id: `elaborator_${Date.now()}`,
      nombres: '',
      apellidos: '',
      email: '',
      role: 'elaborator'
    };
    setElaborators(prev => [...prev, newRole]);
  };

  const updateElaborator = (id: string, field: 'nombres' | 'apellidos' | 'email', value: string) => {
    setElaborators(prev => prev.map(role => 
      role.id === id ? { ...role, [field]: value } : role
    ));
  };

  const removeElaborator = (id: string) => {
    setElaborators(prev => prev.filter(role => role.id !== id));
  };

  // Funciones para manejar roles de revisores
  const addReviewer = () => {
    const newRole: DocumentRole = {
      id: `reviewer_${Date.now()}`,
      nombres: '',
      apellidos: '',
      email: '',
      role: 'reviewer'
    };
    setReviewers(prev => [...prev, newRole]);
  };

  const updateReviewer = (id: string, field: 'nombres' | 'apellidos' | 'email', value: string) => {
    setReviewers(prev => prev.map(role => 
      role.id === id ? { ...role, [field]: value } : role
    ));
  };

  const removeReviewer = (id: string) => {
    setReviewers(prev => prev.filter(role => role.id !== id));
  };

  // Funciones para manejar roles de aprobadores
  const addApprover = () => {
    const newRole: DocumentRole = {
      id: `approver_${Date.now()}`,
      nombres: '',
      apellidos: '',
      email: '',
      role: 'approver'
    };
    setApprovers(prev => [...prev, newRole]);
  };

  const updateApprover = (id: string, field: 'nombres' | 'apellidos' | 'email', value: string) => {
    setApprovers(prev => prev.map(role => 
      role.id === id ? { ...role, [field]: value } : role
    ));
  };

  const removeApprover = (id: string) => {
    setApprovers(prev => prev.filter(role => role.id !== id));
  };

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
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!category || files.length === 0 || !recordName || !effectiveDate || !expirationDate || !recordCode || !recordVersion) {
      alert('Por favor completa todos los campos requeridos y selecciona al menos un archivo');
      return;
    }
    
    setUploading(true);
    setUploadStatus('idle');
    
    try {
      console.log('🚀 RecordUploadModal.handleUpload - Iniciando...');
      console.log('📋 Datos del formulario:', {
        recordName,
        recordCode,
        recordVersion,
        category,
        projectId,
        effectiveDate,
        expirationDate,
        lifecycleStage,
        filesCount: files.length
      });
      
      // Mapear lifecycleStage a status de base de datos
      const statusMapping = {
        'Elaboración': 'draft',
        'Revisión': 'pending_review', 
        'Aprobación': 'pending_review',
        'Vigente': 'approved',
        'Obsoleto': 'expired'
      };
      
      const mappedStatus = statusMapping[lifecycleStage] || 'draft';
      console.log('📊 RecordUploadModal - Estado mapeado:', lifecycleStage, '->', mappedStatus);
      
      // 1. Crear record format en base de datos
      console.log('📄 RecordUploadModal - Creando record format en BD...');
      const recordFormat = await DatabaseService.createRecordFormat({
        nombre: recordName,
        codigo: recordCode,
        version: recordVersion,
        category_id: category,
        project_id: projectId,
        fecha_creacion: effectiveDate,
        fecha_vencimiento: expirationDate,
        status: mappedStatus,
        notes: notes,
        created_by: user?.id
      });
      
      console.log('✅ RecordUploadModal - Record format creado con ID:', recordFormat.id);

      // 2. Subir archivos al storage
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📁 RecordUploadModal - Subiendo archivo ${i + 1}/${files.length}:`, file.name);
        
        const uploadResult = await StorageService.uploadRecord(
          file,
          companyId,
          projectId,
          recordFormat.id,
          recordVersion
        );
        
        console.log('📤 RecordUploadModal - Resultado upload:', uploadResult);

        if (uploadResult.success && uploadResult.filePath) {
          console.log('📝 RecordUploadModal - Creando versión del record format...');
          // 3. Crear versión del record format
          await DatabaseService.createRecordFormatVersion({
            record_format_id: recordFormat.id,
            version_number: recordVersion,
            file_name: file.name,
            file_path: uploadResult.filePath,
            file_size: file.size,
            uploaded_by: user?.id || 'unknown',
            is_active: true,
            changes: 'Versión inicial del registro base'
          });
          console.log('✅ RecordUploadModal - Versión creada correctamente');
        } else {
          console.error('❌ RecordUploadModal - Error en upload:', uploadResult.error);
          throw new Error(`Error subiendo archivo: ${uploadResult.error}`);
        }
      }

      // 4. Crear roles si existen
      const allRoles = [
        ...elaborators.filter(e => e.nombres && e.apellidos && e.email),
        ...reviewers.filter(r => r.nombres && r.apellidos && r.email),
        ...approvers.filter(a => a.nombres && a.apellidos && a.email)
      ];

      if (allRoles.length > 0) {
        console.log('👥 RecordUploadModal - Creando roles del record format...');
        await DatabaseService.createRecordFormatRoles(recordFormat.id, allRoles);
        console.log('✅ RecordUploadModal - Roles creados correctamente');
      }

      console.log('🎉 RecordUploadModal - Upload completado exitosamente');
      setUploadStatus('success');
      
      // Llamar al callback para recargar datos
      console.log('🔄 RecordUploadModal - Llamando callback onFileUpload...');
      await onFileUpload(files, category, projectId, {
        name: recordName,
        code: recordCode,
        version: recordVersion,
        normativeReference,
        effectiveDate,
        expirationDate,
        lifecycleStage,
        elaborators,
        reviewers,
        approvers,
        changes: `Versión inicial del registro base`,
        notes
      });
      console.log('✅ RecordUploadModal - Callback completado');
      
      alert('Registro base creado exitosamente');
      
      setTimeout(() => {
        resetForm();
      }, 1000);
    } catch (error) {
      console.error('❌ RecordUploadModal - Error completo:', error);
      setUploadStatus('error');
      alert(`Error creando registro: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    console.log('🔄 RecordUploadModal - Reseteando formulario...');
    setFiles([]);
    setCategory('');
    setNormativeReference('');
    setRecordName('');
    setRecordCode('');
    setRecordVersion('1.0');
    setEffectiveDate('');
    setExpirationDate('');
    setLifecycleStage('Elaboración');
    setElaborators([]);
    setReviewers([]);
    setApprovers([]);
    setNotes('');
    setUploadStatus('idle');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Subir Registro Base</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Registro *
            </label>
            <input
              type="text"
              value={recordName}
              onChange={(e) => setRecordName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ej: Registro de Capacitaciones"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              <option value="">Seleccionar categoría...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referencia Normativa
            </label>
            <input
              type="text"
              value={normativeReference}
              onChange={(e) => setNormativeReference(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ej: Ley 29783 - Art. 27, ISO 45001 - 6.1.2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código del Registro *
              </label>
              <input
                type="text"
                value={recordCode}
                onChange={(e) => setRecordCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej: REG-CAP-001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Versión del Registro *
              </label>
              <input
                type="text"
                value={recordVersion}
                onChange={(e) => setRecordVersion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej: 1.0, 2.1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Vigencia *
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Vencimiento *
              </label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ciclo de Vida
            </label>
            <select
              value={lifecycleStage}
              onChange={(e) => setLifecycleStage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="Elaboración">Elaboración</option>
              <option value="Revisión">Revisión</option>
              <option value="Aprobación">Aprobación</option>
              <option value="Vigente">Vigente</option>
              <option value="Obsoleto">Obsoleto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              placeholder="Observaciones, comentarios adicionales..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <RoleSection 
              title="Elaboradores" 
              roles={elaborators} 
              onAddRole={addElaborator}
              onUpdateRole={updateElaborator}
              onRemoveRole={removeElaborator}
            />
            <RoleSection 
              title="Revisores" 
              roles={reviewers} 
              onAddRole={addReviewer}
              onUpdateRole={updateReviewer}
              onRemoveRole={removeReviewer}
            />
            <RoleSection 
              title="Aprobadores" 
              roles={approvers} 
              onAddRole={addApprover}
              onUpdateRole={updateApprover}
              onRemoveRole={removeApprover}
            />
          </div>

          {/* Zona de arrastre para archivos */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Arrastra formatos de registro aquí o haz clic para seleccionar
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Formatos soportados: PDF, DOC, DOCX, XLS, XLSX (máx. 10MB)
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Seleccionar Archivos
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Archivos seleccionados:</h3>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <File className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span>Registro base creado exitosamente</span>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>Error al crear registro. Intenta nuevamente.</span>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!category || files.length === 0 || !recordName || !effectiveDate || !expirationDate || !recordCode || !recordVersion || uploading}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creando Registro...</span>
              </div>
            ) : (
              'Crear Registro Base'
            )}
          </button>
        </div>
      </div>
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
          className="text-purple-600 hover:text-purple-800 text-sm flex items-center space-x-1"
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
              className="col-span-4 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Apellidos"
              value={role.apellidos || ''}
              onChange={(e) => onUpdateRole(role.id, 'apellidos', e.target.value)}
              className="col-span-4 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-purple-500 focus:border-transparent"
            />
            <input
              type="email"
              placeholder="Email"
              value={role.email || ''}
              onChange={(e) => onUpdateRole(role.id, 'email', e.target.value)}
              className="col-span-3 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-purple-500 focus:border-transparent"
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

export default RecordUploadModal;