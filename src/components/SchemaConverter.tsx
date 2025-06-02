import React, { useEffect } from 'react';
import { useSchemaConverter } from '@/hooks/useSchemaConverter';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { JsonViewer } from '@/components/ui/json-viewer';
import type { APIType, OutputMode } from '@/types/openai-schema';

export function SchemaConverter() {
  const {
    inputJson,
    setInputJson,
    outputSchema,
    error,
    isValid,
    detectedType,
    options,
    setOptions,
    validateAndConvert
  } = useSchemaConverter();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputJson(value);
    validateAndConvert(value);
  };

  const handleOptionChange = (key: keyof typeof options, value: any) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions);
    if (inputJson) {
      validateAndConvert(inputJson, newOptions);
    }
  };

  const handleCopyToClipboard = async () => {
    if (outputSchema) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(outputSchema, null, 2));
        // Aquí podrías añadir una notificación de éxito
      } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
      }
    }
  };

  const loadExample = () => {
    // Alternar entre ejemplo de datos y ejemplo de schema
    if (!inputJson || detectedType === 'schema') {
      // Cargar ejemplo de datos JSON
      const exampleData = {
        "user": {
          "id": 12345,
          "name": "Juan Pérez",
          "email": "juan@example.com",
          "isActive": true,
          "profile": {
            "age": 28,
            "location": "Madrid",
            "preferences": ["tech", "sports", "music"]
          },
          "orders": [
            {
              "id": "order-001",
              "amount": 99.99,
              "items": ["laptop", "mouse"],
              "date": "2024-01-15"
            },
            {
              "id": "order-002", 
              "amount": 25.50,
              "items": ["book"],
              "date": "2024-01-20"
            }
          ]
        }
      };
      const jsonString = JSON.stringify(exampleData, null, 2);
      setInputJson(jsonString);
      validateAndConvert(jsonString);
    } else {
      // Cargar ejemplo de JSON Schema
      const exampleSchema = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": "https://example.com/user-schema.json",
        "title": "User Profile Schema",
        "description": "Schema for user profile data",
        "type": "object",
        "required": ["id", "name", "email"],
        "properties": {
          "id": {
            "type": "integer",
            "description": "Unique user identifier"
          },
          "name": {
            "type": "string",
            "description": "Full name of the user"
          },
          "email": {
            "type": "string",
            "format": "email",
            "description": "User email address"
          },
          "isActive": {
            "type": "boolean",
            "description": "Whether the user account is active"
          },
          "profile": {
            "type": "object",
            "properties": {
              "age": {
                "type": "integer",
                "minimum": 0,
                "maximum": 120
              },
              "location": {
                "type": "string"
              },
              "preferences": {
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          }
        },
        "additionalProperties": false
      };
      const jsonString = JSON.stringify(exampleSchema, null, 2);
      setInputJson(jsonString);
      validateAndConvert(jsonString);
    }
  };

  const getAPIDescription = () => {
    if (options.apiType === 'chat-completions') {
      return 'Chat Completions API - Para conversaciones y completado de texto';
    } else {
      return 'Responses API - Para respuestas estructuradas y extracción de datos';
    }
  };

  const getModeDescription = () => {
    if (options.outputMode === 'json-mode') {
      return 'JSON Mode - Garantiza JSON válido pero no adherencia al schema';
    } else {
      return 'Structured Outputs - Garantiza adherencia estricta al schema';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Conversor JSON/Schema a OpenAI</h1>
        <p className="text-lg text-muted-foreground">
          Detecta automáticamente si es JSON de datos o JSON Schema y lo convierte al formato OpenAI
        </p>
      </div>

      {/* Panel de configuración */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuración del Schema</CardTitle>
          <CardDescription>
            Configura cómo se generará el schema OpenAI a partir de tus datos JSON
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">API de OpenAI</label>
              <Select
                value={options.apiType}
                onValueChange={(value: APIType) => handleOptionChange('apiType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="responses">Responses API</SelectItem>
                  <SelectItem value="chat-completions">Chat Completions</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{getAPIDescription()}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Modo de salida</label>
              <Select
                value={options.outputMode}
                onValueChange={(value: OutputMode) => handleOptionChange('outputMode', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="structured">Structured Outputs</SelectItem>
                  <SelectItem value="json-mode">JSON Mode</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{getModeDescription()}</p>
            </div>

            {options.apiType === 'responses' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Modo de conversación</label>
                <Select 
                  value={options.conversationMode} 
                  onValueChange={(value: 'instructions' | 'roles') => 
                    handleOptionChange('conversationMode', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instructions">
                      <div className="flex flex-col">
                        <span>Instructions (Simple)</span>
                        <span className="text-xs text-muted-foreground">Para peticiones de una sola vuelta</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="roles">
                      <div className="flex flex-col">
                        <span>Roles (Conversacional)</span>
                        <span className="text-xs text-muted-foreground">Para conversaciones multi-vuelta</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {options.outputMode === 'structured' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre del Schema</label>
                  <Input
                    value={options.schemaName}
                    onChange={(e) => handleOptionChange('schemaName', e.target.value)}
                    placeholder="nombre_del_schema"
                  />
                  <p className="text-xs text-muted-foreground">Identificador único del schema</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Modo estricto</label>
                      <p className="text-xs text-muted-foreground">
                        Garantiza que la respuesta siga exactamente el schema
                      </p>
                    </div>
                    <Switch
                      checked={options.strictMode}
                      onCheckedChange={(checked) => handleOptionChange('strictMode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Propiedades adicionales</label>
                      <p className="text-xs text-muted-foreground">
                        Permite campos no definidos en el schema
                      </p>
                    </div>
                    <Switch
                      checked={options.additionalProperties}
                      onCheckedChange={(checked) => handleOptionChange('additionalProperties', checked)}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de entrada */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>JSON de Entrada</CardTitle>
                <CardDescription>
                  Pega JSON de datos o JSON Schema - se detectará automáticamente
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadExample}>
                {!inputJson || detectedType === 'schema' 
                  ? 'Cargar Ejemplo (Datos)' 
                  : 'Cargar Ejemplo (Schema)'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Pega tu JSON aquí (datos o schema)..."
                value={inputJson}
                onChange={handleInputChange}
                className="min-h-[400px] font-mono text-sm"
              />
              
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {isValid && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ✓ JSON válido
                  </Badge>
                  {detectedType && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      {detectedType === 'data' ? '📊 Datos JSON' : '📋 JSON Schema'}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Schema generado para {options.apiType}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Panel de salida */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payload Completo OpenAI</CardTitle>
                <CardDescription>
                  Payload completo listo para usar con la API de OpenAI, incluyendo modelo, temperatura, max_tokens y placeholders para prompts
                </CardDescription>
              </div>
              {outputSchema && (
                <Button variant="outline" size="sm" onClick={handleCopyToClipboard}>
                  Copiar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {outputSchema ? (
              <div className="space-y-4">
                <JsonViewer data={outputSchema} />
                
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {options.apiType === 'chat-completions' ? 'Chat Completions API' : 'Responses API'}
                  </Badge>
                  <Badge variant="secondary">
                    {options.outputMode === 'json-mode' ? 'JSON Mode' : 'Structured Outputs'}
                  </Badge>
                  {options.strictMode && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      Modo Estricto
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    Modelo: gpt-4o-2024-08-06
                  </Badge>
                </div>
                
                <Alert>
                  <AlertDescription>
                    <div className="space-y-3">
                      <div className="font-semibold text-sm flex items-center gap-2">
                        📋 <span>Instrucciones de uso:</span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>1. Reemplaza los placeholders resaltados con tus prompts reales</div>
                        <div>2. Ajusta temperatura (0-2) y tokens máximos según tus necesidades</div>
                        
                        <div className="space-y-1">
                          <div>3. <strong>Chat Completions:</strong> usa <code className="bg-gray-100 px-1 rounded text-xs">"system"</code> role y <code className="bg-gray-100 px-1 rounded text-xs">"max_completion_tokens"</code></div>
                        </div>
                        
                        <div className="space-y-1">
                          <div>4. <strong>Responses API:</strong> usa <code className="bg-gray-100 px-1 rounded text-xs">"developer"</code> role y <code className="bg-gray-100 px-1 rounded text-xs">"max_output_tokens"</code></div>
                          <div className="ml-4 space-y-1 text-xs text-gray-600">
                            <div>• <strong>Instructions:</strong> para peticiones simples de una vuelta</div>
                            <div>• <strong>Roles:</strong> para conversaciones multi-vuelta con control fino</div>
                          </div>
                        </div>
                        
                        <div>5. Copia el payload y úsalo directamente en tu llamada a la API</div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                <Alert className="border-amber-200 bg-amber-50">
                  <AlertDescription className="text-amber-800">
                    <strong>⚠️ Nota importante:</strong> Las propiedades no compatibles con OpenAI 
                    (como <code>if/then/else</code>, <code>not</code>, <code>allOf/oneOf</code>, <code>const</code>, etc.) 
                    se eliminan automáticamente del schema para garantizar compatibilidad.
                  </AlertDescription>
                </Alert>

              </div>
            ) : (
              <div className="min-h-[400px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <p className="text-lg mb-2">No hay schema para mostrar</p>
                  <p className="text-sm">Introduce datos JSON válidos en el panel izquierdo</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Información explicativa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Explicación de conceptos */}
        <Card>
          <CardHeader>
            <CardTitle>¿Qué es Strict Mode?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div>
              <h4 className="font-semibold text-green-700">✓ strict: true (Recomendado)</h4>
              <ul className="mt-2 space-y-1 text-muted-foreground ml-4">
                <li>• Garantiza que la respuesta siga exactamente el schema</li>
                <li>• Todos los campos requeridos deben estar presentes</li>
                <li>• No se permiten campos adicionales (si additionalProperties: false)</li>
                <li>• Los tipos de datos deben coincidir exactamente</li>
                <li>• Ideal para casos donde necesitas datos estructurados confiables</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-700">⚠ strict: false</h4>
              <ul className="mt-2 space-y-1 text-muted-foreground ml-4">
                <li>• Permite cierta flexibilidad en la respuesta</li>
                <li>• Puede omitir campos opcionales</li>
                <li>• Menos garantías de estructura exacta</li>
                <li>• Útil para casos donde necesitas flexibilidad</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>¿Qué es additionalProperties?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div>
              <h4 className="font-semibold text-red-700">✗ additionalProperties: false (Recomendado)</h4>
              <ul className="mt-2 space-y-1 text-muted-foreground ml-4">
                <li>• Solo se permiten las propiedades definidas en el schema</li>
                <li>• Cualquier campo adicional será rechazado</li>
                <li>• Garantiza estructura de datos predecible</li>
                <li>• Recomendado para Structured Outputs</li>
                <li>• Mejor para casos de uso específicos y controlados</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700">✓ additionalProperties: true</h4>
              <ul className="mt-2 space-y-1 text-muted-foreground ml-4">
                <li>• Permite campos adicionales no definidos en el schema</li>
                <li>• Mayor flexibilidad en la respuesta</li>
                <li>• Útil cuando el modelo puede añadir información extra</li>
                <li>• Menos control sobre la estructura final</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Diferencias entre APIs y Modos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-3">Chat Completions API</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Formato: <code>response_format</code></li>
                <li>• Para conversaciones y completado de texto</li>
                <li>• Soporta modelos gpt-3.5-turbo, gpt-4-* y gpt-4o-*</li>
                <li>• JSON mode y Structured Outputs disponibles</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Responses API</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Formato: <code>text.format</code></li>
                <li>• Para respuestas estructuradas y extracción de datos</li>
                <li>• Soporta gpt-4o-mini y gpt-4o-2024-08-06+</li>
                <li>• Optimizada para Structured Outputs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">JSON Mode</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Garantiza JSON válido</li>
                <li>• No garantiza adherencia al schema</li>
                <li>• Requiere instrucción explícita de "JSON"</li>
                <li>• Más flexible pero menos confiable</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Structured Outputs</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Garantiza adherencia al schema</li>
                <li>• Analiza automáticamente la estructura del JSON</li>
                <li>• Detecta tipos, arrays y objetos anidados</li>
                <li>• Más confiable para casos de uso específicos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
