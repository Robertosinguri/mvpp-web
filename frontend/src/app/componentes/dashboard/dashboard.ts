import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CognitoAuthService } from '../../servicios/cognitoAuth/cognito-auth.service';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { GeminiService } from '../../servicios/gemini/gemini.service';


interface ConfiguracionJuego {
  tematica: string;
  dificultad: 'baby' | 'conocedor' | 'killer';
  jugadores?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {
  userName: string = '';
  codigoSala: string = 'ABC123'; // Código de prueba precargado
  
  showStats = false;
  userEmail = '';
  profileImage: string | null = null;
  isGeneratingAvatar = false;
  showAvatarGenerator = false;
  currentQuestion = 1;
  avatarAnswers = {
    style: '',
    character: '',
    personality: ''
  };
  personalityText = '';
  
  estadisticas = {
    partidasJugadas: 12,
    mejorPuntaje: 5,
    promedio: 3.8,
    posicionRanking: 47
  };

  constructor(
    private router: Router,
    private cognitoAuth: CognitoAuthService,
    private geminiService: GeminiService
  ) {}

  async ngOnInit() {
    const user = this.cognitoAuth.currentUser$();
    if (user) {
      try {
        const attributes = await fetchUserAttributes();
        this.userName = attributes.name || user.username || 'Usuario';
        this.userEmail = attributes.email || user.email || 'email@ejemplo.com';
      } catch (error) {
        this.userName = user.username || 'Usuario';
        this.userEmail = user.email || 'email@ejemplo.com';
      }
      
      // Cargar imagen de perfil guardada
      const savedImage = localStorage.getItem('profileImage');
      if (savedImage) {
        this.profileImage = savedImage;
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  crearSala() {
    this.router.navigate(['/crear-sala']);
  }

  unirseASala() {
    const codigo = this.codigoSala.trim();
    
    if (codigo) {
      this.router.navigate(['/unirse-sala'], { 
        queryParams: { codigo: codigo.toUpperCase() } 
      });
    }
  }

  iniciarEntrenamiento() {
    this.router.navigate(['/entrenamiento']);
  }

  navegarA(ruta: string) {
    this.router.navigate([`/${ruta}`]);
  }

  getInitials(): string {
    return this.userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  toggleStats() {
    this.showStats = !this.showStats;
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImage = e.target.result;
        localStorage.setItem('profileImage', this.profileImage!);
      };
      reader.readAsDataURL(file);
    }
  }

  openAvatarGenerator() {
    console.log('Abriendo generador de avatar');
    this.showAvatarGenerator = true;
    this.currentQuestion = 1;
    this.avatarAnswers = { style: '', character: '', personality: '' };
    this.personalityText = '';
    console.log('showAvatarGenerator:', this.showAvatarGenerator);
  }

  closeAvatarGenerator() {
    this.showAvatarGenerator = false;
  }

  selectAnswer(category: string, answer: string) {
    (this.avatarAnswers as any)[category] = answer;
    
    if (this.currentQuestion < 3) {
      this.currentQuestion++;
    }
  }

  async generateAvatarFromAnswers() {
    this.avatarAnswers.personality = this.personalityText.trim();
    this.isGeneratingAvatar = true;
    try {
      const avatarUrl = await this.generateAvatarWithGemini();
      this.profileImage = avatarUrl;
      localStorage.setItem('profileImage', this.profileImage);
      this.closeAvatarGenerator();
    } catch (error) {
      console.error('Error generando avatar:', error);
    } finally {
      this.isGeneratingAvatar = false;
    }
  }

  private async generateAvatarWithGemini(): Promise<string> {
    // Crear prompt basado en las respuestas
    const prompt = this.createAvatarPrompt();
    console.log('Prompt para Gemini:', prompt);
    
    try {
      // Llamada real a Gemini para generar avatar
      const avatarUrl = await this.geminiService.generateAvatar(prompt);
      return avatarUrl;
    } catch (error) {
      console.error('Error generando avatar con Gemini:', error);
      // Fallback en caso de error
      return this.generateFallbackAvatar();
    }
  }

  private generateFallbackAvatar(): string {
    const hash = this.hashString(this.avatarAnswers.personality);
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    const bgColor = colors[hash % colors.length];
    
    const svg = `
      <svg width="150" height="150" viewBox="0 0 150 150" xmlns="http://www.w3.org/2000/svg">
        <circle cx="75" cy="75" r="75" fill="${bgColor}"/>
        <circle cx="75" cy="60" r="20" fill="#FFF"/>
        <path d="M45 100 Q75 120 105 100" stroke="#FFF" stroke-width="4" fill="none"/>
        <text x="75" y="130" text-anchor="middle" fill="#FFF" font-size="8" font-family="Arial">
          ${this.avatarAnswers.style} ${this.avatarAnswers.character}
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  private createAvatarPrompt(): string {
    const styleMap = {
      anime: 'estilo anime japonés',
      cartoon: 'estilo caricatura occidental',
      comic: 'estilo cómic americano'
    };
    
    const characterMap: {[key: string]: string} = {
      // Anime
      shonen: 'estilo shonen de acción y aventura',
      shoujo: 'estilo shoujo romántico y emotivo',
      seinen: 'estilo seinen maduro y complejo',
      // Cartoon
      classic: 'estilo cartoon clásico y nostalgico',
      modern: 'estilo cartoon moderno y colorido',
      adult: 'estilo cartoon para adultos y humor',
      // Comic
      dc: 'estilo DC Comics heroíco y épico',
      marvel: 'estilo Marvel dinámico y moderno',
      indie: 'estilo cómic independiente y alternativo'
    };
    
    return `Crear un avatar de perfil en ${styleMap[this.avatarAnswers.style as keyof typeof styleMap]}, con ${characterMap[this.avatarAnswers.character] || 'estilo general'}, que incluya los siguientes elementos: ${this.avatarAnswers.personality}. Estilo limpio, centrado, fondo simple.`;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  async logout() {
    try {
      await this.cognitoAuth.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}