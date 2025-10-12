import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  // 💡 ¡CORRECCIÓN CLAVE AQUÍ!
  standalone: true, 
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent { // <-- Llama a la clase 'AppComponent'
  protected readonly title = signal('mvpp-web');
}