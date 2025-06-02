import React from 'react';

interface JsonViewerProps {
  data: any;
  className?: string;
}

export function JsonViewer({ data, className = '' }: JsonViewerProps) {
  const formatJson = (obj: any, indent = 0): React.ReactElement[] => {
    const elements: React.ReactElement[] = [];
    const indentStr = '  '.repeat(indent);
    
    if (obj === null) {
      return [<span key="null" className="text-gray-500">null</span>];
    }
    
    if (typeof obj === 'string') {
      // Resaltar placeholders de prompts
      if (obj === "TU PROMPT DEL DESARROLLADOR AQUÍ" || obj === "TU PROMPT DEL USUARIO AQUÍ") {
        return [<span key="string" className="text-orange-600 font-bold bg-orange-100 px-1 rounded">"{obj}"</span>];
      }
      return [<span key="string" className="text-green-600">"{obj}"</span>];
    }
    
    if (typeof obj === 'number') {
      return [<span key="number" className="text-blue-600">{obj}</span>];
    }
    
    if (typeof obj === 'boolean') {
      return [<span key="boolean" className="text-purple-600">{obj.toString()}</span>];
    }
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) {
        return [<span key="empty-array">[]</span>];
      }
      
      elements.push(<span key="array-start" className="text-gray-700">[</span>);
      elements.push(<br key="array-br-start" />);
      
      obj.forEach((item, index) => {
        elements.push(<span key={`array-indent-${index}`}>{indentStr}  </span>);
        elements.push(...formatJson(item, indent + 1));
        if (index < obj.length - 1) {
          elements.push(<span key={`array-comma-${index}`} className="text-gray-700">,</span>);
        }
        elements.push(<br key={`array-br-${index}`} />);
      });
      
      elements.push(<span key="array-end-indent">{indentStr}</span>);
      elements.push(<span key="array-end" className="text-gray-700">]</span>);
      
      return elements;
    }
    
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      
      if (keys.length === 0) {
        return [<span key="empty-object">{'{}'}</span>];
      }
      
      elements.push(<span key="object-start" className="text-gray-700">{'{'}</span>);
      elements.push(<br key="object-br-start" />);
      
      keys.forEach((key, index) => {
        elements.push(<span key={`object-indent-${index}`}>{indentStr}  </span>);
        elements.push(<span key={`object-key-${index}`} className="text-red-600 font-medium">"{key}"</span>);
        elements.push(<span key={`object-colon-${index}`} className="text-gray-700">: </span>);
        elements.push(...formatJson(obj[key], indent + 1));
        if (index < keys.length - 1) {
          elements.push(<span key={`object-comma-${index}`} className="text-gray-700">,</span>);
        }
        elements.push(<br key={`object-br-${index}`} />);
      });
      
      elements.push(<span key="object-end-indent">{indentStr}</span>);
      elements.push(<span key="object-end" className="text-gray-700">{'}'}</span>);
      
      return elements;
    }
    
    return [<span key="unknown">{String(obj)}</span>];
  };

  return (
    <div className={`bg-muted p-4 rounded-lg overflow-auto min-h-[400px] ${className}`}>
      <pre className="font-mono text-sm leading-relaxed">
        <code>
          {formatJson(data)}
        </code>
      </pre>
    </div>
  );
}
