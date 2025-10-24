import { Component, importProvidersFrom } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { bkgComponent} from '../background/background';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [bkgComponent, CommonModule],
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
