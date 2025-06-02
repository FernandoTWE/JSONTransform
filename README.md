# JSON to OpenAI Schema Converter

Una aplicación web moderna para convertir JSON a esquemas compatibles con las APIs de OpenAI (Chat Completions y Responses API).

## 🔗 Enlaces

- 🌐 **Demo en vivo**: [json-openai.nuvawe.com](https://json-openai.nuvawe.com)
- 📦 **Repositorio**: [github.com/FernandoTWE/JSONTransform](https://github.com/FernandoTWE/JSONTransform.git)

## ⚡ Prueba Rápida

¿Quieres probar la aplicación inmediatamente? Visita la **[demo en vivo](https://json-openai.nuvawe.com)** y convierte tu JSON en segundos.

## 🚀 Características

### Detección Automática Inteligente
- **JSON de Datos**: Analiza la estructura de datos JSON y genera automáticamente un esquema
- **JSON Schema**: Convierte esquemas JSON existentes al formato específico de OpenAI
- Detección automática del tipo de entrada con indicadores visuales

### Soporte Completo para APIs de OpenAI
- **Chat Completions API**: Formato tradicional con `tools` y `function_calling`
- **Responses API**: Nuevo formato con dos modos de conversación:
  - **Modo A (Instructions)**: Para peticiones simples de una sola vuelta
  - **Modo B (Roles)**: Para conversaciones multi-vuelta con contexto histórico

### Configuración Avanzada
- **Strict Mode**: Control de validación estricta de esquemas
- **Additional Properties**: Configuración de propiedades adicionales
- **Parámetros Específicos**: 
  - `max_completion_tokens` para Chat Completions
  - `max_output_tokens` para Responses API
- **Roles Correctos**: `developer` en lugar de `system` para Chat Completions

### Interfaz de Usuario Moderna
- Diseño responsive con Tailwind CSS
- Componentes UI con shadcn/ui y Radix UI
- Visualización JSON con syntax highlighting
- Validación en tiempo real
- Indicadores de estado y errores
- Animaciones y efectos visuales

## 🛠️ Tecnologías

- **Framework**: Astro 5.8+ con React
- **Styling**: Tailwind CSS 4.1+
- **UI Components**: shadcn/ui + Radix UI
- **TypeScript**: Tipado completo
- **Deployment**: Cloudflare compatible

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/FernandoTWE/JSONTransform.git
cd JSONTransform

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🎯 Uso

1. **Pega tu JSON**: Introduce datos JSON o un JSON Schema en el área de texto
2. **Selecciona la API**: Elige entre Chat Completions o Responses API
3. **Configura opciones**: Ajusta strict mode, additional properties y otros parámetros
4. **Obtén el resultado**: Copia el esquema generado listo para usar con OpenAI

### Ejemplo de Conversión

**Entrada (JSON de datos):**
```json
{
  "name": "Juan",
  "age": 30,
  "skills": ["JavaScript", "Python"]
}
```

**Salida (Chat Completions):**
```json
{
  "type": "function",
  "function": {
    "name": "process_data",
    "description": "Procesa los datos del usuario",
    "parameters": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "age": {"type": "number"},
        "skills": {
          "type": "array",
          "items": {"type": "string"}
        }
      },
      "required": ["name", "age", "skills"],
      "additionalProperties": false
    },
    "strict": true
  }
}
```

## 🔧 Configuración

La aplicación detecta automáticamente el tipo de entrada y permite configurar:

- **API Target**: Chat Completions vs Responses API
- **Conversation Mode**: Instructions vs Roles (solo Responses API)
- **Schema Validation**: Strict mode on/off
- **Additional Properties**: Permitir propiedades adicionales
- **Token Limits**: Configuración de límites de tokens

## 🌐 Deployment

Compatible con Cloudflare Pages y otros proveedores que soporten Astro.

```bash
npm run build
# Subir el contenido de dist/ a tu proveedor
```

## 📝 Licencia

MIT License - ver archivo LICENSE para detalles.

---

Desarrollado con ❤️ para simplificar la integración con las APIs de OpenAI
