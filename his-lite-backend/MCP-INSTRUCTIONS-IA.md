# 🤖 Instrucciones para IA - MCP MediApp HIS

## 📋 ¿Qué decirle a otra IA?

Cuando uses otra IA (ChatGPT, Claude, Gemini, etc.) para trabajar con tu proyecto MediApp HIS, proporciona esta información:

---

## 🎯 **Mensaje inicial para la IA:**

```
Estoy trabajando en un proyecto de Sistema de Información Hospitalaria (HIS) llamado MediApp backend. 

🏥 **Contexto del Proyecto:**
- **Stack**: React + TypeScript + Vite + Supabase + Tailwind CSS + Shadcn/UI
- **Ubicación**: d:\proyectos\his-lite-backend
- **Tipo**: Aplicación médica con roles (admin, doctor, patient)

🤖 **MCP Server Disponible:**
Este proyecto tiene un servidor MCP (Model Context Protocol) instalado y configurado específicamente para desarrollo médico.

📁 **Archivos MCP importantes:**
- mcp-server.js - Servidor MCP personalizado
- MCP-SETUP.md - Guía de configuración
- package-mcp.json - Configuración MCP

🛠️ **Herramientas MCP disponibles:**
- run_npm_command - Ejecutar comandos npm (dev, build, test)
- check_supabase_status - Verificar conexión Supabase
- run_database_migration - Ejecutar scripts SQL
- analyze_logs - Analizar logs de aplicación

📋 **Recursos MCP disponibles:**
- his://project/package.json - Dependencias y scripts
- his://project/env - Variables de entorno
- his://database/schema - Esquema de base de datos
- his://logs/application - Logs de la aplicación

🔧 **Para activar MCP:**
Usa el servidor MCP en: d:\proyectos\his-lite-backend con el comando: node mcp-server.js

¿Puedes usar el MCP server para tener acceso completo al proyecto y sus herramientas específicas?
```

---

## 🎯 **Comandos específicos que puede solicitar:**

### **📦 Desarrollo:**
```
Usa MCP para ejecutar: npm run dev
```

### **🗄️ Base de Datos:**
```
Usa MCP para verificar el estado de Supabase
Usa MCP para ejecutar migración: doctor-availability-schema.sql
```

### **📋 Logs:**
```
Usa MCP para analizar logs de errores
```

### **📁 Archivos:**
```
Usa MCP para leer el package.json del proyecto
Usa MCP para verificar variables de entorno
```

---

## 🔍 **Si la IA no reconoce MCP:**

### **Opción 1: Explicación técnica:**
```
Este proyecto tiene MCP (Model Context Protocol) instalado. MCP es un protocolo que permite a las IA acceder directamente al sistema de archivos, ejecutar comandos y tener contexto completo del proyecto.

Para usarlo, la IA debe:
1. Reconocer que MCP está disponible en d:\proyectos\his-lite-backend
2. Usar el servidor MCP personalizado: mcp-server.js
3. Tener acceso a las herramientas y recursos configurados
```

### **Opción 2: Instrucciones de configuración:**
```
Para acceder a este proyecto con MCP, configura:

{
  "mcpServers": {
    "his-lite-backend": {
      "command": "node",
      "args": ["mcp-server.js"],
      "cwd": "d:/proyectos/his-lite-backend"
    }
  }
}

Esto te dará acceso a herramientas específicas para desarrollo médico.
```

---

## 🚀 **Beneficios de usar MCP con este proyecto:**

1. **Acceso directo** a archivos del proyecto HIS
2. **Comandos npm** específicos para desarrollo médico
3. **Integración Supabase** para base de datos médica
4. **Logs en tiempo real** para depuración
5. **Contexto persistente** del sistema médico

---

## 📞 **Si la IA necesita ayuda adicional:**

```
Si tienes problemas para conectar con el MCP server de este proyecto:

1. Verifica que @modelcontextprotocol/server esté instalado
2. Confirma que mcp-server.js existe en d:\proyectos\his-lite-backend
3. Revisa MCP-SETUP.md para instrucciones detalladas
4. El servidor está diseñado específicamente para desarrollo de sistemas médicos

Este es un proyecto HIS (Hospital Information System) con funcionalidades médicas específicas que el MCP server está optimizado para manejar.
```

---

## 🎯 **Resumen rápido para copiar y pegar:**

```
🏥 Proyecto: MediApp HIS (Sistema de Información Hospitalaria)
📍 Ubicación: d:\proyectos\his-lite-backend
🤖 MCP: Servidor personalizado instalado (mcp-server.js)
🛠️ Herramientas: npm, Supabase, logs, migraciones BD
📋 Contexto: Desarrollo médico con React + Supabase

Usa MCP para acceso completo al proyecto y herramientas específicas de desarrollo médico.
```

---

*Con estas instrucciones, cualquier IA podrá aprovechar el MCP server personalizado para trabajar eficientemente con tu proyecto MediApp HIS.*
