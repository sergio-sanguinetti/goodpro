# 🔑 CREAR USUARIO ADMIN EN SUPABASE - GUÍA DEFINITIVA

## 🚨 **PROBLEMA IDENTIFICADO:**
Los scripts SQL directos no pueden crear usuarios en `auth.users` debido a restricciones de seguridad de Supabase.

## ✅ **SOLUCIÓN 1: Dashboard de Supabase (RECOMENDADA)**

### **📋 Pasos en tu proyecto Supabase:**

1. **🔧 Authentication** → **Users** (menú lateral)
2. **➕ Add user** (botón verde)
3. **📝 Completar formulario:**
   ```
   Email: juan.miguel@goodsolutions.pe
   Password: 0123456789juanmiguelGoodPro
   Email Confirm: ✅ (marcar)
   Auto Confirm User: ✅ (marcar)
   ```
4. **💾 Create User**

### **⚡ Resultado inmediato:**
- ✅ Usuario creado en `auth.users`
- ✅ Email confirmado automáticamente
- ✅ Listo para login

---

## ✅ **SOLUCIÓN 2: SQL con Función Supabase**

### **📄 Si prefieres SQL, ejecuta esto:**

```sql
-- Crear usuario usando función segura de Supabase
SELECT extensions.sign_up(
  'juan.miguel@goodsolutions.pe'::text,
  '0123456789juanmiguelGoodPro'::text,
  'email'::text,
  '{"name": "Juan Miguel - Admin GoodPro"}'::jsonb
);
```

**⚠️ Nota:** Esta función puede no estar disponible en todos los proyectos.

---

## ✅ **SOLUCIÓN 3: Desde la App (Manual)**

### **🌐 Una vez que tengas Netlify funcionando:**

1. **🌐 Abrir** tu app en Netlify
2. **📝 Registrarse** normalmente con el email
3. **🔧 SQL Editor** en Supabase:
   ```sql
   -- Cambiar el rol a admin después del registro
   UPDATE users 
   SET role = 'admin' 
   WHERE email = 'juan.miguel@goodsolutions.pe';
   ```

---

## 🎯 **RECOMENDACIÓN ACTUAL:**

### **📋 Hazlo desde Dashboard (Opción 1):**
1. **🔧 Authentication** → **Users** → **Add user**
2. **📝 Email:** `juan.miguel@goodsolutions.pe`
3. **🔒 Password:** `0123456789juanmiguelGoodPro`
4. **✅ Auto Confirm User:** Activado
5. **💾 Create User**

### **🔄 Después ejecutar este SQL:**
```sql
-- Asegurarse de que el perfil está correcto
INSERT INTO users (id, name, email, role) 
SELECT id, 'Juan Miguel - Admin GoodPro', email, 'admin'
FROM auth.users 
WHERE email = 'juan.miguel@goodsolutions.pe'
ON CONFLICT (id) DO UPDATE SET 
  name = 'Juan Miguel - Admin GoodPro',
  role = 'admin';
```

---

## 📱 **MIENTRAS TANTO - NETLIFY:**

### **🔑 Obtener credenciales:**
1. **🔧 Settings** → **API**
2. **📋 Copiar:**
   - `Project URL`: `https://xxxxx.supabase.co`
   - `anon public key`: `eyJhbGciOiJIUzI1NiIsI...`

### **📁 Si no subiste dist a Netlify:**
1. **🌐 netlify.com** → **Drag and drop**
2. **📂 Arrastrar** carpeta `dist` completa
3. **⏳ Esperar** 2-3 minutos

---

## 🎯 **¿QUÉ PREFIERES?**

**A)** 🖱️ Crear usuario desde Dashboard (2 minutos)
**B)** 💻 Probar SQL con función Supabase
**C)** 🌐 Subir a Netlify primero y crear después

**¿Cuál opción eliges?** 🤔