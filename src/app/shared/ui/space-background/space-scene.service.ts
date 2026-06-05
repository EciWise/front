import { Injectable } from '@angular/core';
import { randomRange } from '../../util/random';
import type {
  BufferGeometry,
  Group,
  Points,
  PointsMaterial,
  PerspectiveCamera,
  Scene,
  Sprite,
  SpriteMaterial,
  Texture,
  WebGLRenderer,
} from 'three';


const STUDY_SYMBOLS = ['π', '∑', '∫', '√', 'ƒ', '∞', 'Δ', 'θ', 'λ', '×', '÷', 'Ω', '∂', '∇', '∈', '∉', '∪', '∩', '∀', '∃', '9','3'];
const SYMBOL_COLORS = [0xffffff, 0xc8102e, 0xd6007a];

interface FloatingSprite {
  readonly sprite: Sprite;
  readonly speed: number;
  readonly phase: number;
  readonly baseY: number;
  readonly drift: number;
}

@Injectable()
export class SpaceSceneService {
  private renderer?: WebGLRenderer;
  private scene?: Scene;
  private camera?: PerspectiveCamera;
  private stars?: Points;
  private geometry?: BufferGeometry;
  private material?: PointsMaterial;
  private group?: Group;
  private readonly floating: FloatingSprite[] = [];
  private readonly textures: Texture[] = [];
  private readonly spriteMaterials: SpriteMaterial[] = [];
  private frameId = 0;
  private readonly pointer = { x: 0, y: 0 };
  private clock = 0;
  private initialized = false;

  /** Inicializa la escena dentro del canvas dado (a tamaño de ventana). */
  async init(canvas: HTMLCanvasElement): Promise<void> {
    const THREE = await import('three');

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(70, this.aspect(), 0.1, 1000);
    this.camera.position.z = 3;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.buildStars(THREE);
    this.buildSymbols(THREE);
    this.resize();

    window.addEventListener('resize', this.resize);
    window.addEventListener('pointermove', this.onPointerMove);
    this.initialized = true;
    this.animate();
  }

  /**
   * Detiene la animación y libera los recursos de WebGL. No hace nada si la
   * escena nunca se inicializó (p. ej. en SSR, donde solo corre en el cliente).
   */
  dispose(): void {
    if (!this.initialized) {
      return;
    }
    this.initialized = false;
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('pointermove', this.onPointerMove);
    this.geometry?.dispose();
    this.material?.dispose();
    for (const texture of this.textures) {
      texture.dispose();
    }
    for (const material of this.spriteMaterials) {
      material.dispose();
    }
    this.renderer?.dispose();
    this.renderer = undefined;
  }

  private buildStars(THREE: typeof import('three')): void {
    const count = 2600;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < positions.length; i++) {
      positions[i] = randomRange(-6, 6);
    }
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.018,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.stars = new THREE.Points(this.geometry, this.material);
    this.scene!.add(this.stars);
  }

  private buildSymbols(THREE: typeof import('three')): void {
    this.group = new THREE.Group();
    for (let i = 0; i < 22; i++) {
      const symbol = STUDY_SYMBOLS[i % STUDY_SYMBOLS.length];
      const texture = new THREE.CanvasTexture(this.makeSymbolCanvas(symbol));
      const sprMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.7,
        color: SYMBOL_COLORS[i % SYMBOL_COLORS.length],
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(sprMaterial);
      const baseY = this.rand(-3.5, 3.5);
      sprite.position.set(this.rand(-5, 5), baseY, this.rand(-3.5, 1.5));
      const scale = this.rand(0.3, 0.7);
      sprite.scale.set(scale, scale, scale);

      this.textures.push(texture);
      this.spriteMaterials.push(sprMaterial);
      this.floating.push({
        sprite,
        speed: this.rand(0.2, 0.7),
        phase: this.rand(0, Math.PI * 2),
        baseY,
        drift: this.rand(0.1, 0.3),
      });
      this.group.add(sprite);
    }
    this.scene!.add(this.group);
  }

  /** Dibuja un símbolo académico en un canvas para usarlo como textura. */
  private makeSymbolCanvas(symbol: string): HTMLCanvasElement {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 86px Georgia, "Times New Roman", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, size / 2, size / 2 + 4);
    }
    return canvas;
  }

  private readonly animate = (): void => {
    this.frameId = requestAnimationFrame(this.animate);
    if (!this.camera || !this.renderer || !this.scene) {
      return;
    }
    this.clock += 0.016;

    if (this.stars) {
      this.stars.rotation.y += 0.0006;
      this.stars.rotation.x += 0.0002;
    }
    if (this.group) {
      this.group.rotation.y += 0.0009;
      for (const item of this.floating) {
        item.sprite.position.y =
          item.baseY + Math.sin(this.clock * item.speed + item.phase) * item.drift;
      }
    }

    this.camera.position.x += (this.pointer.x * 0.6 - this.camera.position.x) * 0.04;
    this.camera.position.y += (-this.pointer.y * 0.6 - this.camera.position.y) * 0.04;
    this.camera.lookAt(0, 0, 0);
    this.renderer.render(this.scene, this.camera);
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    this.pointer.x = event.clientX / window.innerWidth - 0.5;
    this.pointer.y = event.clientY / window.innerHeight - 0.5;
  };

  private readonly resize = (): void => {
    if (!this.renderer || !this.camera) {
      return;
    }
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  };

  private aspect(): number {
    return window.innerWidth / Math.max(window.innerHeight, 1);
  }

  private rand(min: number, max: number): number {
    return randomRange(min, max);
  }
}
