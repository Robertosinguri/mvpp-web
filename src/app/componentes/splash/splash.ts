import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.html',
  styleUrls: ['./splash.scss'],
  standalone: true,
  imports: [CommonModule]
})

export class SplashComponent implements OnInit, OnDestroy {
  bubbles = Array(13); // genera 13 burbujas
  private timer: any;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.timer = setTimeout(() => {
      this.router.navigate(['/login'], { replaceUrl: true });
    }, 9000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}
