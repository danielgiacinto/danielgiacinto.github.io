import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent implements OnInit, AfterViewInit, OnDestroy {
  private cuadro = 0;
  private activo = false;
  private reducido = false;
  private observador?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>, private zona: NgZone) { }

  ngOnInit() {}

  ngAfterViewInit() {
    this.reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.reducido) {
      return;
    }

    const grupo = this.el.nativeElement.querySelector('.carrusel-grupo');
    if (grupo) {
      const clon = grupo.cloneNode(true) as HTMLElement;
      clon.setAttribute('aria-hidden', 'true');
      grupo.after(clon);
    }

    this.observador = new IntersectionObserver((entradas) => {
      const visible = entradas.some((entrada) => entrada.isIntersecting);
      if (visible) {
        this.iniciar();
      } else {
        this.activo = false;
        cancelAnimationFrame(this.cuadro);
      }
    }, { rootMargin: '160px' });

    this.observador.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.activo = false;
    cancelAnimationFrame(this.cuadro);
    this.observador?.disconnect();
  }

  private iniciar() {
    if (this.activo) {
      return;
    }
    this.activo = true;
    this.zona.runOutsideAngular(() => {
      const paso = () => {
        if (!this.activo) {
          return;
        }
        this.actualizarEnfoque();
        this.cuadro = requestAnimationFrame(paso);
      };
      this.cuadro = requestAnimationFrame(paso);
    });
  }

  private actualizarEnfoque() {
    const centro = window.innerWidth / 2;
    const alcance = Math.max(window.innerWidth * 0.36, 260);
    const items = this.el.nativeElement.querySelectorAll('.carrusel-grupo > li');
    items.forEach((nodo) => {
      const item = nodo as HTMLElement;
      const caja = item.getBoundingClientRect();
      const medio = caja.left + caja.width / 2;
      const enfoque = Math.max(0, Math.min(1, 1 - Math.abs(medio - centro) / alcance));
      item.style.setProperty('--enfoque', enfoque.toFixed(3));
    });
  }
}
