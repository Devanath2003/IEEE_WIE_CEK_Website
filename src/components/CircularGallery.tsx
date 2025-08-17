import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from "ogl";
import { useEffect, useRef, useState } from "react";

type GL = Renderer["gl"];

type GalleryItem = {
  image: string;
  text: string;
  description?: string;
  year?: number | string;
};

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: number;
  return function (this: any, ...args: Parameters<T>) {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1: number, p2: number, t: number): number {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance: any): void {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key !== "constructor" && typeof instance[key] === "function") {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function getFontSize(font: string): number {
  const match = font.match(/(\d+)px/);
  return match ? parseInt(match[1], 10) : 30;
}

function createTextTexture(
  gl: GL,
  text: string,
  font: string = "bold 30px monospace",
  color: string = "black"
): { texture: Texture; width: number; height: number } {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not get 2d context");

  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const fontSize = getFontSize(font);
  const textHeight = Math.ceil(fontSize * 1.4);

  canvas.width = textWidth + 40;
  canvas.height = textHeight + 30;

  context.font = font;
  context.fillStyle = color;
  context.textBaseline = "middle";
  context.textAlign = "center";
  context.clearRect(0, 0, canvas.width, canvas.height);

  context.shadowColor = "rgba(0, 0, 0, 0.5)";
  context.shadowBlur = 4;
  context.shadowOffsetX = 1;
  context.shadowOffsetY = 1;

  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

interface TitleProps {
  gl: GL;
  plane: Mesh;
  renderer: Renderer;
  text: string;
  textColor?: string;
  font?: string;
}

class Title {
  gl: GL;
  plane: Mesh;
  renderer: Renderer;
  text: string;
  textColor: string;
  font: string;
  mesh!: Mesh;

  constructor({ gl, plane, renderer, text, textColor = "#545050", font = "30px sans-serif" }: TitleProps) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }

  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = vec4(color.rgb, color.a * 0.9);
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textHeightScaled = this.plane.scale.y * 0.12;
    const textWidthScaled = textHeightScaled * aspect;
    this.mesh.scale.set(textWidthScaled, textHeightScaled, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeightScaled * 0.6 - 0.08;
    this.mesh.setParent(this.plane);
  }
}

interface ScreenSize {
  width: number;
  height: number;
}

interface Viewport {
  width: number;
  height: number;
}

interface MediaProps {
  geometry: Plane;
  gl: GL;
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  text: string;
  description?: string;
  year?: number | string;
  viewport: Viewport;
  bend: number;
  textColor: string;
  borderRadius?: number;
  font?: string;
  isMobile: boolean;
}

class Media {
  extra: number = 0;
  geometry: Plane;
  gl: GL;
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: ScreenSize;
  text: string;
  description?: string;
  year?: number | string;
  viewport: Viewport;
  bend: number;
  textColor: string;
  borderRadius: number;
  font?: string;
  isMobile: boolean;
  program!: Program;
  plane!: Mesh;
  title!: Title;
  padding!: number;
  width!: number;
  widthTotal!: number;
  x!: number;
  speed: number = 0;
  isBefore: boolean = false;
  isAfter: boolean = false;

  // Focus / animation
  private baseScaleX = 1;
  private baseScaleY = 1;
  private scaleTarget = 1;
  private scaleCurrent = 1;
  private zTarget = 0;
  private zCurrent = 0;

  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    description,
    year,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font,
    isMobile,
  }: MediaProps) {
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.description = description;
    this.year = year;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.isMobile = isMobile;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }

  setFocused(focused: boolean) {
    this.scaleTarget = focused ? 1.08 : 1;
    this.zTarget = focused ? 1.6 : 0;
  }

  private animateFocus() {
    this.scaleCurrent = lerp(this.scaleCurrent, this.scaleTarget, 0.15);
    this.zCurrent = lerp(this.zCurrent, this.zTarget, 0.15);
    this.plane.scale.x = this.baseScaleX * this.scaleCurrent;
    this.plane.scale.y = this.baseScaleY * this.scaleCurrent;
    this.plane.position.z = this.zCurrent;
  }

  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true });
    this.program = new Program(this.gl, {
      depthTest: true,
      depthWrite: true,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;

        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }

        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);

          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float edgeSmooth = 0.002;
          float alpha = 1.0 - smoothstep(-edgeSmooth, edgeSmooth, d);

          gl_FragColor = vec4(color.rgb, alpha);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
      },
      transparent: true,
    });
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });
    this.plane.setParent(this.scene);
  }

  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font,
    });
  }

  update(scroll: { current: number; last: number }, direction: "right" | "left") {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    // Apply bend effect (reduced on mobile but still present)
    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      // Reduce bend intensity on mobile but keep the effect
      const bendIntensity = this.isMobile ? this.bend * 0.3 : this.bend;
      const B_abs = Math.abs(bendIntensity);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (bendIntensity > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uSpeed.value = this.speed;

    // Enhanced wrap-around checks for true circular effect
    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    const bufferZone = this.isMobile ? this.plane.scale.x * 0.5 : this.plane.scale.x;
    
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset - bufferZone;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset + bufferZone;
    
    if (direction === "right" && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === "left" && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }

    // animate focus (z + scale)
    this.animateFocus();
  }

  onResize({ screen, viewport }: { screen?: ScreenSize; viewport?: Viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    const scale = this.screen.height / 1500;
    const baseY = (this.viewport.height * (900 * scale)) / this.screen.height;
    const baseX = (this.viewport.width * (700 * scale)) / this.screen.width;

    this.plane.scale.y = baseY;
    this.plane.scale.x = baseX;

    // Remember base scale for focus animation
    this.baseScaleX = baseX;
    this.baseScaleY = baseY;

    this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    
    // Adjust padding for mobile to prevent overlap while maintaining circular flow
    this.padding = this.isMobile ? this.plane.scale.x * 0.2 : 2;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

interface AppConfig {
  items?: GalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
  onItemSelect?: (payload: {
    index: number;
    data: GalleryItem;
    screenX: number;
    screenY: number;
  }) => void;
  onItemMove?: (payload: { screenX: number; screenY: number }) => void;
  onItemDeselect?: () => void;
}

class App {
  container: HTMLElement;
  scrollSpeed: number;
  scroll: {
    ease: number;
    current: number;
    target: number;
    last: number;
    position?: number;
  };
  onCheckDebounce: (...args: any[]) => void;
  renderer!: Renderer;
  gl!: GL;
  camera!: Camera;
  scene!: Transform;
  planeGeometry!: Plane;
  medias: Media[] = [];
  mediasImages: GalleryItem[] = [];
  screen!: { width: number; height: number };
  viewport!: { width: number; height: number };
  raf: number = 0;
  isMobile: boolean = false;

  // selection
  private selectedIndex: number | null = null;
  private startX = 0;
  private lastPointerX = 0;
  private isDown = false;

  // callbacks
  private onItemSelect?: AppConfig["onItemSelect"];
  private onItemMove?: AppConfig["onItemMove"];
  private onItemDeselect?: AppConfig["onItemDeselect"];

  // bound handlers
  boundOnResize!: () => void;
  boundOnWheel!: (e: Event) => void;
  boundOnTouchDown!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchMove!: (e: MouseEvent | TouchEvent) => void;
  boundOnTouchUp!: () => void;

  constructor(
    container: HTMLElement,
    {
      items,
      bend = 1,
      textColor = "#ffffff",
      borderRadius = 0,
      font = "bold 30px Figtree",
      scrollSpeed = 2,
      scrollEase = 0.05,
      onItemSelect,
      onItemMove,
      onItemDeselect,
    }: AppConfig
  ) {
    document.documentElement.classList.remove("no-js");
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);

    this.onItemSelect = onItemSelect;
    this.onItemMove = onItemMove;
    this.onItemDeselect = onItemDeselect;

    this.checkMobile();
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    this.update();
    this.addEventListeners();
  }

  checkMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.renderer.gl.canvas as HTMLCanvasElement);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 100,
    });
  }

  createMedias(
    items: GalleryItem[] | undefined,
    bend: number = 1,
    textColor: string,
    borderRadius: number,
    font: string
  ) {
    const defaultItems: GalleryItem[] = [
      { image: `https://picsum.photos/seed/1/800/600?grayscale`, text: "Bridge" },
      { image: `https://picsum.photos/seed/2/800/600?grayscale`, text: "Desk Setup" },
      { image: `https://picsum.photos/seed/3/800/600?grayscale`, text: "Waterfall" },
      { image: `https://picsum.photos/seed/4/800/600?grayscale`, text: "Strawberries" },
      { image: `https://picsum.photos/seed/5/800/600?grayscale`, text: "Deep Diving" },
      { image: `https://picsum.photos/seed/16/800/600?grayscale`, text: "Train Track" },
      { image: `https://picsum.photos/seed/17/800/600?grayscale`, text: "Santorini" },
      { image: `https://picsum.photos/seed/8/800/600?grayscale`, text: "Blurry Lights" },
      { image: `https://picsum.photos/seed/9/800/600?grayscale`, text: "New York" },
      { image: `https://picsum.photos/seed/10/800/600?grayscale`, text: "Good Boy" },
      { image: `https://picsum.photos/seed/21/800/600?grayscale`, text: "Coastline" },
      { image: `https://picsum.photos/seed/12/800/600?grayscale`, text: "Palm Trees" },
    ];

    const galleryItems = items && items.length ? items : defaultItems;
    this.mediasImages = galleryItems.concat(galleryItems);

    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        description: data.description,
        year: data.year,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font,
        isMobile: this.isMobile,
      });
    });
  }

  onTouchDown(e: MouseEvent | TouchEvent) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.startX = "touches" in e ? e.touches[0].clientX : e.clientX;
    this.lastPointerX = this.startX;
  }

  onTouchMove(e: MouseEvent | TouchEvent) {
    if (!this.isDown) return;
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    this.lastPointerX = x;
    // Increase sensitivity for mobile swiping - make it require more strength
    const sensitivity = this.isMobile ? 0.08 : 0.025;
    const distance = (this.startX - x) * (this.scrollSpeed * sensitivity);
    this.scroll.target = (this.scroll.position ?? 0) + distance;
  }

  private hitTest(clientX: number, clientY: number): number | null {
    // Convert pointer to local container coords
    const rect = this.container.getBoundingClientRect();
    const localX = clientX - rect.left;
    const localY = clientY - rect.top;

    // Convert to world coords
    const worldX = (localX / this.screen.width - 0.5) * this.viewport.width;
    const worldY = -(localY / this.screen.height - 0.5) * this.viewport.height;

    // Axis-aligned check using plane center + scale
    for (let i = 0; i < this.medias.length; i++) {
      const m = this.medias[i];
      const cx = m.plane.position.x;
      const cy = m.plane.position.y;
      const hw = m.plane.scale.x / 2;
      const hh = m.plane.scale.y / 2;
      if (worldX >= cx - hw && worldX <= cx + hw && worldY >= cy - hh && worldY <= cy + hh) {
        return i;
      }
    }
    return null;
  }

  private selectIndex(index: number | null) {
    if (this.selectedIndex !== null && this.medias[this.selectedIndex]) {
      this.medias[this.selectedIndex].setFocused(false);
    }

    this.selectedIndex = index;

    if (index === null) {
      this.onItemDeselect && this.onItemDeselect();
      return;
    }

    const m = this.medias[index];
    m.setFocused(true);

    const { screenX, screenY } = this.getScreenPosition(m);
    const data: GalleryItem = {
      image: m.image,
      text: m.text,
      description: m.description,
      year: m.year,
    };
    this.onItemSelect && this.onItemSelect({ index, data, screenX, screenY });
  }

  onTouchUp() {
    const wasDown = this.isDown;
    this.isDown = false;
    this.onCheck();

    // treat as click if movement small
    if (wasDown) {
      const moved = Math.abs(this.lastPointerX - this.startX);
      if (moved < 5) {
        // Use last pointer position to hit-test
        const index = this.hitTest(this.lastPointerX, (window as any).lastPointerY ?? 0);
        // If we can't read lastPointerY globally (Safari), fall back to center Y of container
        let pointerY = (window as any).lastPointerY as number | undefined;
        if (pointerY == null) {
          const rect = this.container.getBoundingClientRect();
          pointerY = rect.top + rect.height / 2;
        }
        const idx = this.hitTest(this.lastPointerX, pointerY!);
        this.selectIndex(idx);
      }
    }
  }

  onWheel(e: Event) {
    const wheelEvent = e as WheelEvent;
    const delta = wheelEvent.deltaY || (wheelEvent as any).wheelDelta || (wheelEvent as any).detail;
    // Adjust scroll speed for better control while maintaining circular effect
    const scrollMultiplier = this.isMobile ? 0.15 : 0.2;
    this.scroll.target += (delta > 0 ? this.scrollSpeed : -this.scrollSpeed) * scrollMultiplier;
    this.onCheckDebounce();
    // If scrolling while something is selected, keep the overlay tracking
    if (this.selectedIndex !== null) {
      const m = this.medias[this.selectedIndex];
      const { screenX, screenY } = this.getScreenPosition(m);
      this.onItemMove && this.onItemMove({ screenX, screenY });
    }
  }

  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }

  onResize() {
    this.checkMobile();
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height,
    });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach((media) => {
        media.isMobile = this.isMobile;
        media.onResize({ screen: this.screen, viewport: this.viewport });
      });
    }
  }

  private getScreenPosition(media: Media) {
    const worldX = media.plane.position.x;
    const worldY = media.plane.position.y;
    const screenX = (worldX / this.viewport.width + 0.5) * this.screen.width;
    const screenY = (-worldY / this.viewport.height + 0.5) * this.screen.height;
    return { screenX, screenY };
  }

  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? "right" : "left";
    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, direction));
    }

    // Keep overlay pinned to selected card
    if (this.selectedIndex !== null) {
      const m = this.medias[this.selectedIndex];
      const { screenX, screenY } = this.getScreenPosition(m);
      this.onItemMove && this.onItemMove({ screenX, screenY });
    }

    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }

  addEventListeners() {
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    window.addEventListener("resize", this.boundOnResize);
    window.addEventListener("mousewheel", this.boundOnWheel);
    window.addEventListener("wheel", this.boundOnWheel);
    window.addEventListener("mousedown", (e: MouseEvent) => {
      (window as any).lastPointerY = e.clientY;
      this.boundOnTouchDown(e);
    });
    window.addEventListener("mousemove", (e: MouseEvent) => {
      (window as any).lastPointerY = e.clientY;
      this.boundOnTouchMove(e);
    });
    window.addEventListener("mouseup", this.boundOnTouchUp);
    window.addEventListener("touchstart", (e: TouchEvent) => {
      (window as any).lastPointerY = e.touches[0]?.clientY ?? 0;
      this.boundOnTouchDown(e);
    });
    window.addEventListener("touchmove", (e: TouchEvent) => {
      (window as any).lastPointerY = e.touches[0]?.clientY ?? 0;
      this.boundOnTouchMove(e);
    });
    window.addEventListener("touchend", this.boundOnTouchUp);

    // Click outside to deselect
    this.container.addEventListener("click", (e) => {
      // If click didn't hit any media, deselect
      const rect = this.container.getBoundingClientRect();
      const idx = this.hitTest(e.clientX, e.clientY);
      if (idx === null && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        this.selectIndex(null);
      }
    });
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.boundOnResize);
    window.removeEventListener("mousewheel", this.boundOnWheel);
    window.removeEventListener("wheel", this.boundOnWheel);
    window.removeEventListener("mousedown", this.boundOnTouchDown as any);
    window.removeEventListener("mousemove", this.boundOnTouchMove as any);
    window.removeEventListener("mouseup", this.boundOnTouchUp);
    window.removeEventListener("touchstart", this.boundOnTouchDown as any);
    window.removeEventListener("touchmove", this.boundOnTouchMove as any);
    window.removeEventListener("touchend", this.boundOnTouchUp);
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas as HTMLCanvasElement);
    }
  }
}

