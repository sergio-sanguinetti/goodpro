import React, { useState } from 'react';
import { FileText, FolderOpen, List } from 'lucide-react';
import DocumentSection from './DocumentSection';
import RecordSection from './RecordSection';

interface DocumentManagementProps {
  selectedProjectId: string;
  users: any[];
  userRole?: 'admin' | 'company_user';
  canEdit?: boolean;
  canDelete?: boolean;
  canUpload?: boolean;
  canView?: boolean;
  canDownload?: boolean;
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({
  selectedProjectId,
  users,
  userRole = 'admin',
  canEdit = true,
  canDelete = true,
  canUpload = true,
  canView = true,
  canDownload = true
}) => {
  const [activeTab, setActiveTab] = useState('documents');
  
  // Permisos para registros
  const canUploadNewFormats = userRole === 'admin';
  const canUploadFilledRecords = true;
  const canEditRecords = userRole === 'admin';
  const canDeleteRecords = userRole === 'admin';

  if (!selectedProjectId) {
    return (
      <div className="text-center py-12">
        <List className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un proyecto</h3>
        <p className="text-gray-600">Para gestionar documentos y registros, primero selecciona un proyecto.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Documentos y Registros</h2>
        <p className="text-gray-600">Administra documentos SST y formatos de registro</p>
      </div>

      {/* Tabs para alternar entre Documentos y Registros */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'documents'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Documentos
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'records'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FolderOpen className="w-4 h-4 inline mr-2" />
            Registros
          </button>
        </nav>
      </div>

      {/* Contenido según el tab activo */}
      {activeTab === 'documents' && (
        <DocumentSection 
          selectedProjectId={selectedProjectId}
          userRole={userRole}
          canEdit={canEdit}
          canDelete={canDelete}
          canUpload={canUpload}
          canView={canView}
          canDownload={canDownload}
        />
      )}
      
      {activeTab === 'records' && (
        <RecordSection
          selectedProjectId={selectedProjectId}
          users={users}
          userRole={userRole}
          canEdit={canEditRecords}
          canDelete={canDeleteRecords}
          canUploadNewFormats={canUploadNewFormats}
          canUploadFilledRecords={canUploadFilledRecords}
        />
      )}
    </div>
  );
};

export default DocumentManagement;