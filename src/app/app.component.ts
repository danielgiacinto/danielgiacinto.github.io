import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  isDarkMode = true;
  showScrollTop = false;
  seccionActiva = '';

  ngOnInit() {
    const temaGuardado = localStorage.getItem('tema');
    if (temaGuardado === 'claro') {
      this.isDarkMode = false;
    }
    this.onWindowScroll();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showScrollTop = scrollPosition > 150;
    this.actualizarSeccionActiva(scrollPosition);
  }

  toggleTheme() {
    setTimeout(() => {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('tema', this.isDarkMode ? 'oscuro' : 'claro');
    }, 750);
  }

  openCV() {
    window.open('/assets/cv.pdf', '_blank');
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  private actualizarSeccionActiva(scrollPosition: number) {
    const secciones = ['experience', 'education', 'skills', 'projects'];
    const margen = 160;
    let activa = '';

    secciones.forEach((id) => {
      const elemento = document.getElementById(id);
      if (elemento && elemento.offsetTop - margen <= scrollPosition) {
        activa = id;
      }
    });

    this.seccionActiva = activa;
  }
}
