import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';

interface BufferDoble {
  leer: WebGLTexture;
  escribir: WebGLTexture;
  leerFbo: WebGLFramebuffer;
  escribirFbo: WebGLFramebuffer;
}

const VERTICE = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const SPLAT = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uObjetivo;
uniform vec2 uPunto;
uniform vec3 uColor;
uniform float uRadio;
void main() {
  vec2 p = vUv - uPunto;
  float goteo = exp(-dot(p, p) / uRadio);
  vec3 base = texture2D(uObjetivo, vUv).xyz;
  gl_FragColor = vec4(base + goteo * uColor, 1.0);
}
`;

const ADVECCION = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocidad;
uniform sampler2D uOrigen;
uniform float uDt;
uniform float uDisipacion;
uniform float uEsVelocidad;
void main() {
  vec2 vel = texture2D(uVelocidad, vUv).xy;
  vec2 coord = vUv - uDt * vel;
  vec2 signo = vec2(1.0);
  if (coord.x < 0.0) { coord.x = -coord.x; signo.x = -1.0; }
  if (coord.x > 1.0) { coord.x = 2.0 - coord.x; signo.x = -1.0; }
  if (coord.y < 0.0) { coord.y = -coord.y; signo.y = -1.0; }
  if (coord.y > 1.0) { coord.y = 2.0 - coord.y; signo.y = -1.0; }
  vec4 valor = texture2D(uOrigen, clamp(coord, 0.0, 1.0));
  if (uEsVelocidad > 0.5) {
    valor.xy *= signo;
  }
  float decaimiento = 1.0 + uDisipacion * uDt;
  gl_FragColor = valor / decaimiento;
}
`;

const DIVERGENCIA = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVelocidad;
uniform vec2 uTexel;
void main() {
  float izq = texture2D(uVelocidad, vUv - vec2(uTexel.x, 0.0)).x;
  float der = texture2D(uVelocidad, vUv + vec2(uTexel.x, 0.0)).x;
  float aba = texture2D(uVelocidad, vUv - vec2(0.0, uTexel.y)).y;
  float arr = texture2D(uVelocidad, vUv + vec2(0.0, uTexel.y)).y;
  if (vUv.x < uTexel.x) izq = -der;
  if (vUv.x > 1.0 - uTexel.x) der = -izq;
  if (vUv.y < uTexel.y) aba = -arr;
  if (vUv.y > 1.0 - uTexel.y) arr = -aba;
  float div = 0.5 * (der - izq + arr - aba);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}
`;

const PRESION = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPresion;
uniform sampler2D uDivergencia;
uniform vec2 uTexel;
void main() {
  float izq = texture2D(uPresion, vUv - vec2(uTexel.x, 0.0)).x;
  float der = texture2D(uPresion, vUv + vec2(uTexel.x, 0.0)).x;
  float aba = texture2D(uPresion, vUv - vec2(0.0, uTexel.y)).x;
  float arr = texture2D(uPresion, vUv + vec2(0.0, uTexel.y)).x;
  float div = texture2D(uDivergencia, vUv).x;
  float p = (izq + der + aba + arr - div) * 0.25;
  gl_FragColor = vec4(p, 0.0, 0.0, 1.0);
}
`;

const GRADIENTE = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uPresion;
uniform sampler2D uVelocidad;
uniform vec2 uTexel;
void main() {
  float izq = texture2D(uPresion, vUv - vec2(uTexel.x, 0.0)).x;
  float der = texture2D(uPresion, vUv + vec2(uTexel.x, 0.0)).x;
  float aba = texture2D(uPresion, vUv - vec2(0.0, uTexel.y)).x;
  float arr = texture2D(uPresion, vUv + vec2(0.0, uTexel.y)).x;
  vec2 vel = texture2D(uVelocidad, vUv).xy;
  vel -= vec2(der - izq, arr - aba) * 0.5;
  if (vUv.x < uTexel.x || vUv.x > 1.0 - uTexel.x) vel.x *= -1.0;
  if (vUv.y < uTexel.y || vUv.y > 1.0 - uTexel.y) vel.y *= -1.0;
  gl_FragColor = vec4(vel, 0.0, 1.0);
}
`;

const PANTALLA = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTinte;
uniform float uClaro;
void main() {
  vec3 color = texture2D(uTinte, vUv).rgb;
  float pico = max(color.r, max(color.g, color.b));
  vec3 tono = pico > 0.001 ? color / pico : color;
  if (uClaro > 0.5) {
    tono = mix(vec3(0.15, 0.55, 0.72), tono, 0.78);
    float intensidad = min(pico / (1.0 + pico * 1.6), 0.42);
    gl_FragColor = vec4(tono, intensidad);
    return;
  }
  float intensidad = min(pico / (1.0 + pico * 3.2), 0.38);
  gl_FragColor = vec4(tono * intensidad, intensidad);
}
`;