interface CircularGalleryProps {
  items?: GalleryItem[];
  bend?: number;
  textColor?: string;
  borderRadius?: number;
  font?: string;
  scrollSpeed?: number;
  scrollEase?: number;
}

export default function CircularGallery({
  items,
  bend = 3,
  textColor = "#ffffff",
  borderRadius = 0.05,
  font = "bold 30px Figtree",
  scrollSpeed = 2,
  scrollEase = 0.05,
}: CircularGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Info overlay state
  const [overlay, setOverlay] = useState<{
    visible: boolean;
    x: number;
    y: number;
    data?: GalleryItem;
  }>({ visible: false, x: 0, y: 0 });

  // Check if mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const app = new App(container, {
      items,
      bend,
      textColor,
      borderRadius,
      font,
      scrollSpeed,
      scrollEase,
      onItemSelect: ({ data, screenX, screenY }) => {
        setOverlay({ visible: true, x: screenX, y: screenY, data });
      },
      onItemMove: ({ screenX, screenY }) => {
        setOverlay((prev) => (prev?.visible ? { ...prev, x: screenX, y: screenY } : prev));
      },
      onItemDeselect: () => {
        setOverlay({ visible: false, x: 0, y: 0, data: undefined });
      },
    });

    // ESC to close
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOverlay({ visible: false, x: 0, y: 0, data: undefined });
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      app.destroy();
    };
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase]);

  return (
    <div className="w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing" ref={containerRef}>
      {/* Floating info card */}
      {overlay.visible && overlay.data && (
        <div
          className={`absolute z-20 pointer-events-auto ${
            isMobile ? 'left-4 right-4' : ''
          }`}
          style={
            isMobile
              ? {
                  top: overlay.y,
                  transform: "translateY(-110%)",
                }
              : {
                  left: overlay.x,
                  top: overlay.y,
                  transform: "translate(-50%, -110%)",
                }
          }
        >
          <div className={`bg-background/90 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-4 ${
            isMobile ? 'w-full max-w-none' : 'max-w-xs'
          }`}>
            <div className="text-sm text-muted-foreground mb-1">
              {overlay.data.year ?? ""}
            </div>
            <div className="font-semibold text-foreground leading-tight">
              {overlay.data.text}
            </div>
            {overlay.data.description && (
              <div className="mt-2 text-sm text-muted-foreground">
                {overlay.data.description}
              </div>
            )}
            <div className="mt-3 flex items-center justify-end">
              <button
                className="px-3 py-1 text-xs rounded-full border border-white/15 hover:border-white/30"
                onClick={() => setOverlay({ visible: false, x: 0, y: 0, data: undefined })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}