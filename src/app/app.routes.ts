import { Routes } from '@angular/router';
import { SplashComponent } from './componentes/splash/splash';
import { Login } from './componentes/login/login'; 

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
  
  // RUTA OPCIONAL: Si el usuario teclea una URL incorrecta, redirige al inicio
  {
    path: '**',
    redirectTo: '' 
  }
];