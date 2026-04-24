# 🤖 MCP Server Setup - MediApp HIS

## 🎯 ¿Qué es MCP?
**Model Context Protocol** - Protocolo que permite comunicación directa entre IA y tu códigobase con acceso a archivos, comandos y contexto real.

## 🚀 Beneficios para MediApp

### ✅ **Ventajas actuales (ya usas MCP):**
- Acceso directo a archivos del proyecto
- Ejecución de comandos en tu sistema
- Contexto completo del códigobase
- Búsquedas y análisis inteligentes

### 🔄 **Servidor MCP local mejoraría:**
- **Comunicación más rápida** - Sin intermediarios
- **Acceso a recursos locales** - Base de datos, logs
- **Integración con herramientas** - Git, npm, Supabase CLI
- **Contexto persistente** - Memoria entre sesiones

---

## 🛠️ Opciones de Servidor MCP

### 📦 **Opción 1: MCP Server Oficial**
```bash
npm install -g @modelcontextprotocol/server-filesystem
```

### 🔧 **Opción 2: Servidor Personalizado**
```bash
npm install -g @modelcontextprotocol/server
```

### 🎯 **Opción 3: Servidor MediApp Personalizado**
Crear servidor específico para tu HIS con acceso a:
- Base de datos Supabase
- Logs de la aplicación
- Configuración de entorno
- Scripts de deployment

---

## 📋 Setup Recomendado

### **Paso 1: Instalar MCP Server**
```bash
# Instalar servidor MCP
npm install -g @modelcontextprotocol/server-filesystem

# O instalar localmente en el proyecto
npm install --save-dev @modelcontextprotocol/server-filesystem
```

### **Paso 2: Configurar MCP Client**
Tu IDE (VS Code, Cursor) ya tiene MCP client integrado. Solo necesita configuración:

```json
{
  "mcpServers": {
    "his-lite-backend": {
      "command": "node",
      "args": ["node_modules/@modelcontextprotocol/server-filesystem/dist/index.js", "d:/proyectos/his-lite-backend"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

### **Paso 3: Servidor Personalizado (Opcional)**
<tool_call>CodeContent</arg_key>
<arg_value>d:\proyectos\his-lite-backend\mcp-server.js
