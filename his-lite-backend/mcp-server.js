#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/server');
const { StdioServerTransport } = require('@modelcontextprotocol/server/stdio');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class MediAppMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'his-lite-backend',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupTools();
    this.setupResources();
  }

  setupTools() {
    // Herramienta para ejecutar comandos npm
    this.server.setRequestHandler('tools/list', async () => ({
      tools: [
        {
          name: 'run_npm_command',
          description: 'Ejecutar comandos npm en el proyecto MediApp',
          inputSchema: {
            type: 'object',
            properties: {
              command: {
                type: 'string',
                description: 'Comando npm a ejecutar (ej: dev, build, test)',
              },
              args: {
                type: 'array',
                items: { type: 'string' },
                description: 'Argumentos adicionales',
              },
            },
            required: ['command'],
          },
        },
        {
          name: 'check_supabase_status',
          description: 'Verificar estado de la conexión con Supabase',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'run_database_migration',
          description: 'Ejecutar migraciones de base de datos',
          inputSchema: {
            type: 'object',
            properties: {
              file: {
                type: 'string',
                description: 'Archivo SQL a ejecutar',
              },
            },
          },
        },
        {
          name: 'analyze_logs',
          description: 'Analizar logs de la aplicación',
          inputSchema: {
            type: 'object',
            properties: {
              level: {
                type: 'string',
                enum: ['error', 'warn', 'info', 'debug'],
                description: 'Nivel de log a analizar',
              },
            },
          },
        },
      ],
    }));

    this.server.setRequestHandler('tools/call', async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'run_npm_command':
          return this.runNpmCommand(args.command, args.args || []);
        
        case 'check_supabase_status':
          return this.checkSupabaseStatus();
        
        case 'run_database_migration':
          return this.runDatabaseMigration(args.file);
        
        case 'analyze_logs':
          return this.analyzeLogs(args.level);
        
        default:
          throw new Error(`Herramienta desconocida: ${name}`);
      }
    });
  }

  setupResources() {
    // Recursos del proyecto
    this.server.setRequestHandler('resources/list', async () => ({
      resources: [
        {
          uri: 'his://project/package.json',
          name: 'Package.json',
          description: 'Dependencias y scripts del proyecto',
          mimeType: 'application/json',
        },
        {
          uri: 'his://project/env',
          name: 'Environment Variables',
          description: 'Variables de entorno configuradas',
          mimeType: 'text/plain',
        },
        {
          uri: 'his://database/schema',
          name: 'Database Schema',
          description: 'Esquema de base de datos actual',
          mimeType: 'text/plain',
        },
        {
          uri: 'his://logs/application',
          name: 'Application Logs',
          description: 'Logs recientes de la aplicación',
          mimeType: 'text/plain',
        },
      ],
    }));

    this.server.setRequestHandler('resources/read', async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case 'his://project/package.json':
          const packageJson = await fs.readFile('package.json', 'utf-8');
          return { contents: packageJson };
        
        case 'his://project/env':
          try {
            const envContent = await fs.readFile('.env', 'utf-8');
            return { contents: envContent };
          } catch {
            return { contents: 'Archivo .env no encontrado' };
          }
        
        case 'his://database/schema':
          try {
            const schemaContent = await fs.readFile('supabase/schema.sql', 'utf-8');
            return { contents: schemaContent };
          } catch {
            return { contents: 'Schema no encontrado' };
          }
        
        case 'his://logs/application':
          try {
            const logs = await this.getRecentLogs();
            return { contents: logs };
          } catch {
            return { contents: 'No se pudieron obtener los logs' };
          }
        
        default:
          throw new Error(`Recurso desconocido: ${uri}`);
      }
    });
  }

  async runNpmCommand(command, args = []) {
    try {
      const fullCommand = `npm ${command} ${args.join(' ')}`;
      console.log(`🚀 Ejecutando: ${fullCommand}`);
      
      const { stdout, stderr } = await execAsync(fullCommand, {
        cwd: process.cwd(),
        timeout: 30000,
      });

      return {
        content: [
          {
            type: 'text',
            text: `✅ Comando ejecutado exitosamente:\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error ejecutando comando:\n\n${error.message}`,
          },
        ],
      };
    }
  }

  async checkSupabaseStatus() {
    try {
      // Verificar variables de entorno
      const envContent = await fs.readFile('.env', 'utf-8');
      const supabaseUrl = envContent.match(/SUPABASE_URL=(.+)/)?.[1];
      const supabaseKey = envContent.match(/SUPABASE_ANON_KEY=(.+)/)?.[1];

      let status = '📊 Estado de Supabase:\n\n';
      
      if (supabaseUrl) {
        status += `✅ URL configurada: ${supabaseUrl}\n`;
      } else {
        status += `❌ URL no configurada\n`;
      }

      if (supabaseKey) {
        status += `✅ Key configurada: ${supabaseKey.substring(0, 10)}...\n`;
      } else {
        status += `❌ Key no configurada\n`;
      }

      // Intentar ping a Supabase
      if (supabaseUrl && supabaseKey) {
        try {
          const { stdout } = await execAsync(
            `curl -s -o /dev/null -w "%{http_code}" "${supabaseUrl}/rest/v1/"`,
            { timeout: 5000 }
          );
          
          if (stdout === '200') {
            status += `✅ Conexión activa (HTTP 200)\n`;
          } else {
            status += `⚠️ Conexión problemática (HTTP ${stdout})\n`;
          }
        } catch {
          status += `❌ No se puede conectar a Supabase\n`;
        }
      }

      return {
        content: [{ type: 'text', text: status }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error verificando Supabase: ${error.message}`,
          },
        ],
      };
    }
  }

  async runDatabaseMigration(file) {
    try {
      if (!file) {
        return {
          content: [
            {
              type: 'text',
              text: '❌ Debes especificar un archivo SQL para ejecutar',
            },
          ],
        };
      }

      const filePath = path.join('supabase', file);
      
      // Verificar que el archivo existe
      await fs.access(filePath);
      
      console.log(`🗄️ Ejecutando migración: ${filePath}`);
      
      return {
        content: [
          {
            type: 'text',
            text: `✅ Migración ${file} lista para ejecutar\n\nPara ejecutarla manualmente:\n1. Ve a Supabase Dashboard\n2. SQL Editor\n3. Copia el contenido de ${filePath}\n4. Ejecuta el script`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error con migración: ${error.message}`,
          },
        ],
      };
    }
  }

  async analyzeLogs(level = 'error') {
    try {
      console.log(`📋 Analizando logs nivel: ${level}`);
      
      // Buscar logs en archivos comunes
      const logFiles = [
        'logs/app.log',
        'logs/error.log',
        '.npm/_logs',
      ];

      let logs = `📋 Análisis de logs (${level}):\n\n`;

      for (const logFile of logFiles) {
        try {
          const content = await fs.readFile(logFile, 'utf-8');
          const lines = content.split('\n').filter(line => 
            line.toLowerCase().includes(level.toLowerCase())
          );
          
          if (lines.length > 0) {
            logs += `📄 ${logFile} (${lines.length} entradas):\n`;
            logs += lines.slice(-10).join('\n'); // Últimas 10 líneas
            logs += '\n\n';
          }
        } catch {
          // Archivo no encontrado, continuar
        }
      }

      if (logs === `📋 Análisis de logs (${level}):\n\n`) {
        logs += 'ℹ️ No se encontraron logs recientes\n';
        logs += '💡 Sugerencia: Revisa la consola del navegador para logs en tiempo real';
      }

      return {
        content: [{ type: 'text', text: logs }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error analizando logs: ${error.message}`,
          },
        ],
      };
    }
  }

  async getRecentLogs() {
    // Simular obtención de logs (en producción, leer de archivos reales)
    return `📋 Logs recientes de MediApp HIS:
[${new Date().toISOString()}] 🚀 [DEBUG] Iniciando signUp para: doctor@test.com rol: doctor
[${new Date().toISOString()}] 🚩 [DEBUG] Creando usuario en Supabase Auth...
[${new Date().toISOString()}] 🚩 [DEBUG] Usuario creado en Auth: 12345678-1234-1234-1234-123456789012
[${new Date().toISOString()}] 🚩 [DEBUG] Perfil creado con RPC exitosamente
[${new Date().toISOString()}] 🚩 [DEBUG] SignUp completado exitosamente`;
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🤖 MediApp MCP Server iniciado');
  }
}

// Iniciar el servidor
if (require.main === module) {
  const server = new MediAppMCPServer();
  server.run().catch(console.error);
}

module.exports = MediAppMCPServer;