@Component({
  selector: 'app-cursor-personalizado',
  templateUrl: './cursor-personalizado.component.html',
  styleUrls: ['./cursor-personalizado.component.css']
})
export class CursorPersonalizadoComponent implements AfterViewInit, OnDestroy {

  @ViewChild('lienzo') lienzoRef!: ElementRef<HTMLCanvasElement>;

  private gl!: WebGL2RenderingContext;
  private programas = new Map<string, WebGLProgram>();
  private velocidad!: BufferDoble;
  private tinte!: BufferDoble;
  private divergenciaTex!: WebGLTexture;
  private divergenciaFbo!: WebGLFramebuffer;
  private presion!: BufferDoble;
  private bufferCuadro!: WebGLBuffer;
  private simAncho = 96;
  private simAlto = 54;
  private tinteAncho = 360;
  private tinteAlto = 200;
  private previoX = 0;
  private previoY = 0;
  private hayPrevio = false;
  private tono = 0;
  private cuadro = 0;
  private bucleActivo = false;
  private cuadrosRestantes = 0;
  private activo = false;
  private desuscribirMover?: () => void;
  private desuscribirTamano?: () => void;

  constructor(private zona: NgZone) {}

  ngAfterViewInit() {
    const fino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.activo = fino && !reducido;
    if (!this.activo) {
      return;
    }

    const lienzo = this.lienzoRef.nativeElement;
    const gl = lienzo.getContext('webgl2', {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      powerPreference: 'low-power'
    });
    if (!gl || !gl.getExtension('EXT_color_buffer_float')) {
      return;
    }
    this.gl = gl;
    if (!this.preparar()) {
      return;
    }
    this.ajustar();

    this.zona.runOutsideAngular(() => {
      this.desuscribirMover = this.escuchar('pointermove', (evento) => this.alMover(evento));
      const alRedimensionar = () => this.ajustar();
      window.addEventListener('resize', alRedimensionar);
      this.desuscribirTamano = () => window.removeEventListener('resize', alRedimensionar);
    });
  }

  ngOnDestroy() {
    this.detenerBucle();
    this.desuscribirMover?.();
    this.desuscribirTamano?.();
    this.gl?.getExtension('WEBGL_lose_context')?.loseContext();
  }

