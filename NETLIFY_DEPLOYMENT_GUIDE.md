# 🚀 GUÍA PASO A PASO - SUBIR A NETLIFY

## 📦 **CARPETA `dist/` LISTA PARA NETLIFY**

La carpeta `dist/` ya está generada y optimizada con:
- ✅ **Conexión** a tu Supabase
- ✅ **Interfaz** profesional nueva
- ✅ **Todas las funcionalidades** operativas

---

## 🌐 **PASO 1: Subir a Netlify (2 minutos)**

### **📁 Deploy manual:**
1. **🌐 Ir a:** [netlify.com](https://netlify.com)
2. **🔐 Login** con tu cuenta
3. **🏠 Sites** → **Add new site**
4. **📂 Deploy manually** 
5. **🖱️ ARRASTRAR** toda la carpeta `dist/` al área que dice:
   ```
   "Want to deploy a new site without connecting to Git?
   Drag and drop your site output folder here"
   ```
6. **⏳ Esperar 1-2 minutos**
7. **🎉 ¡Sitio creado!** Te dará una URL como: `https://amazing-name-123456.netlify.app`

---

## 🔧 **PASO 2: Configurar Variables (2 minutos)**

### **⚙️ En la página de tu sitio en Netlify:**
1. **⚙️ Site settings** (botón en tu sitio)
2. **🔧 Build & deploy** (menú lateral)
3. **🔧 Environment variables** (sección)

### **➕ Agregar Variable 1:**
```
Key: VITE_SUPABASE_URL
Value: https://ktnrelmlyndwqoqeayte.supabase.co
```
**💾 Create variable**

### **➕ Agregar Variable 2:**
```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bnJlbG1seW5kd3FvcWVheXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMjcxMDcsImV4cCI6MjA2ODkwMzEwN30.gb0iOAZLIOcATVPSoaViLE9gDc91HsCVSmNx42v1KuA
```
**💾 Create variable**

---

## 🔄 **PASO 3: Redeploy (1 minuto)**

### **🚀 Aplicar las variables:**
1. **🚀 Deploys** (pestaña principal)
2. **🔄 Trigger deploy** → **Deploy site**
3. **⏳ Esperar 2-3 minutos**

---

## 🔐 **PASO 4: Testing (30 segundos)**

### **🧪 Probar login:**
1. **🌐 Abrir** tu URL de Netlify
2. **🔐 Usar credenciales:**
   ```
   Email: juan.miguel@goodsolutions.pe
   Password: 0123456789juanmiguelgoodpro
   ```
3. **✅ ¡Debe cargar el dashboard admin!**

---

## 🎯 **RESULTADO FINAL:**

- ✅ **App funcionando** en producción
- ✅ **Login real** sin datos demo
- ✅ **Pantalla profesional** con imagen SST
- ✅ **Dashboard completo** con métricas
- ✅ **Gestión de empresas** operativa
- ✅ **Upload de documentos** funcional

---

**🚀 ¿Empezamos subiendo la carpeta `dist/` a Netlify?**