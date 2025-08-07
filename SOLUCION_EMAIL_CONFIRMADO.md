# Solución para el problema de confirmación de email

## Problema
El usuario `prueba@gmail.com` está activo en la base de datos pero no puede hacer login porque su email no está confirmado en Supabase Auth.

## Soluciones

### Opción 1: Confirmar email manualmente (Recomendado para usuarios existentes)

1. Ve al dashboard de Supabase
2. Navega a **Authentication > Users**
3. Busca el usuario `prueba@gmail.com`
4. Haz clic en el usuario
5. En la sección "Email", cambia el estado de "Unconfirmed" a "Confirmed"
6. Guarda los cambios

### Opción 2: Usar la nueva funcionalidad (Para usuarios nuevos)

He modificado el sistema para que:

1. **Al crear nuevos usuarios**: Se genera automáticamente una contraseña temporal
2. **El administrador recibe**: La contraseña temporal en un alert
3. **El usuario puede hacer login**: Con la contraseña temporal
4. **El usuario debe cambiar**: Su contraseña en el primer login

### Cambios implementados

1. **Campo temp_password**: Agregado a la tabla users para almacenar contraseñas temporales
2. **Generación automática**: Las contraseñas se generan automáticamente al crear usuarios
3. **Formulario actualizado**: No requiere contraseña para nuevos usuarios
4. **Mensaje informativo**: Explica el proceso al administrador

### Para aplicar los cambios de base de datos

Ejecuta la migración:
```bash
npx supabase db push
```

### Para usuarios existentes como `prueba@gmail.com`

1. Ve al dashboard de Supabase
2. Confirma manualmente el email del usuario
3. O crea un nuevo usuario con la nueva funcionalidad

### Próximos pasos

1. Aplicar la migración de base de datos
2. Probar la creación de un nuevo usuario
3. Verificar que el login funciona con la contraseña temporal
4. Implementar funcionalidad para cambiar contraseña en primer login

## Nota importante

El problema actual con `prueba@gmail.com` se puede resolver confirmando manualmente su email en el dashboard de Supabase, o creando un nuevo usuario con la nueva funcionalidad implementada.
