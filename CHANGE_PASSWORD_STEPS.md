# 🔑 CAMBIAR CONTRASEÑA DEL USUARIO EN SUPABASE

## 🎯 **PASOS EXACTOS DESDE LA PANTALLA QUE VES:**

### **🔧 PASO 1: Ir a configuración del usuario**
1. En la pantalla que tienes abierta, **busca arriba** un botón o tabs
2. Debe haber una sección **"User Settings"** o **"Details"**
3. O **busca** un botón **"Edit user"** o **"Update user"**

### **🔧 PASO 2: Localizar campo de contraseña**
En la configuración del usuario, busca:
- **"Password"** 
- **"Reset password"**
- **"Change password"**
- **"Update password"**

### **🔧 PASO 3: Cambiar contraseña**
1. **📝 Nueva contraseña:** `goodpro2025`
2. **💾 Save** o **Update user**

---

## 🚀 **ALTERNATIVA MÁS RÁPIDA:**

### **🔧 Desde SQL Editor:**
1. **🔧 SQL Editor** → **New query**
2. **📋 Copiar y ejecutar:**
```sql
-- Cambiar contraseña del usuario
UPDATE auth.users 
SET encrypted_password = crypt('goodpro2025', gen_salt('bf'))
WHERE email = 'juan.miguel@goodsolutions.pe';
```
3. **▶️ Run**

---

## 🧪 **TESTING:**
Después de cambiar:
1. **🌐 Refresh** tu app en Netlify
2. **🔐 Login** con:
   ```
   Email: juan.miguel@goodsolutions.pe
   Password: goodpro2025
   ```

---

**¿Puedes buscar en esa pantalla un botón "Edit user" o "Update user"?** 🔍

**O prefieres usar el SQL para cambiar la contraseña?** ⚡