import { SplashComponent } from './componentes/splash/splash';
import { Login } from './componentes/login/login';
import { DashboardComponent } from './componentes/dashboard/dashboard';
import { ConfigurarSalaComponent } from './componentes/configurar-sala/configurar-sala';
import { LobbyComponent } from './componentes/lobby/lobby';
import { EntrenamientoComponent } from './componentes/entrenamiento/entrenamiento';
import { JuegoComponent } from './componentes/juego/juego'; 
import { About } from './componentes/about/about';
import { Routes } from '@angular/router';
import { RankingComponent } from './componentes/ranking/ranking';
import { ResultadosComponent } from './componentes/resultados/resultados';
import { ArenaComponent } from './componentes/arena/arena';
import { authGuard } from './auth.guard'; 

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
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  
  // RUTA 4: Configurar sala (crear)
  {
    path: 'crear-sala',
    component: ConfigurarSalaComponent,
    canActivate: [authGuard]
  },
  
  // RUTA 5: Configurar sala (unirse)
  {
    path: 'unirse-sala',
    component: ConfigurarSalaComponent,
    canActivate: [authGuard]
  },
  
  // RUTA 6: Lobby (sala de espera)
  {
    path: 'lobby',
    component: LobbyComponent,
    canActivate: [authGuard]
  },
  
  // RUTA 7: Entrenamiento individual
  {
    path: 'entrenamiento',
    component: EntrenamientoComponent,
    canActivate: [authGuard]
  },
  
  // RUTA 8: Juego (solo entrenamiento individual)
  {
    path: 'juego',
    component: JuegoComponent,
    canActivate: [authGuard]
  },
  
  // RUTA 9: About
  {
    path: 'about',
    component: About,
    canActivate: [authGuard]
  },

  //ruta 10: ranking
  { 
    path: 'ranking', 
    component: RankingComponent,
    canActivate: [authGuard]
  },

  // RUTA 11: Arena multijugador
  {
    path: 'arena',
    component: ArenaComponent,
    canActivate: [authGuard]
  },

  // RUTA 12: Resultados multijugador
  {
    path: 'resultados',
    component: ResultadosComponent,
    canActivate: [authGuard]
  },

  // RUTA OPCIONAL: Si el usuario teclea una URL incorrecta, redirige al dashboard
  {
    path: '**',
    redirectTo: '/dashboard' 
  }  

];