# 🔧 GUÍA DEBUG - VERIFICAR NETLIFY

## 🔍 **PASO 1: Verificar que la app esté subida**

### **📍 ¿Tienes una URL de Netlify funcionando?**
- ✅ **SÍ**: Algo como `https://amazing-name-123456.netlify.app`
- ❌ **NO**: Necesitas subir la carpeta `dist` primero

---

## 🔍 **PASO 2: Verificar variables de entorno**

### **📋 En Netlify dashboard:**
1. **🌐 Ir** a tu sitio en Netlify
2. **⚙️ Site settings**
3. **🔧 Build & deploy** → **Environment variables**

### **✅ Deben existir EXACTAMENTE estas 2 variables:**
```
VITE_SUPABASE_URL = https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsI...
```

### **🔑 Si no están, obtenerlas de Supabase:**
1. **🔧 Settings** → **API** en tu proyecto Supabase
2. **📋 Copiar:**
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`

---

## 🔍 **PASO 3: Redeploy después de variables**

### **🔄 Después de configurar variables:**
1. **🚀 Deploys** (pestaña principal)
2. **🔄 Trigger deploy** → **Deploy site**
3. **⏳ Esperar** 2-3 minutos

---

## 🔍 **PASO 4: Testing del login**

### **🌐 En tu app de Netlify:**
1. **📧 Email:** `juan.miguel@goodsolutions.pe`
2. **🔒 Password:** `0123456789juanmiguelGoodPro`
3. **🔐 Intentar login**

### **❌ Si da error:**
- **F12** → **Console** → **Ver errores**
- **📷 Screenshot** del error para ayudarte mejor

---

## 🚨 **PROBLEMAS COMUNES:**

### **❌ "Missing Supabase environment variables"**
- 🔧 Variables no configuradas en Netlify
- 🔄 Falta hacer redeploy después de configurar

### **❌ "Invalid login credentials"**
- 👤 Usuario no existe o no está confirmado
- 🔧 Ejecutar scripts de verificación en Supabase

### **❌ "Network error"**
- 🌐 URL de Supabase incorrecta
- 🔑 API Key incorrecta

---

## ✅ **CHECKLIST COMPLETO:**

- [ ] ✅ Usuario creado en Supabase Auth
- [ ] ✅ Perfil en tabla `users` con rol `admin`
- [ ] ✅ App subida a Netlify con URL funcionando
- [ ] ✅ Variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` configuradas
- [ ] ✅ Redeploy hecho después de configurar variables
- [ ] ✅ Login funcionando

**¿En qué paso estás ahora?** 🤔