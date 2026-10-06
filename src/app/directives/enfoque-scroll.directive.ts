import { AfterViewInit, Directive, ElementRef, Input, NgZone, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appEnfoqueScroll]'
})
export class EnfoqueScrollDirective implements AfterViewInit, OnDestroy {

  @Input() appEnfoqueScroll = '';

  private cuadro = 0;
  private reducido = false;
  private desuscribir?: () => void;

  constructor(
    private el: ElementRef<HTMLElement>,
    private zona: NgZone
  ) {}

  ngAfterViewInit() {
    this.reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.actualizar();
    if (this.reducido) {
      return;
    }
    this.zona.runOutsideAngular(() => {
      this.desuscribir = () => {
        window.removeEventListener('scroll', this.alDesplazar);
        window.removeEventListener('resize', this.alDesplazar);
      };
      window.addEventListener('scroll', this.alDesplazar, { passive: true });
      window.addEventListener('resize', this.alDesplazar);
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.cuadro);
    this.desuscribir?.();
  }

  private alDesplazar = () => {
    cancelAnimationFrame(this.cuadro);
    this.cuadro = requestAnimationFrame(() => this.actualizar());
  };

  private actualizar() {
    const nodo = this.el.nativeElement;
    const elementos = this.objetivos();
    const centroY = window.innerHeight * 0.46;
    const centroX = window.innerWidth / 2;

    elementos.forEach((elemento) => {
      if (this.reducido) {
        elemento.style.setProperty('--enfoque', '1');
        return;
      }
      const rect = elemento.getBoundingClientRect();
      const medioY = rect.top + rect.height / 2;
      const medioX = rect.left + rect.width / 2;
      const dy = Math.abs(medioY - centroY) / (window.innerHeight * 0.42);
      const dx = Math.abs(medioX - centroX) / (window.innerWidth * 0.55);
      const enfoque = Math.max(0, Math.min(1, 1 - Math.hypot(dx * 0.35, dy)));
      elemento.style.setProperty('--enfoque', enfoque.toFixed(3));
    });

    if (this.appEnfoqueScroll === 'linea') {
      const rect = nodo.getBoundingClientRect();
      const recorrido = window.innerHeight * 0.55 - rect.top;
      const avance = Math.max(0, Math.min(1, recorrido / Math.max(rect.height, 1)));
      nodo.style.setProperty('--avance', this.reducido ? '1' : avance.toFixed(3));
    }
  }

  private objetivos(): HTMLElement[] {
    const nodo = this.el.nativeElement;
    if (this.appEnfoqueScroll === 'hijos') {
      return Array.from(nodo.children) as HTMLElement[];
    }
    if (this.appEnfoqueScroll === 'linea') {
      return Array.from(nodo.querySelectorAll('.timeline-item')) as HTMLElement[];
    }
    return [nodo];
  }
}
