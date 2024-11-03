import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  isDarkMode = true;


  toggleTheme() {
    setTimeout(() => {
      this.isDarkMode = !this.isDarkMode;
    }, 750);
  }

  openCV() {
    window.open('/assets/cv.pdf', '_blank');
  }
}
