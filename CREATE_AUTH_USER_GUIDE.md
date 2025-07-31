# 🔐 CREAR USUARIO EN SISTEMA DE AUTENTICACIÓN

## 🚨 **PROBLEMA IDENTIFICADO:**
- ✅ Usuario existe en tabla `users` 
- ❌ Usuario NO existe en `auth.users` (sistema de login)

## 🔧 **SOLUCIÓN: Authentication → Users**

### **📋 PASO 1: Crear en Authentication**
1. **🔐 Authentication** → **Users** (menú lateral en Supabase)
2. **➕ Add user** (botón verde)
3. **📝 Completar EXACTAMENTE:**
   ```
   Email: juan.miguel@goodsolutions.pe
   Password: 0123456789juanmiguelgoodpro
   ✅ Email Confirm (marcar)
   ✅ Auto Confirm User (marcar)
   ```
4. **💾 Create User**

### **🔗 PASO 2: Vincular con tabla users**
Después de crear el usuario en Authentication, ejecuta este SQL:

```sql
-- Actualizar la tabla users con el ID correcto del auth.users
UPDATE users 
SET id = (
  SELECT id FROM auth.users 
  WHERE email = 'juan.miguel@goodsolutions.pe'
)
WHERE email = 'juan.miguel@goodsolutions.pe';
```

### **🧪 PASO 3: Testing**
1. **🌐 Refresh** tu app en Netlify
2. **🔐 Intentar login** nuevamente
3. **✅ ¡Debería funcionar!**

---

## ⚡ **ALTERNATIVA RÁPIDA:**

Si el Authentication → Users también da error, puedes:
1. **🗑️ Borrar** el usuario actual de la tabla `users`
2. **📝 Registrarse** normalmente desde la app  
3. **🔧 SQL Editor**: Cambiar el rol a admin:
   ```sql
   UPDATE users SET role = 'admin' 
   WHERE email = 'juan.miguel@goodsolutions.pe';
   ```

---

**¿Prefieres crear desde Authentication → Users o usar la alternativa?** 🤔