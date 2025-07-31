import React, { useState } from 'react';
import { Bell, X, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';
import { useAuth } from './AuthContext';
import { mockCompanies, mockProjects, mockDocuments, mockRecordFormats } from '../data/mockData';

interface Notification {
  id: string;
  type: 'warning' | 'success' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  companyId?: string;
  projectId?: string;
  documentId?: string;
  recordId?: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToNotification?: (notification: Notification) => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, onNavigateToNotification }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'warning',
      title: 'Documento próximo a vencer',
      message: 'El Plan de Emergencia vence en 5 días',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      companyId: '1',
      projectId: '4',
      documentId: '6'
    },
    {
      id: '2',
      type: 'success',
      title: 'Documento aprobado',
      message: 'IPERC Línea Base ha sido aprobado',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: false,
      companyId: '2',
      projectId: '3',
      documentId: '3'
    },
    {
      id: '3',
      type: 'error',
      title: 'Documento vencido',
      message: 'Política de SST ha vencido',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
      companyId: '4',
      projectId: '7',
      documentId: '4'
    },
    {
      id: '4',
      type: 'info',
      title: 'Nuevo documento subido',
      message: 'Se ha subido un nuevo registro de capacitación',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      read: true,
      companyId: '1',
      projectId: '1',
      recordId: 're1'
    },
    {
      id: '5',
      type: 'warning',
      title: 'Registro próximo a vencer',
      message: 'Formato de inspecciones vence en 10 días',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      read: false,
      companyId: '1',
      projectId: '2',
      recordId: 'rf2'
    },
    {
      id: '6',
      type: 'success',
      title: 'Nuevo registro lleno',
      message: 'Se subió capacitación de primeros auxilios',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      read: false,
      companyId: '4',
      projectId: '8',
      recordId: 're10'
    },
    {
      id: '7',
      type: 'warning',
      title: 'Documento próximo a vencer',
      message: 'Reglamento Interno de SST vence en 3 días',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      read: false,
      companyId: '1',
      projectId: '4',
      documentId: '6'
    },
    {
      id: '8',
      type: 'info',
      title: 'Nueva versión disponible',
      message: 'Manual de Procedimientos SST v2.1 disponible',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      read: false,
      companyId: '1',
      projectId: '2',
      documentId: '5'
    },
    {
      id: '9',
      type: 'success',
      title: 'Registro completado',
      message: 'Inspección de EPP completada correctamente',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: false,
      companyId: '1',
      projectId: '1',
      recordId: 're11'
    },
    {
      id: '10',
      type: 'error',
      title: 'Documento rechazado',
      message: 'Plan de Respuesta ante Emergencias necesita revisión',
      timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000),
      read: false,
      companyId: '1',
      projectId: '5',
      documentId: '7'
    },
    {
      id: '11',
      type: 'info',
      title: 'Recordatorio de capacitación',
      message: 'Capacitación en alturas programada para mañana',
      timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000),
      read: true,
      companyId: '1',
      projectId: '1',
      recordId: 're1'
    },
    {
      id: '12',
      type: 'warning',
      title: 'Actualización requerida',
      message: 'IPERC necesita actualización trimestral',
      timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000),
      read: false,
      companyId: '1',
      projectId: '1',
      documentId: '2'
    },
    {
      id: '13',
      type: 'success',
      title: 'Audit completed',
      message: 'Auditoría interna finalizada exitosamente',
      timestamp: new Date(Date.now() - 13 * 60 * 60 * 1000),
      read: false,
      companyId: '1',
      projectId: '2',
      recordId: 'rf4'
    }
  ]);

  // Filtrar notificaciones según el rol del usuario
  const filteredNotifications = notifications.filter(notification => {
    if (user?.role === 'admin') {
      // Admin ve todas las notificaciones
      return true;
    } else if (user?.role === 'company_user' && user.companyId) {
      // Usuario empresa ve solo notificaciones de su empresa
      if (notification.companyId !== user.companyId) return false;
      
      // Si el usuario tiene acceso limitado, solo ve notificaciones de proyectos donde es contacto
      if (!user.permissions?.canViewAllCompanyProjects && notification.projectId) {
        const project = mockProjects.find(p => p.id === notification.projectId);
        if (project) {
          return project.contactPersons.some(contact => contact.email === user.email);
        }
      }
      
      return true;
    }
    return false;
  });

  // Función para obtener información de la empresa
  const getCompanyInfo = (companyId?: string) => {
    if (!companyId) return null;
    return mockCompanies.find(c => c.id === companyId);
  };

  // Función para obtener información del proyecto
  const getProjectInfo = (projectId?: string) => {
    if (!projectId) return null;
    return mockProjects.find(p => p.id === projectId);
  };
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'info': return <FileText className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBg = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const handleNotificationClick = (notification: Notification) => {
    // Marcar como leída automáticamente
    markAsRead(notification.id);
    
    // Navegar si hay callback
    if (onNavigateToNotification) {
      onNavigateToNotification(notification);
      onClose(); // Cerrar modal después de navegar
    }
  };
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `hace ${days} día${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else {
      return 'hace unos minutos';
    }
  };

  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[70vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {filteredNotifications.length > 0 && unreadCount > 0 && (
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <button
              onClick={markAllAsRead}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Marcar todas como leídas
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0 max-h-full">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center flex-shrink-0">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map(notification => {
                const company = getCompanyInfo(notification.companyId);
                const project = getProjectInfo(notification.projectId);
                
                return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors flex-shrink-0 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          
                          {/* Información adicional para admin */}
                          {user?.role === 'admin' && (company || project) && (
                            <div className="mt-2 text-xs text-gray-500 space-y-1">
                              {company && (
                                <div className="flex items-center space-x-1">
                                  <span className="font-medium">Empresa:</span>
                                  <span>{company.razonSocial}</span>
                                </div>
                              )}
                              {project && (
                                <div className="flex items-center space-x-1">
                                  <span className="font-medium">Proyecto:</span>
                                  <span>{project.sede}</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Información de proyecto para usuario empresa (si aplica) */}
                          {user?.role === 'company_user' && project && (
                            <div className="mt-2 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">Proyecto:</span>
                                <span>{project.sede}</span>
                              </div>
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-500 mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                          
                          {/* Indicador de que es clickeable */}
                          <p className="text-xs text-blue-600 mt-1 font-medium">
                            Hacer clic para ver →
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              Marcar leída
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;