  private preparar() {
    const gl = this.gl;
    const pares: Array<[string, string]> = [
      ['splat', SPLAT],
      ['adveccion', ADVECCION],
      ['divergencia', DIVERGENCIA],
      ['presion', PRESION],
      ['gradiente', GRADIENTE],
      ['pantalla', PANTALLA]
    ];
    for (const [nombre, fragmento] of pares) {
      const programa = this.compilar(VERTICE, fragmento);
      if (!programa) {
        return false;
      }
      this.programas.set(nombre, programa);
    }

    this.bufferCuadro = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferCuadro);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    return true;
  }

  private compilar(vertice: string, fragmento: string) {
    const gl = this.gl;
    const programa = gl.createProgram();
    if (!programa) {
      return null;
    }
    const sv = this.shader(gl.VERTEX_SHADER, vertice);
    const sf = this.shader(gl.FRAGMENT_SHADER, fragmento);
    if (!sv || !sf) {
      return null;
    }
    gl.attachShader(programa, sv);
    gl.attachShader(programa, sf);
    gl.bindAttribLocation(programa, 0, 'aPos');
    gl.linkProgram(programa);
    gl.deleteShader(sv);
    gl.deleteShader(sf);
    if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) {
      return null;
    }
    return programa;
  }

  private shader(tipo: number, codigo: string) {
    const gl = this.gl;
    const shader = gl.createShader(tipo);
    if (!shader) {
      return null;
    }
    gl.shaderSource(shader, codigo);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private crearTextura(ancho: number, alto: number) {
    const gl = this.gl;
    const textura = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, textura);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, ancho, alto, 0, gl.RGBA, gl.HALF_FLOAT, null);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textura, 0);
    return { textura, fbo };
  }

  private crearDoble(ancho: number, alto: number): BufferDoble {
    const a = this.crearTextura(ancho, alto);
    const b = this.crearTextura(ancho, alto);
    return { leer: a.textura, escribir: b.textura, leerFbo: a.fbo, escribirFbo: b.fbo };
  }

  private intercambiar(buffer: BufferDoble) {
    const leer = buffer.leer;
    const leerFbo = buffer.leerFbo;
    buffer.leer = buffer.escribir;
    buffer.leerFbo = buffer.escribirFbo;
    buffer.escribir = leer;
    buffer.escribirFbo = leerFbo;
  }

  private ajustar() {
    const lienzo = this.lienzoRef?.nativeElement;
    if (!lienzo || !this.gl) {
      return;
    }
    const densidad = Math.min(window.devicePixelRatio || 1, 1.5);
    const ancho = Math.max(1, Math.floor(window.innerWidth * densidad));
    const alto = Math.max(1, Math.floor(window.innerHeight * densidad));
    if (lienzo.width !== ancho || lienzo.height !== alto) {
      lienzo.width = ancho;
      lienzo.height = alto;
    }
    const aspecto = window.innerWidth / Math.max(1, window.innerHeight);
    this.simAlto = 64;
    this.simAncho = Math.max(64, Math.round(this.simAlto * aspecto));
    this.tinteAlto = 180;
    this.tinteAncho = Math.max(180, Math.round(this.tinteAlto * aspecto));
    this.velocidad = this.crearDoble(this.simAncho, this.simAlto);
    this.presion = this.crearDoble(this.simAncho, this.simAlto);
    const divergencia = this.crearTextura(this.simAncho, this.simAlto);
    this.divergenciaTex = divergencia.textura;
    this.divergenciaFbo = divergencia.fbo;
    this.tinte = this.crearDoble(this.tinteAncho, this.tinteAlto);
    this.hayPrevio = false;
  }

  private escuchar(evento: string, manejador: (e: PointerEvent) => void) {
    window.addEventListener(evento, manejador as EventListener, { passive: true });
    return () => window.removeEventListener(evento, manejador as EventListener);
  }

  private alMover(evento: PointerEvent) {
    if (evento.pointerType && evento.pointerType !== 'mouse') {
      return;
    }
    const x = evento.clientX;
    const y = evento.clientY;
    if (!this.hayPrevio) {
      this.previoX = x;
      this.previoY = y;
      this.hayPrevio = true;
      return;
    }
    const ancho = window.innerWidth;
    const alto = window.innerHeight;
    const dx = (x - this.previoX) / ancho;
    const dy = (y - this.previoY) / alto;
    this.previoX = x;
    this.previoY = y;
    if (dx * dx + dy * dy < 0.0000004) {
      return;
    }
    const uvx = x / ancho;
    const uvy = 1 - y / alto;
    const color = this.color();
    const fuerza = 8;
    this.salpicar(this.velocidad, this.simAncho, this.simAlto, uvx, uvy, dx * fuerza, -dy * fuerza, 0, 0.0011);
    this.salpicar(this.tinte, this.tinteAncho, this.tinteAlto, uvx, uvy, color[0], color[1], color[2], 0.0022);
    this.cuadrosRestantes = 150;
    this.iniciarBucle();
  }

  private color(): [number, number, number] {
    this.tono += 0.15;
    const mezcla = (Math.sin(this.tono) + 1) * 0.5;
    return [
      0.04 + mezcla * 0.26,
      0.38 - mezcla * 0.2,
      0.52 + mezcla * 0.14
    ];
  }

  private salpicar(
    buffer: BufferDoble,
    ancho: number,
    alto: number,
    x: number,
    y: number,
    r: number,
    g: number,
    b: number,
    radio = 0.001
  ) {
    const gl = this.gl;
    const programa = this.programas.get('splat')!;
    gl.useProgram(programa);
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer.escribirFbo);
    gl.viewport(0, 0, ancho, alto);
    this.atributo(programa);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, buffer.leer);
    gl.uniform1i(gl.getUniformLocation(programa, 'uObjetivo'), 0);
    gl.uniform2f(gl.getUniformLocation(programa, 'uPunto'), x, y);
    gl.uniform3f(gl.getUniformLocation(programa, 'uColor'), r, g, b);
    gl.uniform1f(gl.getUniformLocation(programa, 'uRadio'), radio);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.intercambiar(buffer);
  }

  private iniciarBucle() {
    if (this.bucleActivo) {
      return;
    }
    this.bucleActivo = true;
    this.cuadro = requestAnimationFrame(() => this.animar());
  }

  private detenerBucle() {
    cancelAnimationFrame(this.cuadro);
    this.bucleActivo = false;
  }

  private animar() {
    this.paso();
    this.cuadrosRestantes -= 1;
    if (this.cuadrosRestantes > 0) {
      this.cuadro = requestAnimationFrame(() => this.animar());
      return;
    }
    this.bucleActivo = false;
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  private paso() {
    const dt = 0.016;
    const texel: [number, number] = [1 / this.simAncho, 1 / this.simAlto];
    this.procesar('adveccion', this.velocidad.escribirFbo, this.simAncho, this.simAlto, (programa) => {
      this.textura(programa, 'uVelocidad', this.velocidad.leer, 0);
      this.textura(programa, 'uOrigen', this.velocidad.leer, 1);
      this.gl.uniform1f(this.gl.getUniformLocation(programa, 'uDt'), dt);
      this.gl.uniform1f(this.gl.getUniformLocation(programa, 'uDisipacion'), 0.55);
      this.gl.uniform1f(this.gl.getUniformLocation(programa, 'uEsVelocidad'), 1);
    });
    this.intercambiar(this.velocidad);

    this.procesar('divergencia', this.divergenciaFbo, this.simAncho, this.simAlto, (programa) => {
      this.textura(programa, 'uVelocidad', this.velocidad.leer, 0);
      this.gl.uniform2f(this.gl.getUniformLocation(programa, 'uTexel'), texel[0], texel[1]);
    });

    for (let i = 0; i < 10; i++) {
      this.procesar('presion', this.presion.escribirFbo, this.simAncho, this.simAlto, (programa) => {
        this.textura(programa, 'uPresion', this.presion.leer, 0);
        this.textura(programa, 'uDivergencia', this.divergenciaTex, 1);
        this.gl.uniform2f(this.gl.getUniformLocation(programa, 'uTexel'), texel[0], texel[1]);
      });
      this.intercambiar(this.presion);
    }

    this.procesar('gradiente', this.velocidad.escribirFbo, this.simAncho, this.simAlto, (programa) => {
      this.textura(programa, 'uPresion', this.presion.leer, 0);
      this.textura(programa, 'uVelocidad', this.velocidad.leer, 1);
      this.gl.uniform2f(this.gl.getUniformLocation(programa, 'uTexel'), texel[0], texel[1]);
    });
    this.intercambiar(this.velocidad);

    this.procesar('adveccion', this.tinte.escribirFbo, this.tinteAncho, this.tinteAlto, (programa) => {
      this.textura(programa, 'uVelocidad', this.velocidad.leer, 0);
      this.textura(programa, 'uOrigen', this.tinte.leer, 1);
      this.gl.uniform1f(this.gl.getUniformLocation(programa, 'uDt'), dt);
      this.gl.uniform1f(this.gl.getUniformLocation(programa, 'uDisipacion'), 2.2);
      this.gl.uniform1f(this.gl.getUniformLocation(programa, 'uEsVelocidad'), 0);
    });
    this.intercambiar(this.tinte);

    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const programa = this.programas.get('pantalla')!;
    gl.useProgram(programa);
    this.atributo(programa);
    this.textura(programa, 'uTinte', this.tinte.leer, 0);
    const claro = document.querySelector('.fondo-pagina')?.classList.contains('modo-claro') ?? false;
    gl.uniform1f(gl.getUniformLocation(programa, 'uClaro'), claro ? 1 : 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private procesar(
    nombre: string,
    fbo: WebGLFramebuffer,
    ancho: number,
    alto: number,
    uniforms: (programa: WebGLProgram) => void
  ) {
    const gl = this.gl;
    const programa = this.programas.get(nombre)!;
    gl.useProgram(programa);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, ancho, alto);
    this.atributo(programa);
    uniforms(programa);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private textura(programa: WebGLProgram, nombre: string, textura: WebGLTexture, unidad: number) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unidad);
    gl.bindTexture(gl.TEXTURE_2D, textura);
    gl.uniform1i(gl.getUniformLocation(programa, nombre), unidad);
  }

  private atributo(programa: WebGLProgram) {
    const gl = this.gl;
    const lugar = gl.getAttribLocation(programa, 'aPos');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bufferCuadro);
    gl.enableVertexAttribArray(lugar);
    gl.vertexAttribPointer(lugar, 2, gl.FLOAT, false, 0, 0);
  }
}
