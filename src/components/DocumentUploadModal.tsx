import React, { useState, useRef, useEffect } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { DocumentRole, DocumentCategory } from '../types';
import { DatabaseService } from '../services/database';
import { StorageService } from '../services/storage';
import { useAuth } from './AuthContext';

interface DocumentUploadModalProps {
  onFileUpload: (files: File[], category: string, projectId: string, documentData: any) => void;
  projectId: string;
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({ 
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
  const [documentName, setDocumentName] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [lifecycleStage, setLifecycleStage] = useState('Elaboración');
  const [documentCode, setDocumentCode] = useState('');
  const [documentVersion, setDocumentVersion] = useState('1.0');
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
      const documentCategories = categoriesData.filter(cat => 
        cat.is_active && cat.type === 'document'
      );
      setCategories(documentCategories);
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
    if (!category || files.length === 0 || !documentName || !effectiveDate || !expirationDate || !documentCode || !documentVersion) return;
    
    setUploading(true);
    setUploadStatus('idle');
    
    try {
      console.log('🚀 Iniciando upload de documento...');
      
      // Mapear lifecycleStage a status de base de datos
      const statusMapping = {
        'Elaboración': 'draft',
        'Revisión': 'pending_review', 
        'Aprobación': 'pending_review',
        'Vigente': 'approved',
        'Obsoleto': 'expired'
      };
      
      const mappedStatus = statusMapping[lifecycleStage] || 'draft';
      console.log('📊 Estado mapeado:', lifecycleStage, '->', mappedStatus);
      
      // 1. Crear documento en base de datos
      console.log('📄 Creando documento en BD...');
      const document = await DatabaseService.createDocument({
        nombre: documentName,
        codigo: documentCode,
        version: documentVersion,
        category_id: category,
        project_id: projectId,
        fecha_creacion: effectiveDate,
        fecha_vencimiento: expirationDate,
        status: mappedStatus,
        notes: notes,
        created_by: user?.id
      });
      
      console.log('✅ Documento creado con ID:', document.id);

      // 2. Subir archivos al storage
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📁 Subiendo archivo ${i + 1}/${files.length}:`, file.name);
        
        const uploadResult = await StorageService.uploadDocument(
          file,
          companyId,
          projectId,
          document.id,
          documentVersion
        );
        
        console.log('📤 Resultado upload:', uploadResult);

        if (uploadResult.success && uploadResult.filePath) {
          console.log('📝 Creando versión del documento...');
          // 3. Crear versión del documento
          await DatabaseService.createDocumentVersion({
            document_id: document.id,
            version_number: documentVersion,
            file_name: file.name,
            file_path: uploadResult.filePath,
            file_size: file.size,
            uploaded_by: user?.id || 'unknown',
            is_active: true
          });
          console.log('✅ Versión creada correctamente');
        } else {
          console.error('❌ Error en upload:', uploadResult.error);
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
        console.log('👥 Creando roles del documento...');
        console.log('📋 Roles a crear:', allRoles);
        console.log('📄 Document ID:', document.id);
        console.log('📋 Estructura de cada rol:');
        allRoles.forEach((role, index) => {
          console.log(`  Rol ${index + 1}:`, {
            nombres: role.nombres,
            apellidos: role.apellidos,
            email: role.email,
            role: role.role,
            id: role.id
          });
        });
        
        try {
          await DatabaseService.createDocumentRoles(document.id, allRoles);
          console.log('✅ Roles creados correctamente');
        } catch (roleError) {
          console.error('❌ Error creando roles:', roleError);
          console.error('📋 Datos de roles que causaron error:', allRoles);
          throw roleError;
        }
      } else {
        console.log('ℹ️ No hay roles para crear');
      }

      console.log('🎉 Upload completado exitosamente');
      setUploadStatus('success');
      
      // Llamar al callback para recargar datos
      if (onFileUpload) {
        onFileUpload(files, category, projectId, {
          name: documentName,
          code: documentCode,
          version: documentVersion,
          effectiveDate,
          expirationDate,
          lifecycleStage,
          elaborators,
          reviewers,
          approvers,
          changes: `Versión inicial del documento`,
          notes
        });
      }
      
      setTimeout(() => {
        resetForm();
      }, 1500);
    } catch (error) {
      console.error('❌ Error completo en upload:', error);
      setUploadStatus('error');
      alert(`Error subiendo documento: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setCategory('');
    setNormativeReference('');
    setDocumentName('');
    setDocumentCode('');
    setDocumentVersion('1.0');
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
          <h2 className="text-xl font-semibold text-gray-900">Subir Documentos</h2>
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
              Nombre del Documento
            </label>
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Política de SST 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Ley 29783 - Art. 17, ISO 45001 - 6.1.2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código del Documento *
              </label>
              <input
                type="text"
                value={documentCode}
                onChange={(e) => setDocumentCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: POL-SST-001"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Versión del Documento *
              </label>
              <input
                type="text"
                value={documentVersion}
                onChange={(e) => setDocumentVersion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: 1.0, 2.1"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Vigencia
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Observaciones, comentarios adicionales..."
            />
          </div>

          {/* Sección de Elaboradores */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Elaboradores
              </label>
              <button
                type="button"
                onClick={addElaborator}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                + Agregar
              </button>
            </div>
            {elaborators.length === 0 ? (
              <p className="text-sm text-gray-500">No hay elaboradores asignados</p>
            ) : (
              <div className="space-y-3">
                {elaborators.map((elaborator) => (
                  <div key={elaborator.id} className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={elaborator.nombres}
                      onChange={(e) => updateElaborator(elaborator.id, 'nombres', e.target.value)}
                      placeholder="Nombres"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={elaborator.apellidos}
                      onChange={(e) => updateElaborator(elaborator.id, 'apellidos', e.target.value)}
                      placeholder="Apellidos"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="email"
                      value={elaborator.email}
                      onChange={(e) => updateElaborator(elaborator.id, 'email', e.target.value)}
                      placeholder="Email"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeElaborator(elaborator.id)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sección de Revisores */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Revisores
              </label>
              <button
                type="button"
                onClick={addReviewer}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                + Agregar
              </button>
            </div>
            {reviewers.length === 0 ? (
              <p className="text-sm text-gray-500">No hay revisores asignados</p>
            ) : (
              <div className="space-y-3">
                {reviewers.map((reviewer) => (
                  <div key={reviewer.id} className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={reviewer.nombres}
                      onChange={(e) => updateReviewer(reviewer.id, 'nombres', e.target.value)}
                      placeholder="Nombres"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={reviewer.apellidos}
                      onChange={(e) => updateReviewer(reviewer.id, 'apellidos', e.target.value)}
                      placeholder="Apellidos"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="email"
                      value={reviewer.email}
                      onChange={(e) => updateReviewer(reviewer.id, 'email', e.target.value)}
                      placeholder="Email"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeReviewer(reviewer.id)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sección de Aprobadores */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Aprobadores
              </label>
              <button
                type="button"
                onClick={addApprover}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                + Agregar
              </button>
            </div>
            {approvers.length === 0 ? (
              <p className="text-sm text-gray-500">No hay aprobadores asignados</p>
            ) : (
              <div className="space-y-3">
                {approvers.map((approver) => (
                  <div key={approver.id} className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={approver.nombres}
                      onChange={(e) => updateApprover(approver.id, 'nombres', e.target.value)}
                      placeholder="Nombres"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={approver.apellidos}
                      onChange={(e) => updateApprover(approver.id, 'apellidos', e.target.value)}
                      placeholder="Apellidos"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="email"
                      value={approver.email}
                      onChange={(e) => updateApprover(approver.id, 'email', e.target.value)}
                      placeholder="Email"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeApprover(approver.id)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Zona de arrastre para archivos */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Arrastra documentos aquí o haz clic para seleccionar
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Formatos soportados: PDF, DOC, DOCX (máx. 10MB)
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Seleccionar Archivos
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx"
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
              <span>Documentos subidos exitosamente</span>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>Error al subir documentos. Intenta nuevamente.</span>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={!category || files.length === 0 || !documentName || !effectiveDate || !expirationDate || !documentCode || !documentVersion || uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Subiendo...' : 'Subir Documentos'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;