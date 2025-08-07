# Solución: Permisos de Usuarios de Empresa

## Problema
Los usuarios de empresa no podían ver ni descargar documentos, aunque como administrador sí funcionaba correctamente.

## Cambios Realizados

### 1. Modificaciones en App.tsx

**Archivo:** `src/App.tsx`

**Cambios:**
- Eliminé la redirección automática al `ClientPortal` para usuarios de empresa
- Agregué configuración automática de la empresa seleccionada para usuarios de empresa
- Modifiqué la navegación para mostrar solo "Proyectos" para usuarios de empresa
- Agregué permisos `canView` y `canDownload` al componente `DocumentManagement`

```typescript
// Antes: Usuarios empresa eran redirigidos a ClientPortal
if (user?.role === 'company_user') {
  return <ClientPortal clientId={user.companyId!} />
}

// Ahora: Usuarios empresa usan la misma interfaz con permisos limitados
if (user?.role === 'company_user') {
  useEffect(() => {
    if (user?.companyId && !selectedCompanyId) {
      setSelectedCompanyId(user.companyId);
    }
  }, [user?.companyId]);
}
```

### 2. Modificaciones en DocumentManagement.tsx

**Archivo:** `src/components/DocumentManagement.tsx`

**Cambios:**
- Agregué props `canView` y `canDownload` a la interfaz
- Pasé estos props al componente `DocumentSection`

```typescript
interface DocumentManagementProps {
  // ... props existentes
  canView?: boolean;
  canDownload?: boolean;
}
```

### 3. Modificaciones en DocumentSection.tsx

**Archivo:** `src/components/DocumentSection.tsx`

**Cambios:**
- Agregué props `canView` y `canDownload` a la interfaz
- Modifiqué la lógica de filtrado para que todos los usuarios vean documentos del proyecto
- Agregué condicionales para mostrar botones solo si el usuario tiene permisos
- Actualicé el modal de vista para respetar permisos de descarga

```typescript
// Antes: Filtrado restrictivo
const filteredDocuments = documents.filter(doc => {
  if (userRole === 'admin') {
    return doc.projectId === selectedProjectId;
  }
  return doc.projectId === selectedProjectId;
});

// Ahora: Todos pueden ver documentos del proyecto
const filteredDocuments = documents.filter(doc => {
  return doc.projectId === selectedProjectId;
});
```

### 4. Nueva Migración de Base de Datos

**Archivo:** `supabase/migrations/20250724180000_fix_user_permissions.sql`

**Cambios:**
- Simplifiqué las políticas RLS para documentos
- Simplifiqué las políticas RLS para versiones de documentos
- Simplifiqué las políticas de storage
- Aseguré que usuarios de empresa puedan ver documentos de su empresa

## Cómo Aplicar los Cambios

### 1. Código Frontend
Los cambios en el código frontend ya están aplicados. Los usuarios de empresa ahora:
- Usan la misma interfaz que los administradores
- Pueden ver todos los documentos de su empresa
- Pueden descargar documentos
- No pueden editar, eliminar o subir documentos (solo administradores)

### 2. Base de Datos
Para aplicar los cambios de permisos en la base de datos:

1. **Opción A: Usar Supabase CLI**
   ```bash
   npx supabase db push
   ```

2. **Opción B: Aplicar manualmente en Supabase Dashboard**
   - Ir a Supabase Dashboard
   - Navegar a SQL Editor
   - Ejecutar el contenido del archivo `supabase/migrations/20250724180000_fix_user_permissions.sql`

### 3. Verificar Configuración
Asegúrate de que:
- Los usuarios de empresa tengan `company_id` asignado correctamente
- Los proyectos estén asociados a la empresa correcta
- Los documentos estén asociados a proyectos de la empresa

## Resultado Esperado

Después de aplicar estos cambios:

1. **Administradores:**
   - Pueden ver todos los documentos de todas las empresas
   - Pueden editar, eliminar y subir documentos
   - Pueden descargar documentos

2. **Usuarios de Empresa:**
   - Pueden ver todos los documentos de su empresa
   - Pueden descargar documentos de su empresa
   - NO pueden editar, eliminar o subir documentos
   - Solo ven la pestaña "Proyectos" en lugar de "Empresas"

## Pruebas Recomendadas

1. **Como Administrador:**
   - Iniciar sesión como admin
   - Verificar que puede ver, editar y descargar documentos

2. **Como Usuario de Empresa:**
   - Iniciar sesión como usuario de empresa
   - Verificar que puede ver documentos de su empresa
   - Verificar que puede descargar documentos
   - Verificar que NO puede editar, eliminar o subir documentos

## Notas Importantes

- Los usuarios de empresa ahora usan la misma interfaz que los administradores
- La seguridad se mantiene a nivel de base de datos con RLS
- Los permisos de storage también están configurados para permitir descargas
- La navegación se simplifica para usuarios de empresa (solo ven "Proyectos")

## Troubleshooting

Si los usuarios de empresa siguen sin ver documentos:

1. Verificar que el usuario tenga `company_id` asignado
2. Verificar que los proyectos estén asociados a la empresa correcta
3. Verificar que las políticas RLS estén aplicadas correctamente
4. Revisar los logs de la consola del navegador para errores
