# 🔧 GUÍA: Configurar Variables de Entorno en Netlify

## 📋 **PASO A PASO DETALLADO:**

### **1️⃣ Subir la carpeta `dist` a Netlify:**

#### **🌐 Ir a Netlify:**
- Abrir navegador → `netlify.com`
- **Sign up** o **Log in** con tu cuenta

#### **📁 Subir sitio:**
- En el dashboard principal verás: **"Want to deploy a new site without connecting to Git?"**
- 📦 **Arrastrar** toda la carpeta `dist` al área que dice **"Drag and drop your site output folder here"**
- ⏳ **Esperar** 1-2 minutos mientras se sube
- 🎉 **¡Listo!** Te dará una URL como `https://amazing-name-123456.netlify.app`

---

### **2️⃣ Configurar Variables de Entorno:**

#### **🔧 Acceder a configuración:**
1. ⚙️ **Site settings** (botón en la página de tu sitio)
2. 🔧 **Build & deploy** → **Environment variables** (en el menú lateral)
3. ➕ **Add variable** (botón verde)

#### **🔑 Agregar primera variable:**
```
Variable name: VITE_SUPABASE_URL
Value: https://xxx.supabase.co
```
- 💾 **Save**

#### **🔑 Agregar segunda variable:**
```  
Variable name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
- 💾 **Save**

---

### **3️⃣ Redesplegar con variables:**

#### **🔄 Forzar redeploy:**
1. 🚀 **Deploys** (pestaña principal)
2. 🔄 **Trigger deploy** → **Deploy site**
3. ⏳ **Esperar** 2-3 minutos
4. ✅ **¡Variables aplicadas!**

---

## 📊 **¿Dónde obtener los valores de Supabase?**

### **🌐 En tu proyecto Supabase:**
1. 🔧 **Settings** → **API** (menú lateral)
2. 📋 **Copiar valores**:

```
Project URL: 
https://xxxxxxxxxxxxx.supabase.co
👆 Esto va en VITE_SUPABASE_URL

anon public key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
👆 Esto va en VITE_SUPABASE_ANON_KEY
```

---

## ✅ **Verificar que funciona:**

### **🔍 Testing post-deploy:**
1. 🌐 **Abrir tu URL** de Netlify
2. 🔐 **Intentar login** (debería conectar a Supabase)
3. 📊 **Ver dashboard** (debería cargar datos reales)

### **❌ Si no funciona:**
- 🔍 **F12** → **Console** → Ver errores
- ⚙️ **Revisar variables** estén bien escritas
- 🔄 **Redeploy** si modificaste algo

---

## 📱 **INTERFAZ VISUAL DE NETLIFY:**

```
🏠 Dashboard Principal
├── 📁 [Tu sitio] amazing-name-123456
│   ├── 🚀 Overview (URL del sitio)
│   ├── 🚀 Deploys (historial)
│   ├── ⚙️ Site settings 
│   │   ├── 🔧 Build & deploy
│   │   │   ├── 🔧 Environment variables ← AQUÍ
│   │   │   └── 🔧 Deploy settings
│   │   └── 🔧 Domain management
│   └── 📊 Analytics
```

---

## 🔗 **URLs importantes:**

- 🌐 **Tu sitio**: `https://amazing-name-123456.netlify.app`
- ⚙️ **Variables**: `https://app.netlify.com/sites/[sitename]/settings/deploys#environment-variables`
- 🚀 **Deploys**: `https://app.netlify.com/sites/[sitename]/deploys`

---

## 🆘 **Si tienes problemas:**

### **❌ Error "Missing Supabase environment variables":**
- ✅ Verificar que las variables estén escritas exactamente así
- ✅ Redeploy después de agregar variables
- ✅ No debe haber espacios extra en los valores

### **❌ Login no funciona:**
- ✅ Verificar que hayas ejecutado los scripts SQL en Supabase  
- ✅ Verificar que hayas creado el usuario admin
- ✅ Revisar Console del navegador para ver errores específicos

---

**🎯 En resumen:**
1. 📁 **Subir** carpeta `dist` → Netlify da URL
2. ⚙️ **Site settings** → **Environment variables** 
3. ➕ **Agregar** las 2 variables de Supabase
4. 🔄 **Redeploy** para aplicar cambios
5. ✅ **Testing** del login y funcionalidades

**¿Te ayudo con algún paso específico?** 🤔