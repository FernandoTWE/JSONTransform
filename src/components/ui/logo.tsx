import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 48, className = "" }: LogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 128 128"
      width={size}
      height={size}
      className={className}
    >
      {/* Fondo circular con gradiente */}
      <defs>
        <linearGradient id="bg-gradient-logo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#10B981', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#059669', stopOpacity: 1}} />
        </linearGradient>
        <linearGradient id="json-gradient-logo" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#3B82F6', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#1D4ED8', stopOpacity: 1}} />
        </linearGradient>
      </defs>
      
      {/* Fondo circular */}
      <circle cx="64" cy="64" r="60" fill="url(#bg-gradient-logo)" />
      
      {/* Llave JSON izquierda */}
      <path 
        d="M25 35 C20 35, 15 40, 15 45 L15 55 C15 58, 12 60, 10 60 C12 60, 15 62, 15 65 L15 75 C15 80, 20 85, 25 85" 
        stroke="url(#json-gradient-logo)" 
        strokeWidth="4" 
        fill="none" 
        strokeLinecap="round"
      />
      
      {/* Llave JSON derecha */}
      <path 
        d="M103 35 C108 35, 113 40, 113 45 L113 55 C113 58, 116 60, 118 60 C116 60, 113 62, 113 65 L113 75 C113 80, 108 85, 103 85" 
        stroke="url(#json-gradient-logo)" 
        strokeWidth="4" 
        fill="none" 
        strokeLinecap="round"
      />
      
      {/* Flecha de transformación */}
      <path 
        d="M45 60 L75 60 M70 55 L75 60 L70 65" 
        stroke="#FFFFFF" 
        strokeWidth="3" 
        fill="none" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Elementos de esquema (líneas estructuradas) */}
      <g stroke="#FFFFFF" strokeWidth="2" opacity="0.8">
        {/* Líneas del lado izquierdo (JSON desestructurado) */}
        <line x1="30" y1="45" x2="40" y2="45" strokeLinecap="round"/>
        <line x1="30" y1="52" x2="38" y2="52" strokeLinecap="round"/>
        <line x1="30" y1="59" x2="42" y2="59" strokeLinecap="round"/>
        <line x1="30" y1="66" x2="36" y2="66" strokeLinecap="round"/>
        <line x1="30" y1="73" x2="41" y2="73" strokeLinecap="round"/>
        
        {/* Líneas del lado derecho (esquema estructurado) */}
        <rect x="80" y="42" width="18" height="3" rx="1" fill="#FFFFFF"/>
        <rect x="80" y="49" width="15" height="3" rx="1" fill="#FFFFFF"/>
        <rect x="85" y="56" width="13" height="3" rx="1" fill="#FFFFFF"/>
        <rect x="85" y="63" width="16" height="3" rx="1" fill="#FFFFFF"/>
        <rect x="80" y="70" width="14" height="3" rx="1" fill="#FFFFFF"/>
        <rect x="80" y="77" width="17" height="3" rx="1" fill="#FFFFFF"/>
      </g>
      
      {/* Punto central de transformación */}
      <circle cx="64" cy="60" r="3" fill="#FFFFFF"/>
      
      {/* Texto pequeño "AI" en la parte inferior */}
      <text 
        x="64" 
        y="95" 
        fontFamily="Arial, sans-serif" 
        fontSize="12" 
        fontWeight="bold" 
        textAnchor="middle" 
        fill="#FFFFFF" 
        opacity="0.9"
      >
        AI
      </text>
    </svg>
  );
}
