# 🔧 SOLUCIONES PARA TIMEOUT DE SUPABASE

## 🚨 **PROBLEMA:** Connection timeout

### **✅ SOLUCIÓN 1: Esperar y reintentar (MÁS FÁCIL)**

#### **⏰ El proyecto necesita tiempo:**
- **⏳ Espera 5-10 minutos** después de crear el proyecto
- **🔄 Refresca** la página de Supabase
- **🧪 Prueba** el script simple `minimal_test.sql`

#### **📋 Pasos:**
1. **🔧 SQL Editor** → **New query**
2. **📋 Copiar** contenido de `supabase/migrations/minimal_test.sql`
3. **▶️ Run**
4. **✅ Si funciona:** continuar con scripts principales
5. **❌ Si sigue con timeout:** usar Solución 2

---

### **✅ SOLUCIÓN 2: Usar Table Editor (SIN SQL)**

#### **🖱️ Crear tablas visualmente:**
1. **📊 Table Editor** (menú lateral)
2. **➕ Create a new table**
3. **📝 Nombre:** `companies`
4. **➕ Add column:**
   ```
   Column name: razon_social
   Type: text
   ```
5. **➕ Add column:**
   ```
   Column name: ruc
   Type: text
   ```
6. **✅ Save**

**Repite para cada tabla principal.**

---

### **✅ SOLUCIÓN 3: Conectar aplicación y crear datos desde frontend**

#### **🔧 Si las tablas básicas están:**
1. **🌐 Configurar** Netlify con las variables
2. **🔐 Login** directo desde la app
3. **🏢 Crear empresa** desde la interfaz
4. **👤 Crear usuarios** desde Configuración

---

## 🎯 **MI RECOMENDACIÓN:**

**🕐 Espera 10 minutos** y prueba el `minimal_test.sql`. Los proyectos de Supabase necesitan tiempo para inicializarse completamente.

**¿Qué solución prefieres probar primero?**