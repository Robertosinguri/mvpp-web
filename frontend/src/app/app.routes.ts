//import { Routes } from '@angular/router';
import { SplashComponent } from './componentes/splash/splash';
import { Login } from './componentes/login/login';
import { DashboardComponent } from './componentes/dashboard/dashboard';
import { ConfigurarSalaComponent } from './componentes/configurar-sala/configurar-sala';
import { LobbyComponent } from './componentes/lobby/lobby';
import { EntrenamientoComponent } from './componentes/entrenamiento/entrenamiento';
import { JuegoComponent } from './componentes/juego/juego'; 
import { About } from './componentes/about/about';
import { Routes } from '@angular/router';
import { RankingComponent } from './componentes/ranking/ranking'; // Asegúrate que la ruta sea correcta

export const routes: Routes = [
  // RUTA 1: La ruta raíz (la primera que se carga)
  {
    path: '', 
    component: SplashComponent
  },
  
  // RUTA 2: El destino de la navegación de tu timer
  {
    path: 'login',
    component: Login // El destino de la navegación
  },
  
  // RUTA 3: Dashboard principal después del login
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  
  // RUTA 4: Configurar sala (crear)
  {
    path: 'crear-sala',
    component: ConfigurarSalaComponent
  },
  
  // RUTA 5: Configurar sala (unirse)
  {
    path: 'unirse-sala',
    component: ConfigurarSalaComponent
  },
  
  // RUTA 6: Lobby de la sala
  {
    path: 'lobby',
    component: LobbyComponent
  },
  
  // RUTA 7: Entrenamiento individual
  {
    path: 'entrenamiento',
    component: EntrenamientoComponent
  },
  
  // RUTA 8: Juego (entrenamiento y multijugador)
  {
    path: 'juego',
    component: JuegoComponent
  },
  
  // RUTA 9: About
  {
    path: 'about',
    component: About
  },
  
  // RUTA OPCIONAL: Si el usuario teclea una URL incorrecta, redirige al inicio
  {
    path: '**',
    redirectTo: '' 
  },
  
  { path: 'ranking', 
    component: RankingComponent 
  },
  

];