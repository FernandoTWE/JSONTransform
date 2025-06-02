import { useState, useCallback, useEffect } from 'react';
import type { OpenAISchema, ConversionOptions, APIType, OutputMode, ConversationMode } from '@/types/openai-schema';

export function useSchemaConverter() {
  const [inputJson, setInputJson] = useState('');
  const [outputSchema, setOutputSchema] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [detectedType, setDetectedType] = useState<'data' | 'schema' | null>(null);
  const [options, setOptions] = useState<ConversionOptions>({
    apiType: 'responses',
    outputMode: 'structured',
    conversationMode: 'instructions',
    strictMode: true,
    additionalProperties: false,
    schemaName: 'generated_schema'
  });

  // Función para detectar si es JSON Schema o JSON de datos
  const detectInputType = (jsonData: any): 'data' | 'schema' => {
    // Indicadores de que es un JSON Schema
    const schemaIndicators = [
      '$schema',
      'type',
      'properties',
      'required',
      'description',
      'title',
      '$id',
      'definitions',
      '$defs',
      'items',
      'enum',
      'anyOf',
      'oneOf',
      'allOf'
    ];

    // Si es un objeto y tiene propiedades típicas de schema
    if (typeof jsonData === 'object' && jsonData !== null && !Array.isArray(jsonData)) {
      const keys = Object.keys(jsonData);
      
      // Verificar si tiene indicadores de schema
      const hasSchemaIndicators = schemaIndicators.some(indicator => keys.includes(indicator));
      
      // Verificación adicional: si tiene "type" y "properties" es muy probable que sea schema
      if (jsonData.type && jsonData.properties) {
        return 'schema';
      }
      
      // Si tiene $schema es definitivamente un schema
      if (jsonData.$schema) {
        return 'schema';
      }
      
      // Si tiene varios indicadores de schema
      const indicatorCount = schemaIndicators.filter(indicator => keys.includes(indicator)).length;
      if (indicatorCount >= 2) {
        return 'schema';
      }
    }
    
    // Por defecto, asumimos que son datos
    return 'data';
  };

  // Función para inferir el tipo de un valor
  const inferType = (value: any): string => {
    if (value === null) return 'string'; // null se trata como string opcional
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'integer' : 'number';
    }
    if (typeof value === 'boolean') return 'boolean';
    return 'string';
  };

  // Función para analizar array y determinar el tipo de items
  const analyzeArray = (arr: any[], currentOptions: ConversionOptions): any => {
    if (arr.length === 0) {
      return { type: 'string' }; // Tipo por defecto para arrays vacíos
    }

    // Analizar el primer elemento para determinar el tipo
    const firstItem = arr[0];
    const itemType = inferType(firstItem);

    if (itemType === 'object') {
      // Si es array de objetos, generar schema del objeto
      return generateSchemaFromValue(firstItem, currentOptions);
    } else {
      // Si es array de primitivos
      return { type: itemType };
    }
  };

  // Función recursiva para generar schema desde un valor
  const generateSchemaFromValue = (value: any, currentOptions: ConversionOptions): any => {
    const type = inferType(value);

    switch (type) {
      case 'object':
        const properties: any = {};
        const required: string[] = [];

        for (const [key, val] of Object.entries(value)) {
          properties[key] = generateSchemaFromValue(val, currentOptions);
          
          // En modo estricto, todos los campos son requeridos
          if (currentOptions.strictMode || val !== null) {
            required.push(key);
          }
        }

        const objectSchema: any = {
          type: 'object',
          properties
        };

        if (required.length > 0) {
          objectSchema.required = required;
        }

        // Configurar additionalProperties según la opción
        if (currentOptions.outputMode === 'structured') {
          objectSchema.additionalProperties = currentOptions.additionalProperties;
        }

        return objectSchema;

      case 'array':
        return {
          type: 'array',
          items: analyzeArray(value, currentOptions)
        };

      case 'string':
        return { type: 'string' };

      case 'number':
        return { type: 'number' };

      case 'integer':
        return { type: 'integer' };

      case 'boolean':
        return { type: 'boolean' };

      default:
        return { type: 'string' };
    }
  };

  // Función para limpiar propiedades no permitidas por OpenAI
  const cleanSchemaForOpenAI = (schema: any): any => {
    if (!schema || typeof schema !== 'object') {
      return schema;
    }

    const cleaned = { ...schema };
    
    // Propiedades no permitidas por OpenAI Structured Outputs
    const forbiddenProperties = [
      'if', 'then', 'else',           // Condicionales
      'not',                          // Negación
      'allOf', 'oneOf',              // Combinadores (anyOf está permitido)
      'patternProperties',           // Propiedades con patrones
      'additionalItems',             // Items adicionales
      'contains',                    // Contiene
      'propertyNames',               // Nombres de propiedades
      'const',                       // Constante (usar enum en su lugar)
      'dependencies',                // Dependencias
      'definitions', '$defs'         // Definiciones (usar referencias directas)
    ];

    // Remover propiedades no permitidas
    forbiddenProperties.forEach(prop => {
      delete cleaned[prop];
    });

    // Limpiar recursivamente propiedades anidadas
    if (cleaned.properties) {
      cleaned.properties = Object.fromEntries(
        Object.entries(cleaned.properties).map(([key, value]) => [
          key, 
          cleanSchemaForOpenAI(value)
        ])
      );
    }

    if (cleaned.items) {
      cleaned.items = cleanSchemaForOpenAI(cleaned.items);
    }

    if (cleaned.anyOf) {
      cleaned.anyOf = cleaned.anyOf.map((item: any) => cleanSchemaForOpenAI(item));
    }

    // Convertir 'const' a 'enum' si existe
    if (schema.const !== undefined) {
      cleaned.enum = [schema.const];
      delete cleaned.const;
    }

    return cleaned;
  };

  // Función para convertir JSON Schema existente a formato OpenAI
  const convertExistingSchema = (schema: any, currentOptions: ConversionOptions): any => {
    // Crear una copia del schema para no modificar el original
    const convertedSchema = JSON.parse(JSON.stringify(schema));
    
    // Limpiar propiedades específicas de JSON Schema que no son necesarias para OpenAI
    delete convertedSchema.$schema;
    delete convertedSchema.$id;
    delete convertedSchema.title;
    delete convertedSchema.description;
    
    // Asegurar que additionalProperties esté configurado según las opciones
    if (currentOptions.outputMode === 'structured') {
      const setAdditionalProperties = (obj: any) => {
        if (obj && typeof obj === 'object' && obj.type === 'object') {
          obj.additionalProperties = currentOptions.additionalProperties;
          
          // Aplicar recursivamente a propiedades anidadas
          if (obj.properties) {
            Object.values(obj.properties).forEach((prop: any) => {
              setAdditionalProperties(prop);
            });
          }
        }
        
        // Aplicar a items de arrays
        if (obj && typeof obj === 'object' && obj.type === 'array' && obj.items) {
          setAdditionalProperties(obj.items);
        }
      };
      
      setAdditionalProperties(convertedSchema);
    }
    
    // En modo estricto, asegurar que todos los objetos tengan required
    if (currentOptions.strictMode) {
      const ensureRequired = (obj: any) => {
        if (obj && typeof obj === 'object' && obj.type === 'object' && obj.properties) {
          if (!obj.required || obj.required.length === 0) {
            obj.required = Object.keys(obj.properties);
          }
          
          // Aplicar recursivamente
          Object.values(obj.properties).forEach((prop: any) => {
            ensureRequired(prop);
          });
        }
        
        // Aplicar a items de arrays
        if (obj && typeof obj === 'object' && obj.type === 'array' && obj.items) {
          ensureRequired(obj.items);
        }
      };
      
      ensureRequired(convertedSchema);
    }
    
    // Limpiar propiedades no permitidas por OpenAI
    return cleanSchemaForOpenAI(convertedSchema);
  };

  // Función para generar el schema OpenAI completo
  const generateOpenAISchema = (jsonData: any, currentOptions: ConversionOptions, inputType: 'data' | 'schema'): any => {
    let schema;
    
    if (inputType === 'schema') {
      // Si es un JSON Schema, convertirlo
      schema = convertExistingSchema(jsonData, currentOptions);
    } else {
      // Si son datos, generar schema desde los datos
      const rawSchema = generateSchemaFromValue(jsonData, currentOptions);
      schema = cleanSchemaForOpenAI(rawSchema);
    }

    if (currentOptions.outputMode === 'json-mode') {
      // Para JSON mode
      if (currentOptions.apiType === 'chat-completions') {
        return {
          model: "gpt-4o-2024-08-06",
          messages: [
            {
              role: "developer",
              content: "TU PROMPT DEL DESARROLLADOR AQUÍ"
            },
            {
              role: "user", 
              content: "TU PROMPT DEL USUARIO AQUÍ"
            }
          ],
          temperature: 0.7,
          max_completion_tokens: 1000,
          response_format: {
            type: 'json_object'
          }
        };
      } else {
        // Responses API
        if (currentOptions.conversationMode === 'instructions') {
          // Modo A: instructions + texto simple
          return {
            model: "gpt-4o-2024-08-06",
            instructions: "TU PROMPT DEL DESARROLLADOR AQUÍ",
            input: "TU PROMPT DEL USUARIO AQUÍ",
            temperature: 0.7,
            max_output_tokens: 1000,
            text: {
              format: {
                type: 'json_object'
              }
            }
          };
        } else {
          // Modo B: array con roles
          return {
            model: "gpt-4o-2024-08-06",
            input: [
              {
                role: "developer",
                content: "TU PROMPT DEL DESARROLLADOR AQUÍ"
              },
              {
                role: "user",
                content: "TU PROMPT DEL USUARIO AQUÍ"
              }
            ],
            temperature: 0.7,
            max_output_tokens: 1000,
            text: {
              format: {
                type: 'json_object'
              }
            }
          };
        }
      }
    } else {
      // Para Structured Outputs
      const schemaName = inputType === 'schema' && jsonData.title 
        ? jsonData.title.toLowerCase().replace(/\s+/g, '_') 
        : currentOptions.schemaName;
        
      const jsonSchema: any = {
        name: schemaName,
        schema: schema
      };

      if (currentOptions.strictMode) {
        jsonSchema.strict = true;
      }

      if (currentOptions.apiType === 'chat-completions') {
        return {
          model: "gpt-4o-2024-08-06",
          messages: [
            {
              role: "developer",
              content: "TU PROMPT DEL DESARROLLADOR AQUÍ"
            },
            {
              role: "user",
              content: "TU PROMPT DEL USUARIO AQUÍ"
            }
          ],
          temperature: 0.7,
          max_completion_tokens: 1000,
          response_format: {
            type: 'json_schema',
            json_schema: jsonSchema
          }
        };
      } else {
        // Responses API
        if (currentOptions.conversationMode === 'instructions') {
          // Modo A: instructions + texto simple
          return {
            model: "gpt-4o-2024-08-06",
            instructions: "TU PROMPT DEL DESARROLLADOR AQUÍ",
            input: "TU PROMPT DEL USUARIO AQUÍ",
            temperature: 0.7,
            max_output_tokens: 1000,
            text: {
              format: {
                type: 'json_schema',
                name: jsonSchema.name,
                schema: jsonSchema.schema,
                ...(jsonSchema.strict !== undefined && { strict: jsonSchema.strict })
              }
            }
          };
        } else {
          // Modo B: array con roles
          return {
            model: "gpt-4o-2024-08-06",
            input: [
              {
                role: "developer",
                content: "TU PROMPT DEL DESARROLLADOR AQUÍ"
              },
              {
                role: "user",
                content: "TU PROMPT DEL USUARIO AQUÍ"
              }
            ],
            temperature: 0.7,
            max_output_tokens: 1000,
            text: {
              format: {
                type: 'json_schema',
                name: jsonSchema.name,
                schema: jsonSchema.schema,
                ...(jsonSchema.strict !== undefined && { strict: jsonSchema.strict })
              }
            }
          };
        }
      }
    }
  };

  const validateAndConvert = useCallback((jsonString: string, newOptions?: ConversionOptions) => {
    const currentOptions = newOptions || options;
    
    if (!jsonString.trim()) {
      setOutputSchema(null);
      setError(null);
      setIsValid(false);
      setDetectedType(null);
      return;
    }

    try {
      // Intentar parsear el JSON
      const jsonData = JSON.parse(jsonString);
      
      // Validar que sea un objeto o array (no primitivo)
      if (typeof jsonData !== 'object' || jsonData === null) {
        throw new Error('El JSON debe ser un objeto o array, no un valor primitivo');
      }

      // Detectar el tipo de entrada
      const inputType = detectInputType(jsonData);
      setDetectedType(inputType);

      // Generar el schema OpenAI
      const openaiSchema = generateOpenAISchema(jsonData, currentOptions, inputType);
      
      setOutputSchema(openaiSchema);
      setError(null);
      setIsValid(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el JSON');
      setOutputSchema(null);
      setIsValid(false);
      setDetectedType(null);
    }
  }, [options]);

  return {
    inputJson,
    setInputJson,
    outputSchema,
    error,
    isValid,
    detectedType,
    options,
    setOptions,
    validateAndConvert
  };
}
