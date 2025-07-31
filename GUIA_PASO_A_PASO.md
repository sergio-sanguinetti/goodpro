# 🚀 GUÍA PASO A PASO - CONFIGURAR GOODPRO

## 📍 **DONDE ESTÁS AHORA:**
- ✅ Ya creaste el usuario en Supabase Dashboard
- 🔧 Ahora necesitamos completar la configuración

---

## 1️⃣ **VERIFICAR USUARIO EN SUPABASE** (3 minutos)

### **📋 Paso 1.1: Abrir SQL Editor**
1. **🌐 Ir** a tu proyecto Supabase
2. **🔧 SQL Editor** (menú de la izquierda)
3. **➕ New query**

### **📋 Paso 1.2: Copiar y pegar este código:**
```sql
-- Verificar si el usuario existe
SELECT email, raw_user_meta_data->>'name' as name 
FROM auth.users 
WHERE email = 'juan.miguel@goodsolutions.pe';
```

### **📋 Paso 1.3: Ejecutar**
1. **▶️ RUN** (botón verde)
2. **📊 Ver resultado:**
   - ✅ **SI aparece el email**: ¡Genial! Continúa al paso 2
   - ❌ **SI está vacío**: Dime y te ayudo a solucionarlo

---

## 2️⃣ **CREAR PERFIL EN TABLA USERS** (2 minutos)

### **📋 Paso 2.1: Ejecutar este código:**
```sql
-- Crear perfil de administrador
INSERT INTO users (id, name, email, role) 
SELECT id, 'Juan Miguel - Admin GoodPro', email, 'admin'
FROM auth.users 
WHERE email = 'juan.miguel@goodsolutions.pe'
ON CONFLICT (id) DO UPDATE SET 
  name = 'Juan Miguel - Admin GoodPro',
  role = 'admin';
```

### **📋 Paso 2.2: Ejecutar**
1. **▶️ RUN**
2. **✅ Resultado:** Debe decir "INSERT 0 1" o similar

---

## 3️⃣ **OBTENER CREDENCIALES DE SUPABASE** (1 minuto)

### **📋 Paso 3.1: Ir a configuración**
1. **⚙️ Settings** (menú izquierdo)
2. **🔗 API** (submenu)

### **📋 Paso 3.2: Copiar estos 2 valores:**
```
Project URL: 
https://xxxxxxxxxxxxx.supabase.co
👆 Guardar este valor

anon public key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
👆 Guardar este valor (es muy largo)
```

---

## 4️⃣ **SUBIR APP A NETLIFY** (5 minutos)

### **📋 Paso 4.1: Abrir Netlify**
1. **🌐 Ir** a `netlify.com`
2. **🔐 Login** con tu cuenta
3. **🏠 Sites** (dashboard principal)

### **📋 Paso 4.2: Subir carpeta dist**
1. **📁 Buscar** la carpeta `dist` en tu computadora
2. **🖱️ Arrastrar** toda la carpeta `dist` a la zona que dice:
   ```
   "Want to deploy a new site without connecting to Git?
   Drag and drop your site output folder here"
   ```
3. **⏳ Esperar** 2-3 minutos
4. **🎉 Te dará** una URL como: `https://amazing-name-123456.netlify.app`

### **📋 Paso 4.3: Guardar la URL**
- **📝 Anotar** tu URL de Netlify para después

---

## 5️⃣ **CONFIGURAR VARIABLES EN NETLIFY** (3 minutos)

### **📋 Paso 5.1: Ir a configuración del sitio**
1. **⚙️ Site settings** (botón en tu sitio)
2. **🔧 Build & deploy** (menú lateral)
3. **🔧 Environment variables** (sección)

### **📋 Paso 5.2: Agregar primera variable**
1. **➕ Add variable**
2. **📝 Completar:**
   ```
   Key: VITE_SUPABASE_URL
   Value: [PEGAR TU PROJECT URL DE SUPABASE]
   ```
3. **💾 Create variable**

### **📋 Paso 5.3: Agregar segunda variable**
1. **➕ Add variable**
2. **📝 Completar:**
   ```
   Key: VITE_SUPABASE_ANON_KEY
   Value: [PEGAR TU ANON PUBLIC KEY DE SUPABASE]
   ```
3. **💾 Create variable**

---

## 6️⃣ **REDEPLOY NETLIFY** (2 minutos)

### **📋 Paso 6.1: Aplicar cambios**
1. **🚀 Deploys** (pestaña principal de tu sitio)
2. **🔄 Trigger deploy** → **Deploy site**
3. **⏳ Esperar** 2-3 minutos

---

## 7️⃣ **PROBAR LOGIN** (1 minuto)

### **📋 Paso 7.1: Abrir tu app**
1. **🌐 Abrir** tu URL de Netlify
2. **🔐 Intentar login con:**
   ```
   Email: juan.miguel@goodsolutions.pe
   Password: 0123456789juanmiguelGoodPro
   ```

### **📋 Paso 7.2: Resultado esperado**
- ✅ **SI FUNCIONA**: ¡Felicidades! Ya tienes GoodPro funcionando
- ❌ **SI NO FUNCIONA**: F12 → Console → Screenshot del error

---

## 🆘 **SI TIENES PROBLEMAS:**

### **📸 Mándame screenshot de:**
- 🔍 Error en consola del navegador (F12)
- ⚙️ Variables de entorno en Netlify
- 📊 Resultado de las consultas SQL

---

## 🎯 **RESUMEN RÁPIDO:**
1. ✅ **Verificar** usuario en Supabase con SQL
2. ✅ **Crear** perfil admin con SQL  
3. ✅ **Copiar** credenciales de Supabase
4. ✅ **Subir** carpeta `dist` a Netlify
5. ✅ **Configurar** 2 variables de entorno
6. ✅ **Redeploy** en Netlify
7. ✅ **Probar** login

**¿Empezamos con el paso 1️⃣?** 🚀