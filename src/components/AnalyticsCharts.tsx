import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Filter, BarChart3, TrendingUp, FileText, FolderOpen, Database } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { mockDocuments, mockRecordFormats, mockRecordEntries, mockProjects } from '../data/mockData';
import { User } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

interface AnalyticsChartsProps {
  user: User | null;
  documents?: any[];
  recordFormats?: any[];
  recordEntries?: any[];
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ user, documents, recordFormats, recordEntries }) => {
  const [dateRange, setDateRange] = useState<'3m' | '6m' | '1y' | 'all'>('6m');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  // Filtrar datos según el rol del usuario
  const filteredData = useMemo(() => {
    // Si se proporcionan datos reales, usarlos
    if (documents && recordFormats && recordEntries) {
      return {
        documents: documents,
        recordFormats: recordFormats,
        recordEntries: recordEntries
      };
    }
    
    // Fallback a datos mock si no hay datos reales
    if (user?.role === 'admin') {
      // Admin ve todos los datos
      return {
        documents: mockDocuments,
        recordFormats: mockRecordFormats,
        recordEntries: mockRecordEntries
      };
    } else if (user?.role === 'company_user' && user.companyId) {
      // Usuario empresa ve solo datos de su empresa
      const companyProjects = mockProjects.filter(p => p.companyId === user.companyId);
      const projectIds = companyProjects.map(p => p.id);
      
      return {
        documents: mockDocuments.filter(doc => projectIds.includes(doc.projectId)),
        recordFormats: mockRecordFormats.filter(format => projectIds.includes(format.projectId)),
        recordEntries: mockRecordEntries.filter(entry => {
          const format = mockRecordFormats.find(f => f.id === entry.formatId);
          return format && projectIds.includes(format.projectId);
        })
      };
    }
    
    return { documents: [], recordFormats: [], recordEntries: [] };
  }, [user, documents, recordFormats, recordEntries]);

  // Calcular rango de fechas
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case '3m':
        return new Date(now.getFullYear(), now.getMonth() - 3, 1);
      case '6m':
        return new Date(now.getFullYear(), now.getMonth() - 6, 1);
      case '1y':
        return new Date(now.getFullYear() - 1, now.getMonth(), 1);
      case 'all':
        return new Date(2024, 0, 1); // Desde enero 2024
      default:
        return new Date(now.getFullYear(), now.getMonth() - 6, 1);
    }
  };

  // Generar datos mensuales
  const generateMonthlyData = () => {
    const startDate = getDateRange();
    const endDate = new Date();
    const months = [];
    const documentsData = [];
    const recordFormatsData = [];
    const recordEntriesData = [];

    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      months.push(monthKey);

      // Contar documentos creados en este mes
      const docsCount = filteredData.documents.filter(doc => {
        const docDate = new Date(doc.fecha_creacion || doc.fechaCreacion);
        return docDate.getFullYear() === currentDate.getFullYear() && 
               docDate.getMonth() === currentDate.getMonth();
      }).length;

      // Contar registros base creados en este mes
      const formatsCount = filteredData.recordFormats.filter(format => {
        const formatDate = new Date(format.fecha_creacion || format.fechaCreacion);
        return formatDate.getFullYear() === currentDate.getFullYear() && 
               formatDate.getMonth() === currentDate.getMonth();
      }).length;

      // Contar registros llenos creados en este mes
      const entriesCount = filteredData.recordEntries.filter(entry => {
        const entryDate = new Date(entry.uploaded_at || entry.uploadedAt);
        return entryDate.getFullYear() === currentDate.getFullYear() && 
               entryDate.getMonth() === currentDate.getMonth();
      }).length;

      documentsData.push(docsCount);
      recordFormatsData.push(formatsCount);
      recordEntriesData.push(entriesCount);

      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }

    return {
      labels: months.map(month => {
        const [year, monthNum] = month.split('-');
        const date = new Date(parseInt(year), parseInt(monthNum) - 1);
        return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
      }),
      documentsData,
      recordFormatsData,
      recordEntriesData
    };
  };

  const monthlyData = generateMonthlyData();

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Actividad de ${user?.role === 'admin' ? 'Todo el Sistema' : 'la Empresa'} - ${
          dateRange === '3m' ? 'Últimos 3 meses' :
          dateRange === '6m' ? 'Últimos 6 meses' :
          dateRange === '1y' ? 'Último año' : 'Todo el período'
        }`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const chartData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Documentos',
        data: monthlyData.documentsData,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
      {
        label: 'Registros Base',
        data: monthlyData.recordFormatsData,
        backgroundColor: 'rgba(147, 51, 234, 0.5)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 2,
      },
      {
        label: 'Registros Llenos',
        data: monthlyData.recordEntriesData,
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 2,
      },
    ],
  };

  // Calcular totales para las métricas
  const totals = {
    documents: filteredData.documents.length,
    recordFormats: filteredData.recordFormats.length,
    recordEntries: filteredData.recordEntries.length,
    documentsThisMonth: filteredData.documents.filter(doc => {
      const docDate = new Date(doc.fecha_creacion || doc.fechaCreacion);
      const now = new Date();
      return docDate.getMonth() === now.getMonth() && docDate.getFullYear() === now.getFullYear();
    }).length,
    recordFormatsThisMonth: filteredData.recordFormats.filter(format => {
      const formatDate = new Date(format.fecha_creacion || format.fechaCreacion);
      const now = new Date();
      return formatDate.getMonth() === now.getMonth() && formatDate.getFullYear() === now.getFullYear();
    }).length,
    recordEntriesThisMonth: filteredData.recordEntries.filter(entry => {
      const entryDate = new Date(entry.uploaded_at || entry.uploadedAt);
      const now = new Date();
      return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Métricas de actividad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Documentos Creados</p>
              <p className="text-2xl font-bold text-blue-600">{totals.documents}</p>
              <p className="text-xs text-gray-500">+{totals.documentsThisMonth} este mes</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Registros Base</p>
              <p className="text-2xl font-bold text-purple-600">{totals.recordFormats}</p>
              <p className="text-xs text-gray-500">+{totals.recordFormatsThisMonth} este mes</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Registros Llenos</p>
              <p className="text-2xl font-bold text-orange-600">{totals.recordEntries}</p>
              <p className="text-xs text-gray-500">+{totals.recordEntriesThisMonth} este mes</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controles del gráfico */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Actividad por Mes
            </h3>
            {user?.role === 'company_user' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Solo mi empresa
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Selector de tipo de gráfico */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Tipo:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    chartType === 'bar' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Barras
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    chartType === 'line' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Líneas
                </button>
              </div>
            </div>

            {/* Selector de rango de fechas */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="3m">Últimos 3 meses</option>
                <option value="6m">Últimos 6 meses</option>
                <option value="1y">Último año</option>
                <option value="all">Todo el período</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gráfico */}
        <div className="h-96">
          {chartType === 'bar' ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <Line data={chartData} options={chartOptions} />
          )}
        </div>

        {/* Resumen de tendencias */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Documentos</span>
            </div>
            <p className="text-xs text-blue-600">
              Promedio: {(monthlyData.documentsData.reduce((a, b) => a + b, 0) / monthlyData.documentsData.length || 0).toFixed(1)} por mes
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <FolderOpen className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Registros Base</span>
            </div>
            <p className="text-xs text-purple-600">
              Promedio: {(monthlyData.recordFormatsData.reduce((a, b) => a + b, 0) / monthlyData.recordFormatsData.length || 0).toFixed(1)} por mes
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Registros Llenos</span>
            </div>
            <p className="text-xs text-orange-600">
              Promedio: {(monthlyData.recordEntriesData.reduce((a, b) => a + b, 0) / monthlyData.recordEntriesData.length || 0).toFixed(1)} por mes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;