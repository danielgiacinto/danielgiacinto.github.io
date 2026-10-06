import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  ViewChild
} from '@angular/core';

interface Particula {
  origenX: number;
  origenY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  vida: number;
}

@Component({
  selector: 'app-texto-particulas',
  templateUrl: './texto-particulas.component.html',
  styleUrls: ['./texto-particulas.component.css'],
  host: {
    '(pointerenter)': 'dispersar($event)',
    '(pointerleave)': 'reunir()',
    '(pointermove)': 'seguir($event)'
  }
})
export class TextoParticulasComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Input() texto = '';
  @Input() oscuro = true;

  @ViewChild('medida') medidaRef!: ElementRef<HTMLElement>;
  @ViewChild('lienzo') lienzoRef!: ElementRef<HTMLCanvasElement>;

  interactivo = false;

  private particulas: Particula[] = [];
  private contexto: CanvasRenderingContext2D | null = null;
  private cuadro = 0;
  private estado: 'reposo' | 'dispersar' | 'reunir' = 'reposo';
  private punteroX = 0;
  private punteroY = 0;
  private clienteX = 0;
  private clienteY = 0;
  private dentro = false;
  private reducido = false;
  private punteroFino = false;
  private sucio = true;
  private dpr = 1;
  private anchoCss = 0;
  private altoCss = 0;
  private margenX = 0;
  private margenY = 0;
  private tamano = 2;
  private observador?: ResizeObserver;

  constructor(private zona: NgZone) {}

  ngAfterViewInit() {
    this.reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.punteroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    this.observador = new ResizeObserver(() => {
      this.sucio = true;
    });
    this.observador.observe(this.medidaRef.nativeElement);
  }

  ngOnChanges() {
    this.sucio = true;
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.cuadro);
    this.observador?.disconnect();
  }

  get colorTexto(): string {
    return this.oscuro ? '#f4f1ea' : '#141414';
  }

  dispersar(evento: PointerEvent) {
    if (!this.punteroFino || this.reducido) {
      return;
    }
    this.dentro = true;
    this.clienteX = evento.clientX;
    this.clienteY = evento.clientY;
    void this.prepararYDispersar();
  }

  reunir() {
    this.dentro = false;
    if (this.estado === 'reposo' || this.particulas.length === 0) {
      return;
    }
    this.estado = 'reunir';
    this.iniciarBucle();
  }

  seguir(evento: PointerEvent) {
    this.clienteX = evento.clientX;
    this.clienteY = evento.clientY;
    this.actualizarPuntero();
  }

  private async prepararYDispersar() {
    await document.fonts.ready;
    if (!this.dentro) {
      return;
    }
    if (this.sucio || this.particulas.length === 0) {
      this.construir();
    }
    this.actualizarPuntero();
    if (this.particulas.length < 12) {
      return;
    }
    this.estado = 'dispersar';
    this.zona.run(() => {
      this.interactivo = true;
    });
    this.iniciarBucle();
  }

  private construir() {
    const medida = this.medidaRef.nativeElement;
    const lienzo = this.lienzoRef.nativeElement;
    const ancho = medida.clientWidth;
    const alto = medida.clientHeight;
    if (ancho < 2 || alto < 2) {
      return;
    }

    this.margenX = Math.max(80, Math.round(ancho * 0.22));
    this.margenY = Math.max(72, Math.round(alto * 0.85));
    this.anchoCss = ancho + this.margenX * 2;
    this.altoCss = alto + this.margenY * 2;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    lienzo.width = Math.max(1, Math.floor(this.anchoCss * this.dpr));
    lienzo.height = Math.max(1, Math.floor(this.altoCss * this.dpr));
    lienzo.style.width = `${this.anchoCss}px`;
    lienzo.style.height = `${this.altoCss}px`;
    lienzo.style.left = `${-this.margenX}px`;
    lienzo.style.top = `${-this.margenY}px`;

    const ctx = lienzo.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      return;
    }
    this.contexto = ctx;

    const estilo = getComputedStyle(medida);
    const tamanoFuente = parseFloat(estilo.fontSize);
    const espaciado = estilo.letterSpacing === 'normal' ? '0px' : estilo.letterSpacing;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.font = `${estilo.fontWeight} ${tamanoFuente}px ${estilo.fontFamily}`;
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = espaciado;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = this.colorTexto;

    const anchoMedido = ctx.measureText(this.texto).width || ancho;
    const escalaX = ancho / anchoMedido;
    ctx.setTransform(this.dpr * escalaX, 0, 0, this.dpr, 0, 0);
    ctx.fillText(this.texto, this.margenX / escalaX, this.margenY + 5);

    const mapa = ctx.getImageData(0, 0, lienzo.width, lienzo.height);
    const datos = mapa.data;
    const candidatos: Array<{ x: number; y: number }> = [];
    const paso = 2;

    for (let y = 0; y < this.altoCss; y += paso) {
      for (let x = 0; x < this.anchoCss; x += paso) {
        const px = Math.min(lienzo.width - 1, Math.floor(x * this.dpr));
        const py = Math.min(lienzo.height - 1, Math.floor(y * this.dpr));
        const alfa = datos[(py * lienzo.width + px) * 4 + 3];
        if (alfa > 150) {
          candidatos.push({ x, y });
        }
      }
    }

    const salto = Math.max(1, Math.ceil(candidatos.length / 1500));
    this.tamano = salto > 1 ? paso + 0.6 : paso + 0.35;
    this.particulas = candidatos
      .filter((_, indice) => indice % salto === 0)
      .map((punto) => ({
        origenX: punto.x,
        origenY: punto.y,
        x: punto.x,
        y: punto.y,
        vx: 0,
        vy: 0,
        vida: 1
      }));

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.anchoCss, this.altoCss);
    this.sucio = false;
  }

  private actualizarPuntero() {
    const lienzo = this.lienzoRef?.nativeElement;
    const medida = this.medidaRef?.nativeElement;
    if (!medida) {
      return;
    }
    if (lienzo && lienzo.width > 0) {
      const rect = lienzo.getBoundingClientRect();
      this.punteroX = this.clienteX - rect.left;
      this.punteroY = this.clienteY - rect.top;
      return;
    }
    const rect = medida.getBoundingClientRect();
    this.punteroX = this.clienteX - rect.left + this.margenX;
    this.punteroY = this.clienteY - rect.top + this.margenY;
  }

  private iniciarBucle() {
    cancelAnimationFrame(this.cuadro);
    this.zona.runOutsideAngular(() => {
      this.cuadro = requestAnimationFrame(() => this.bucle());
    });
  }

  private bucle() {
    if (this.estado === 'reposo' || !this.contexto) {
      return;
    }

    const ctx = this.contexto;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.anchoCss, this.altoCss);
    ctx.fillStyle = this.colorTexto;

    let energia = 0;
    for (const particula of this.particulas) {
      if (this.estado === 'dispersar') {
        const dx = particula.x - this.punteroX;
        const dy = particula.y - this.punteroY;
        const distancia = Math.hypot(dx, dy) || 1;
        const fuerza = Math.max(0, 1 - distancia / 150);
        const retorno = 0.1 * (1 - fuerza);
        particula.vx += (particula.origenX - particula.x) * retorno;
        particula.vy += (particula.origenY - particula.y) * retorno;
        particula.vx += (dx / distancia) * fuerza * 1.15;
        particula.vy += (dy / distancia) * fuerza * 1.15;
        particula.vx += (Math.random() - 0.5) * 0.22;
        particula.vy += (Math.random() - 0.5) * 0.22;
        particula.vx *= 0.8;
        particula.vy *= 0.8;
        particula.x += particula.vx;
        particula.y += particula.vy;
        const objetivo = 1 - fuerza * 0.95;
        particula.vida += (objetivo - particula.vida) * 0.16;
      } else {
        particula.x += (particula.origenX - particula.x) * 0.16;
        particula.y += (particula.origenY - particula.y) * 0.16;
        particula.vx *= 0.8;
        particula.vy *= 0.8;
        particula.vida += (1 - particula.vida) * 0.16;
      }

      if (particula.vida > 0.03) {
        ctx.globalAlpha = Math.min(1, particula.vida);
        ctx.fillRect(particula.x, particula.y, this.tamano, this.tamano);
      }

      energia += Math.abs(particula.x - particula.origenX)
        + Math.abs(particula.y - particula.origenY)
        + Math.abs(1 - particula.vida);
    }

    ctx.globalAlpha = 1;

    if (this.estado === 'reunir' && energia < this.particulas.length * 0.45) {
      this.estado = 'reposo';
      for (const particula of this.particulas) {
        particula.x = particula.origenX;
        particula.y = particula.origenY;
        particula.vx = 0;
        particula.vy = 0;
        particula.vida = 1;
      }
      this.zona.run(() => {
        this.interactivo = false;
      });
      return;
    }

    this.cuadro = requestAnimationFrame(() => this.bucle());
  }
}
