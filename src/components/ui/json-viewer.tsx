import React from 'react';

interface JsonViewerProps {
  data: any;
  className?: string;
}

export function JsonViewer({ data, className = '' }: JsonViewerProps) {
  const jsonString = JSON.stringify(data, null, 2);
  
  // Función para resaltar sintaxis JSON
  const highlightJson = (json: string) => {
    return json
      .replace(/"TU PROMPT DEL DESARROLLADOR AQUÍ"/g, '<span class="text-orange-600 font-bold bg-orange-100 px-1 rounded">"TU PROMPT DEL DESARROLLADOR AQUÍ"</span>')
      .replace(/"TU PROMPT DEL USUARIO AQUÍ"/g, '<span class="text-orange-600 font-bold bg-orange-100 px-1 rounded">"TU PROMPT DEL USUARIO AQUÍ"</span>')
      .replace(/"([^"]+)":/g, '<span class="text-red-600 font-medium">"$1"</span>:')
      .replace(/: "([^"]*(?:\\.[^"]*)*)"/g, ': <span class="text-green-600">"$1"</span>')
      .replace(/: (\d+)/g, ': <span class="text-blue-600">$1</span>')
      .replace(/: (true|false)/g, ': <span class="text-purple-600">$1</span>')
      .replace(/: (null)/g, ': <span class="text-gray-500">$1</span>');
  };

  return (
    <div className={`bg-muted p-4 rounded-lg overflow-auto min-h-[400px] ${className}`}>
      <pre className="font-mono text-sm leading-relaxed">
        <code 
          dangerouslySetInnerHTML={{ 
            __html: highlightJson(jsonString) 
          }}
        />
      </pre>
    </div>
  );
}
