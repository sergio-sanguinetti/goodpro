import React, { useState } from 'react';
import { Plus, Edit, Trash2, FileText, FolderOpen, X } from 'lucide-react';
import { DocumentCategory } from '../types';
import { mockDocumentCategories } from '../data/mockData';

interface CategoryManagementProps {
  onClose: () => void;
}

// Modal extraído como componente independiente
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

const CategoryManagement: React.FC<CategoryManagementProps> = ({ onClose }) => {
  const [categories, setCategories] = useState<DocumentCategory[]>(mockDocumentCategories);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DocumentCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    normativeReference: '',
    type: 'document' as 'document' | 'record',
    isRequired: false,
    renewalPeriodMonths: 12
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, ...formData }
          : cat
      ));
    } else {
      const newCategory: DocumentCategory = {
        id: `cat_${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        isActive: true
      };
      setCategories(prev => [...prev, newCategory]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      normativeReference: '',
      type: 'document',
      isRequired: false,
      renewalPeriodMonths: 12
    });
    setEditingCategory(null);
    setShowModal(false);
  };

  const handleEdit = (category: DocumentCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      normativeReference: category.normativeReference,
      type: category.type,
      isRequired: category.isRequired,
      renewalPeriodMonths: category.renewalPeriodMonths
    });
    setShowModal(true);
  };

  const handleDelete = (categoryId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Gestión de Categorías</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">Gestiona las categorías de documentos y registros</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Categoría</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(category => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      category.type === 'document' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      {category.type === 'document' ? (
                        <FileText className="w-5 h-5 text-blue-600" />
                      ) : (
                        <FolderOpen className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.normativeReference}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
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
                    Renovación: {category.renewalPeriodMonths} meses
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <CategoryModal
          isOpen={showModal}
          onClose={resetForm}
          onSubmit={handleSubmit}
          editingCategory={editingCategory}
          formData={formData}
          setFormData={setFormData}
        />
      </div>
    </div>
  );
};

export default CategoryManagement;