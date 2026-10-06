import { AfterViewInit, Directive, ElementRef, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appTextoHover]'
})
export class TextoHoverDirective implements AfterViewInit, OnDestroy {

  private readonly glifos = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  private readonly letras: HTMLElement[] = [];
  private readonly pendientes: number[] = [];
  private readonly controlador = new AbortController();
  private activo = false;
  private observador?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (reducido || !fino) {
      return;
    }

    const etiqueta = (this.el.nativeElement.innerText || '').replace(/\s+/g, ' ').trim();
    this.fragmentar(this.el.nativeElement);
    if (etiqueta) {
      this.el.nativeElement.setAttribute('aria-label', etiqueta);
    }
    if (this.letras.length === 0) {
      return;
    }

    this.activo = true;
    const opciones = { signal: this.controlador.signal };
    const nodo = this.el.nativeElement;
    nodo.addEventListener('pointerenter', this.alEntrar, opciones);
    nodo.addEventListener('pointermove', this.alMover, opciones);
    nodo.addEventListener('pointerleave', this.alSalir, opciones);

    this.observador = new IntersectionObserver((entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) {
          return;
        }
        this.alEntrar();
        this.observador?.disconnect();
      });
    }, { threshold: 0.65 });
    this.observador.observe(nodo);
  }

  ngOnDestroy() {
    this.controlador.abort();
    this.observador?.disconnect();
    this.limpiarPendientes();
  }

  private fragmentar(nodo: Node) {
    const hijos = Array.from(nodo.childNodes);
    for (const hijo of hijos) {
      if (hijo.nodeType === Node.TEXT_NODE) {
        const texto = hijo.textContent ?? '';
        if (!texto.trim()) {
          continue;
        }
        const fragmento = document.createDocumentFragment();
        for (const caracter of texto) {
          if (caracter === ' ' || caracter === '\n') {
            fragmento.appendChild(document.createTextNode(caracter));
            continue;
          }
          const letra = document.createElement('span');
          letra.className = 'letra-interactiva';
          letra.setAttribute('aria-hidden', 'true');
          letra.textContent = caracter;
          letra.dataset['original'] = caracter;
          fragmento.appendChild(letra);
          this.letras.push(letra);
        }
        nodo.replaceChild(fragmento, hijo);
      } else if (hijo.nodeType === Node.ELEMENT_NODE) {
        const elemento = hijo as HTMLElement;
        if (elemento.tagName === 'I' || elemento.classList.contains('bi') || elemento.classList.contains('letra-interactiva')) {
          continue;
        }
        this.fragmentar(elemento);
      }
    }
  }

  private alEntrar = () => {
    this.restaurar(false);
    this.letras.forEach((letra, indice) => {
      const inicio = window.setTimeout(() => {
        let paso = 0;
        const intervalo = window.setInterval(() => {
          const original = letra.dataset['original'] ?? '';
          if (paso < 4) {
            letra.textContent = this.glifos[Math.floor(Math.random() * this.glifos.length)];
            paso++;
          } else {
            letra.textContent = original;
            window.clearInterval(intervalo);
          }
        }, 32);
        this.pendientes.push(intervalo);
      }, indice * 16);
      this.pendientes.push(inicio);
    });
  };

  private alMover = (evento: PointerEvent) => {
    for (const letra of this.letras) {
      const rect = letra.getBoundingClientRect();
      const centroX = rect.left + rect.width / 2;
      const centroY = rect.top + rect.height / 2;
      const distancia = Math.hypot(evento.clientX - centroX, evento.clientY - centroY);
      const influencia = Math.max(0, 1 - distancia / 130);
      const ancho = Math.round(104 + influencia * 46);
      const peso = Math.round(540 + influencia * 260);
      letra.style.setProperty('font-stretch', `${ancho}%`, 'important');
      letra.style.setProperty('font-weight', String(peso), 'important');
      letra.style.opacity = (0.5 + influencia * 0.5).toFixed(3);
    }
  };

  private alSalir = () => {
    this.restaurar(true);
  };

  private restaurar(limpiarEstilo: boolean) {
    this.limpiarPendientes();
    if (!this.activo && !limpiarEstilo) {
      return;
    }
    for (const letra of this.letras) {
      letra.textContent = letra.dataset['original'] ?? letra.textContent;
      if (limpiarEstilo) {
        letra.style.removeProperty('font-stretch');
        letra.style.removeProperty('font-weight');
        letra.style.opacity = '';
      }
    }
  }

  private limpiarPendientes() {
    this.pendientes.forEach((id) => window.clearTimeout(id));
    this.pendientes.length = 0;
  }
}
