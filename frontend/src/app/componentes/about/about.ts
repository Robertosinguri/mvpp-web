import { Component, importProvidersFrom } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GamingNeonBackgroundComponent } from '../gaming-neon-background/gaming-neon-background';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [GamingNeonBackgroundComponent, CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {

  constructor(
    private router: Router
  ) {}


 volver() {
    this.router.navigate(['/dashboard']);
  }
}
