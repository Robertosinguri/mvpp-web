import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamingNeonBackgroundComponent } from '../gaming-neon-background/gaming-neon-background';

@Component({
  selector: 'app-about',
  imports: [GamingNeonBackgroundComponent, CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {

}
