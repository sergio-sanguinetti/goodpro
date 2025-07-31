import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { DocumentRole, DocumentCategory } from '../types';
import { mockDocumentCategories } from '../data/mockData';

interface FileUploadProps {
  onFileUpload: (files: File[], category: string, projectId: string, documentData: any) => void;
  projectId: string;
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
  type: 'document' | 'record';
}

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
  onUpdateRole: (id: string, field: 'name' | 'email', value: string) => void;
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
              placeholder="Nombre completo"
              value={role.name || ''}
              onChange={(e) => onUpdateRole(role.id, 'name', e.target.value)}
              className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <input
              type="email"
              placeholder="correo@empresa.com"
              value={role.email || ''}
              onChange={(e) => onUpdateRole(role.id, 'email', e.target.value)}
              className="col-span-6 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              type="button"
              onClick={() => onRemoveRole(role.id)}
              className="col-span-1 text-red-600 hover:text-red-800 p-1 flex justify-center"
            >
              <Trash2 className="w-4 h-4" />
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

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, projectId, companyId, isOpen, onClose, type }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [documentName, setDocumentName] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [lifecycleStage, setLifecycleStage] = useState('Elaboración');
  const [elaborators, setElaborators] = useState<DocumentRole[]>([]);
  const [reviewers, setReviewers] = useState<DocumentRole[]>([]);
  const [approvers, setApprovers] = useState<DocumentRole[]>([]);
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = mockDocumentCategories.filter(cat => cat.isActive && cat.type === type);

  // Derive documentType from selected category
  const selectedCategory = categories.find(cat => cat.id === category);
  const documentType = selectedCategory?.type || type;

  // Funciones para manejar roles de elaboradores
  const addElaborator = () => {
    const newRole: DocumentRole = {
      id: `elaborator_${Date.now()}`,
      name: '',
      email: '',
      role: 'elaborator'
    };
    setElaborators(prev => [...prev, newRole]);
  };

  const updateElaborator = (id: string, field: 'name' | 'email', value: string) => {
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
      name: '',
      email: '',
      role: 'reviewer'
    };
    setReviewers(prev => [...prev, newRole]);
  };

  const updateReviewer = (id: string, field: 'name' | 'email', value: string) => {
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
      name: '',
      email: '',
      role: 'approver'
    };
    setApprovers(prev => [...prev, newRole]);
  };

  const updateApprover = (id: string, field: 'name' | 'email', value: string) => {
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
    if (!category || files.length === 0 || !documentName || !effectiveDate || !expirationDate) return;
    
    setUploading(true);
    setUploadStatus('idle');
    
    // Simular upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const documentData = {
        name: documentName,
        effectiveDate,
        expirationDate,
        lifecycleStage,
        elaborators: elaborators.filter(e => e.name && e.email),
        reviewers: reviewers.filter(r => r.name && r.email),
        approvers: approvers.filter(a => a.name && a.email)
      };
      onFileUpload(files, category, projectId, documentData);
      setUploadStatus('success');
      setTimeout(() => {
        setFiles([]);
        setCategory('');
        setDocumentName('');
        setEffectiveDate('');
        setExpirationDate('');
        setLifecycleStage('Elaboración');
        setElaborators([]);
        setReviewers([]);
        setApprovers([]);
        setUploadStatus('idle');
        onClose();
      }, 1500);
    } catch (error) {
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
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
              {type === 'document' ? 'Nombre del Documento' : 'Nombre del Registro'}
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
              Categoría Normativa
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar categoría...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} - {cat.normativeReference}
                </option>
              ))}
            </select>
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
              {type === 'document' ? 'Arrastra documentos aquí o haz clic para seleccionar' : 'Arrastra registros aquí o haz clic para seleccionar'}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Formatos soportados: PDF, DOC, DOCX, XLS, XLSX (máx. 10MB)
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
              <span>Archivos subidos exitosamente</span>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>Error al subir archivos. Intenta nuevamente.</span>
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
            disabled={!category || files.length === 0 || !documentName || !effectiveDate || !expirationDate || uploading}
            className={`text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              type === 'document' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {uploading 
              ? 'Subiendo...' 
              : type === 'document' 
                ? 'Subir Documentos' 
                : 'Subir Registros'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;