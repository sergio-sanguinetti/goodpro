import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { DocumentCategory } from '../types';

interface DocumentRecordFiltersProps {
  categories: DocumentCategory[];
  onFiltersChange: (filters: FilterState) => void;
  type: 'documents' | 'records';
}

export interface FilterState {
  searchTerm: string;
  selectedCategory: string;
  selectedStatus: string;
  expirationDateFrom: string;
  expirationDateTo: string;
}

const DocumentRecordFilters: React.FC<DocumentRecordFiltersProps> = ({
  categories,
  onFiltersChange,
  type
}) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    selectedCategory: '',
    selectedStatus: '',
    expirationDateFrom: '',
    expirationDateTo: ''
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Estados disponibles para documentos y registros
  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'draft', label: 'Borrador' },
    { value: 'pending_review', label: 'En Revisión' },
    { value: 'approved', label: 'Aprobado' },
    { value: 'expired', label: 'Vencido' },
    { value: 'rejected', label: 'Rechazado' }
  ];

  // Filtrar categorías por tipo
  const filteredCategories = categories.filter(cat => {
    if (type === 'documents') return cat.type === 'document';
    if (type === 'records') return cat.type === 'record';
    return true; // Si no hay tipo específico, mostrar todas
  });

  // Aplicar filtros cuando cambien
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (field: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    const clearedFilters = {
      searchTerm: '',
      selectedCategory: '',
      selectedStatus: '',
      expirationDateFrom: '',
      expirationDateTo: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      {/* Filtros principales */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Búsqueda por nombre */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Buscar ${type === 'documents' ? 'documentos' : 'registros'} por nombre...`}
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filtro por categoría */}
        <div className="sm:w-48">
          <select
            value={filters.selectedCategory}
            onChange={(e) => handleFilterChange('selectedCategory', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            {filteredCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por estado */}
        <div className="sm:w-48">
          <select
            value={filters.selectedStatus}
            onChange={(e) => handleFilterChange('selectedStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Botón para filtros avanzados */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`px-4 py-2 rounded-lg border transition-colors flex items-center space-x-2 ${
            showAdvancedFilters
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
        </button>

        {/* Botón para limpiar filtros */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* Filtros avanzados */}
      {showAdvancedFilters && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Filtro por fecha de vencimiento desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vence desde
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.expirationDateFrom}
                  onChange={(e) => handleFilterChange('expirationDateFrom', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por fecha de vencimiento hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vence hasta
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={filters.expirationDateTo}
                  onChange={(e) => handleFilterChange('expirationDateTo', e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Resumen de filtros activos */}
          {hasActiveFilters && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Filtros activos:</span>
                </div>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Limpiar todos
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {filters.searchTerm && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Nombre: {filters.searchTerm}
                  </span>
                )}
                {filters.selectedCategory && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Categoría: {filteredCategories.find(c => c.id === filters.selectedCategory)?.name}
                  </span>
                )}
                {filters.selectedStatus && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Estado: {statusOptions.find(s => s.value === filters.selectedStatus)?.label}
                  </span>
                )}
                {filters.expirationDateFrom && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Vence desde: {filters.expirationDateFrom}
                  </span>
                )}
                {filters.expirationDateTo && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    Vence hasta: {filters.expirationDateTo}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentRecordFilters;
