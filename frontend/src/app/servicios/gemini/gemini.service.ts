import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { geminiConfig } from './gemini.config';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private readonly USE_AWS_BEDROCK = geminiConfig.USE_AWS_BEDROCK;
  private readonly AWS_REGION = geminiConfig.AWS_REGION;
  private readonly BEDROCK_MODEL_ID = geminiConfig.BEDROCK_MODEL_ID;

  constructor(private http: HttpClient) {}

  async generateAvatar(prompt: string): Promise<string> {
    try {
      if (this.USE_AWS_BEDROCK) {
        const response = await this.generateWithBedrock(prompt);
        return response;
      }
      return this.generateAdvancedAvatar(prompt);
    } catch (error) {
      console.error('Error generating avatar with Bedrock:', error);
      return this.generateAdvancedAvatar(prompt);
    }
  }

  private async generateWithBedrock(prompt: string): Promise<string> {
    // Por ahora usar el fallback hasta configurar Bedrock correctamente
    console.log('Bedrock no configurado, usando fallback para:', prompt);
    return this.generateAdvancedAvatar(prompt);
  }



  private generateAdvancedAvatar(prompt: string): string {
    // Generar un avatar SVG más avanzado basado en el prompt
    const hash = this.hashString(prompt);
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F39C12', '#E74C3C', '#9B59B6'];
    const bgColor = colors[hash % colors.length];
    const accentColor = colors[(hash + 3) % colors.length];
    
    // Extraer características del prompt para personalizar el avatar
    const features = this.extractFeatures(prompt);
    
    const svg = `
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0.8" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
        
        <!-- Fondo -->
        <circle cx="100" cy="100" r="95" fill="url(#bg)" filter="url(#shadow)"/>
        
        <!-- Cara -->
        <ellipse cx="100" cy="85" rx="35" ry="40" fill="#FFF" opacity="0.9"/>
        
        <!-- Ojos -->
        <circle cx="88" cy="75" r="4" fill="#333"/>
        <circle cx="112" cy="75" r="4" fill="#333"/>
        <circle cx="89" cy="73" r="1" fill="#FFF"/>
        <circle cx="113" cy="73" r="1" fill="#FFF"/>
        
        <!-- Nariz -->
        <path d="M100 82 L98 88 L102 88 Z" fill="#DDD"/>
        
        <!-- Boca -->
        <path d="M92 95 Q100 105 108 95" stroke="#333" stroke-width="2" fill="none"/>
        
        <!-- Características especiales basadas en el prompt -->
        ${features.hair}
        ${features.accessories}
        
        <!-- Texto descriptivo -->
        <text x="100" y="170" text-anchor="middle" fill="#FFF" font-size="12" font-family="Arial, sans-serif" font-weight="bold">
          ${this.getAvatarLabel(prompt)}
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }
  
  private extractFeatures(prompt: string): {hair: string, accessories: string} {
    const lowerPrompt = prompt.toLowerCase();
    let hair = '';
    let accessories = '';
    
    // Cabello
    if (lowerPrompt.includes('cabello') || lowerPrompt.includes('pelo')) {
      if (lowerPrompt.includes('azul')) {
        hair = '<path d="M70 45 Q100 35 130 45 Q125 65 100 60 Q75 65 70 45" fill="#4A90E2"/>';
      } else if (lowerPrompt.includes('rojo')) {
        hair = '<path d="M70 45 Q100 35 130 45 Q125 65 100 60 Q75 65 70 45" fill="#E74C3C"/>';
      } else {
        hair = '<path d="M70 45 Q100 35 130 45 Q125 65 100 60 Q75 65 70 45" fill="#8B4513"/>';
      }
    }
    
    // Accesorios
    if (lowerPrompt.includes('gafas') || lowerPrompt.includes('lentes')) {
      accessories = '<rect x="82" y="70" width="36" height="12" fill="none" stroke="#333" stroke-width="2" rx="6"/><line x1="88" y1="76" x2="112" y2="76" stroke="#333" stroke-width="1"/>';
    }
    if (lowerPrompt.includes('sombrero') || lowerPrompt.includes('gorro')) {
      accessories += '<ellipse cx="100" cy="40" rx="40" ry="15" fill="#333"/><ellipse cx="100" cy="35" rx="25" ry="20" fill="#333"/>';
    }
    
    return { hair, accessories };
  }
  
  private getAvatarLabel(prompt: string): string {
    const words = prompt.split(' ').slice(0, 2);
    return words.join(' ').substring(0, 20);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}