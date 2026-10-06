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
  private movimientoReducido = false;

  ngOnInit() {
    const temaGuardado = localStorage.getItem('tema');
    if (temaGuardado === 'claro') {
      this.isDarkMode = false;
    }
    this.movimientoReducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.onWindowScroll();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.showScrollTop = scrollPosition > 150;
    this.actualizarSeccionActiva(scrollPosition);
    this.desplazarHero(scrollPosition);
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

  private desplazarHero(scrollPosition: number) {
    const hero = document.querySelector('.entrada-hero') as HTMLElement | null;
    if (!hero || this.movimientoReducido) {
      return;
    }
    if (scrollPosition < 8) {
      hero.style.transform = '';
      hero.style.opacity = '';
      return;
    }
    const progreso = Math.min(scrollPosition / 520, 1);
    hero.style.transform = `translateY(${progreso * 28}px)`;
    hero.style.opacity = String(1 - progreso * 0.28);
  }
}
