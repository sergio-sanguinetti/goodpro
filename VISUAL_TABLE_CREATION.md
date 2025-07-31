# 🖱️ CREAR TABLAS DESDE TABLE EDITOR (SIN SQL)

## 🎯 **SOLUCIÓN VISUAL PARA TIMEOUT**

Como el SQL da timeout, crearemos las tablas desde la interfaz gráfica.

---

## 📊 **PASO 1: Crear tabla COMPANIES (2 minutos)**

### **🖱️ En Table Editor:**
1. **📊 Table Editor** (menú lateral izquierdo)
2. **➕ Create a new table**
3. **📝 Table name:** `companies`
4. **✅ Enable Row Level Security (RLS):** ACTIVADO

### **➕ Agregar columnas:**

**Columna 1:**
```
Column name: razon_social
Type: text
Default value: [dejar vacío]
Is nullable: NO ✅
Is unique: NO
```

**Columna 2:**
```
Column name: ruc
Type: text
Default value: [dejar vacío]  
Is nullable: NO ✅
Is unique: SI ✅
```

**Columna 3:**
```
Column name: is_active
Type: bool
Default value: true
Is nullable: NO ✅
```

5. **💾 Save table**

---

## 👥 **PASO 2: Crear tabla USERS (2 minutos)**

### **🖱️ En Table Editor:**
1. **➕ Create a new table**
2. **📝 Table name:** `users`
3. **✅ Enable Row Level Security (RLS):** ACTIVADO

### **➕ Agregar columnas:**

**Columna 1:**
```
Column name: name
Type: text
Default value: [dejar vacío]
Is nullable: NO ✅
```

**Columna 2:**
```
Column name: email
Type: text
Default value: [dejar vacío]
Is nullable: NO ✅
Is unique: SI ✅
```

**Columna 3:**
```
Column name: telefono
Type: text
Default value: [dejar vacío]
Is nullable: SI (puede estar vacío)
```

**Columna 4:**
```
Column name: role
Type: text
Default value: company_user
Is nullable: NO ✅
```

**Columna 5:**
```
Column name: company_id
Type: uuid
Default value: [dejar vacío]
Is nullable: SI (admin no tiene empresa)
```

**Columna 6:**
```
Column name: is_active
Type: bool
Default value: true
Is nullable: NO ✅
```

**Columna 7:**
```
Column name: can_view_all_company_projects
Type: bool
Default value: true
Is nullable: NO ✅
```

5. **💾 Save table**

---

## 🏢 **PASO 3: Crear tabla PROJECTS (2 minutos)**

### **🖱️ En Table Editor:**
1. **➕ Create a new table**
2. **📝 Table name:** `projects`
3. **✅ Enable Row Level Security (RLS):** ACTIVADO

### **➕ Agregar columnas:**

**Columna 1:**
```
Column name: sede
Type: text
Default value: [dejar vacío]
Is nullable: NO ✅
```

**Columna 2:**
```
Column name: descripcion
Type: text
Default value: [dejar vacío]
Is nullable: NO ✅
```

**Columna 3:**
```
Column name: company_id
Type: uuid
Default value: [dejar vacío]
Is nullable: NO ✅
```

**Columna 4:**
```
Column name: fecha_inicio
Type: date
Default value: [dejar vacío]
Is nullable: NO ✅
```

**Columna 5:**
```
Column name: fecha_fin
Type: date
Default value: [dejar vacío]
Is nullable: SI (puede no tener fecha fin)
```

**Columna 6:**
```
Column name: status
Type: text
Default value: active
Is nullable: NO ✅
```

**Columna 7:**
```
Column name: is_active
Type: bool
Default value: true
Is nullable: NO ✅
```

5. **💾 Save table**

---

## 📂 **PASO 4: Crear Storage Buckets (1 minuto)**

### **🗂️ En Storage:**
1. **🗂️ Storage** (menú lateral)
2. **➕ Create bucket**
3. **📝 Name:** `documents`
4. **🔒 Public bucket:** NO (privado)
5. **✅ Create bucket**

**Repetir para:**
- **📂 Bucket:** `records`
- **📂 Bucket:** `record-entries`  
- **📂 Bucket:** `avatars`

---

## ✅ **CONFIRMACIÓN:**

Una vez creadas las 3 tablas principales, dime:
**"Tablas creadas"** y seguimos con la configuración de la app.

**¿Empezamos con la tabla COMPANIES?** 🏢