import { Component, importProvidersFrom } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { bkgComponent} from '../background/background';
import { NavbarComponent } from '../navbar/navbar';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [bkgComponent, CommonModule, NavbarComponent],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {

  constructor(
    private router: Router
  ) {}

}
