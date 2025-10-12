import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vegas-background',
  templateUrl: './vegas-background.html',
  styleUrls: ['./vegas-background.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class VegasBackgroundComponent {
  
  lightBulbs = [
    { x: 10, y: 15, delay: 0, color: 'pink' },
    { x: 25, y: 8, delay: 0.5, color: 'aqua' },
    { x: 40, y: 12, delay: 1, color: 'yellow' },
    { x: 55, y: 6, delay: 1.5, color: 'violet' },
    { x: 70, y: 18, delay: 0.3, color: 'pink' },
    { x: 85, y: 10, delay: 0.8, color: 'aqua' },
    { x: 15, y: 85, delay: 1.2, color: 'yellow' },
    { x: 30, y: 90, delay: 0.2, color: 'violet' },
    { x: 45, y: 88, delay: 0.7, color: 'pink' },
    { x: 60, y: 92, delay: 1.4, color: 'aqua' },
    { x: 75, y: 87, delay: 0.9, color: 'yellow' },
    { x: 90, y: 85, delay: 0.4, color: 'violet' }
  ];
  
  sparkleStars = [
    { x: 20, y: 25, delay: 0 },
    { x: 35, y: 35, delay: 0.3 },
    { x: 50, y: 20, delay: 0.6 },
    { x: 65, y: 40, delay: 0.9 },
    { x: 80, y: 30, delay: 1.2 }
  ];
  
  confetti = [
    { x: 5, delay: 0, color: '#ff508c' },
    { x: 25, delay: 1, color: '#e6bd00' },
    { x: 45, delay: 0.3, color: '#ff508c' },
    { x: 65, delay: 1.3, color: '#e6bd00' },
    { x: 85, delay: 0.7, color: '#ff508c' }
  ];
}