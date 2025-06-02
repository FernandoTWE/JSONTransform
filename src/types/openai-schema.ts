export interface OpenAIProperty {
  type: string | string[];
  description?: string;
  enum?: string[];
  pattern?: string;
  format?: string;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
  minItems?: number;
  maxItems?: number;
  items?: OpenAIProperty;
  properties?: Record<string, OpenAIProperty>;
  additionalProperties?: boolean;
  required?: string[];
  anyOf?: OpenAIProperty[];
  $ref?: string;
}

export interface OpenAISchema {
  name: string;
  strict: boolean;
  schema: OpenAIProperty;
}

// Para Chat Completions API
export interface ChatCompletionsFormat {
  response_format: {
    type: "json_schema" | "json_object";
    json_schema?: {
      name: string;
      strict: boolean;
      schema: OpenAIProperty;
    };
  };
}

// Para Responses API
export interface ResponsesFormat {
  text: {
    format: {
      type: "json_schema" | "json_object";
      name?: string;
      schema?: OpenAIProperty;
      strict?: boolean;
    };
  };
}

export interface JSONSchemaInput {
  [key: string]: any;
}

export type APIType = 'chat-completions' | 'responses';
export type OutputMode = 'structured' | 'json-mode';
export type ConversationMode = 'instructions' | 'roles';

export interface ConversionOptions {
  apiType: APIType;
  outputMode: OutputMode;
  conversationMode: ConversationMode;
  strictMode: boolean;
  additionalProperties: boolean;
  schemaName: string;
}
