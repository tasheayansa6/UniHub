import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

gsap.registerPlugin(ScrollTrigger);

const SECTIONS = [
  {
    title: "HORIZON",
    line1: "Where vision meets reality,",
    line2: "we shape the future of tomorrow",
  },
  {
    title: "COSMOS",
    line1: "Beyond the boundaries of imagination,",
    line2: "lies the universe of possibilities",
  },
  {
    title: "INFINITY",
    line1: "In the space between thought and creation,",
    line2: "we find the essence of true innovation",
  },
];

export function HeroSection() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const scrollProgressRef = useRef(null);
  const menuRef = useRef(null);
  const smoothCameraPos = useRef({ x: 0, y: 30, z: 100 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const totalSections = 2;

  const threeRefs = useRef({
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    stars: [],
    nebula: null,
    mountains: [],
    locations: [],
    animationId: null,
    targetCameraX: 0,
    targetCameraY: 30,
    targetCameraZ: 100,
  });

  // ── Three.js init ──────────────────────────────────────────────────────────
  useEffect(() => {
    const refs = threeRefs.current;

    // Scene
    refs.scene = new THREE.Scene();
    refs.scene.fog = new THREE.FogExp2(0x000000, 0.00025);

    // Camera
    refs.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    refs.camera.position.set(0, 20, 100);

    // Renderer
    refs.renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    refs.renderer.setSize(window.innerWidth, window.innerHeight);
    refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    refs.renderer.toneMappingExposure = 0.5;

    // Post-processing
    refs.composer = new EffectComposer(refs.renderer);
    refs.composer.addPass(new RenderPass(refs.scene, refs.camera));
    refs.composer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.8, 0.4, 0.85
      )
    );

    // ── Stars ──
    const starCount = 5000;
    for (let layer = 0; layer < 3; layer++) {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(starCount * 3);
      const colors = new Float32Array(starCount * 3);
      const sizes = new Float32Array(starCount);

      for (let j = 0; j < starCount; j++) {
        const radius = 200 + Math.random() * 800;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        positions[j * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[j * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[j * 3 + 2] = radius * Math.cos(phi);

        const color = new THREE.Color();
        const c = Math.random();
        if (c < 0.7) color.setHSL(0, 0, 0.8 + Math.random() * 0.2);
        else if (c < 0.9) color.setHSL(0.08, 0.5, 0.8);
        else color.setHSL(0.6, 0.5, 0.8);
        colors[j * 3] = color.r;
        colors[j * 3 + 1] = color.g;
        colors[j * 3 + 2] = color.b;
        sizes[j] = Math.random() * 2 + 0.5;
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, depth: { value: layer } },
        vertexShader: `
          attribute float size;
          attribute vec3 color;
          varying vec3 vColor;
          uniform float time;
          uniform float depth;
          void main() {
            vColor = color;
            vec3 pos = position;
            float angle = time * 0.05 * (1.0 - depth * 0.3);
            mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
            pos.xy = rot * pos.xy;
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;
            float opacity = 1.0 - smoothstep(0.0, 0.5, dist);
            gl_FragColor = vec4(vColor, opacity);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const stars = new THREE.Points(geometry, material);
      refs.scene.add(stars);
      refs.stars.push(stars);
    }

    // ── Nebula ──
    const nebulaGeo = new THREE.PlaneGeometry(8000, 4000, 100, 100);
    const nebulaMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x0033ff) },
        color2: { value: new THREE.Color(0xff0066) },
        opacity: { value: 0.3 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vElevation;
        uniform float time;
        void main() {
          vUv = uv;
          vec3 pos = position;
          float elevation = sin(pos.x * 0.01 + time) * cos(pos.y * 0.01 + time) * 20.0;
          pos.z += elevation;
          vElevation = elevation;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float opacity;
        uniform float time;
        varying vec2 vUv;
        varying float vElevation;
        void main() {
          float mixFactor = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
          vec3 color = mix(color1, color2, mixFactor * 0.5 + 0.5);
          float alpha = opacity * (1.0 - length(vUv - 0.5) * 2.0);
          alpha *= 1.0 + vElevation * 0.01;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    refs.nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
    refs.nebula.position.z = -1050;
    refs.scene.add(refs.nebula);

    // ── Mountains ──
    const layers = [
      { distance: -50,  height: 60,  color: 0x1a1a2e, opacity: 1   },
      { distance: -100, height: 80,  color: 0x16213e, opacity: 0.8  },
      { distance: -150, height: 100, color: 0x0f3460, opacity: 0.6  },
      { distance: -200, height: 120, color: 0x0a4668, opacity: 0.4  },
    ];
    layers.forEach((layer, index) => {
      const points = [];
      const segments = 50;
      for (let i = 0; i <= segments; i++) {
        const x = (i / segments - 0.5) * 1000;
        const y =
          Math.sin(i * 0.1) * layer.height +
          Math.sin(i * 0.05) * layer.height * 0.5 +
          Math.random() * layer.height * 0.2 - 100;
        points.push(new THREE.Vector2(x, y));
      }
      points.push(new THREE.Vector2(5000, -300));
      points.push(new THREE.Vector2(-5000, -300));

      const shape = new THREE.Shape(points);
      const geo = new THREE.ShapeGeometry(shape);
      const mat = new THREE.MeshBasicMaterial({
        color: layer.color,
        transparent: true,
        opacity: layer.opacity,
        side: THREE.DoubleSide,
      });
      const mountain = new THREE.Mesh(geo, mat);
      mountain.position.z = layer.distance;
      mountain.position.y = layer.distance;
      mountain.userData = { baseZ: layer.distance, index };
      refs.scene.add(mountain);
      refs.mountains.push(mountain);
    });

    // Store original Z positions
    refs.locations = refs.mountains.map((m) => m.position.z);

    // ── Atmosphere ──
    const atmGeo = new THREE.SphereGeometry(600, 32, 32);
    const atmMat = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform float time;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          vec3 atmosphere = vec3(0.3, 0.6, 1.0) * intensity;
          float pulse = sin(time * 2.0) * 0.1 + 0.9;
          atmosphere *= pulse;
          gl_FragColor = vec4(atmosphere, intensity * 0.25);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    });
    refs.scene.add(new THREE.Mesh(atmGeo, atmMat));

    // ── Animate loop ──
    const animate = () => {
      refs.animationId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;

      refs.stars.forEach((sf) => {
        if (sf.material.uniforms) sf.material.uniforms.time.value = time;
      });
      if (refs.nebula?.material?.uniforms) {
        refs.nebula.material.uniforms.time.value = time * 0.5;
      }

      if (refs.camera) {
        const s = 0.05;
        smoothCameraPos.current.x +=
          (refs.targetCameraX - smoothCameraPos.current.x) * s;
        smoothCameraPos.current.y +=
          (refs.targetCameraY - smoothCameraPos.current.y) * s;
        smoothCameraPos.current.z +=
          (refs.targetCameraZ - smoothCameraPos.current.z) * s;

        refs.camera.position.x =
          smoothCameraPos.current.x + Math.sin(time * 0.1) * 2;
        refs.camera.position.y =
          smoothCameraPos.current.y + Math.cos(time * 0.15) * 1;
        refs.camera.position.z = smoothCameraPos.current.z;
        refs.camera.lookAt(0, 10, -600);
      }

      refs.mountains.forEach((mountain, i) => {
        const pf = 1 + i * 0.5;
        mountain.position.x = Math.sin(time * 0.1) * 2 * pf;
        mountain.position.y = 50 + Math.cos(time * 0.15) * 1 * pf;
      });

      refs.composer?.render();
    };
    animate();

    setIsReady(true);

    // Resize
    const handleResize = () => {
      if (!refs.camera || !refs.renderer || !refs.composer) return;
      refs.camera.aspect = window.innerWidth / window.innerHeight;
      refs.camera.updateProjectionMatrix();
      refs.renderer.setSize(window.innerWidth, window.innerHeight);
      refs.composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (refs.animationId) cancelAnimationFrame(refs.animationId);
      window.removeEventListener("resize", handleResize);
      refs.stars.forEach((sf) => {
        sf.geometry.dispose();
        sf.material.dispose();
      });
      refs.mountains.forEach((m) => {
        m.geometry.dispose();
        m.material.dispose();
      });
      refs.nebula?.geometry.dispose();
      refs.nebula?.material.dispose();
      refs.renderer?.dispose();
    };
  }, []);

  // ── GSAP entrance animations ───────────────────────────────────────────────
  useEffect(() => {
    if (!isReady) return;

    gsap.set(
      [menuRef.current, titleRef.current, subtitleRef.current, scrollProgressRef.current],
      { visibility: "visible" }
    );

    const tl = gsap.timeline();

    if (menuRef.current) {
      tl.from(menuRef.current, { x: -100, opacity: 0, duration: 1, ease: "power3.out" });
    }
    if (titleRef.current) {
      const chars = titleRef.current.querySelectorAll(".title-char");
      tl.from(chars, { y: 200, opacity: 0, duration: 1.5, stagger: 0.05, ease: "power4.out" }, "-=0.5");
    }
    if (subtitleRef.current) {
      const lines = subtitleRef.current.querySelectorAll(".subtitle-line");
      tl.from(lines, { y: 50, opacity: 0, duration: 1, stagger: 0.2, ease: "power3.out" }, "-=0.8");
    }
    if (scrollProgressRef.current) {
      tl.from(scrollProgressRef.current, { opacity: 0, y: 50, duration: 1, ease: "power2.out" }, "-=0.5");
    }

    return () => tl.kill();
  }, [isReady]);

  // ── Scroll handler ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollY / maxScroll, 1);
      setScrollProgress(progress);

      const newSection = Math.min(
        Math.floor(progress * totalSections),
        totalSections - 1
      );
      setCurrentSection(newSection);

      const refs = threeRefs.current;
      const totalProgress = progress * totalSections;
      const sectionProgress = totalProgress % 1;

      const cameraPositions = [
        { x: 0, y: 30, z: 300 },
        { x: 0, y: 40, z: -50 },
        { x: 0, y: 50, z: -700 },
      ];

      const cur = cameraPositions[newSection] ?? cameraPositions[0];
      const nxt = cameraPositions[newSection + 1] ?? cur;

      refs.targetCameraX = cur.x + (nxt.x - cur.x) * sectionProgress;
      refs.targetCameraY = cur.y + (nxt.y - cur.y) * sectionProgress;
      refs.targetCameraZ = cur.z + (nxt.z - cur.z) * sectionProgress;

      refs.mountains.forEach((mountain, i) => {
        const speed = 1 + i * 0.9;
        const targetZ = mountain.userData.baseZ + scrollY * speed * 0.5;
        if (progress > 0.7) {
          mountain.position.z = 600000;
        } else {
          mountain.position.z = refs.locations[i];
        }
        if (refs.nebula) {
          refs.nebula.position.z = refs.mountains[3].position.z;
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [totalSections]);

  const splitTitle = (text) =>
    text.split("").map((char, i) => (
      <span key={i} className="title-char inline-block">
        {char === " " ? "\u00A0" : char}
      </span>
    ));

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{ height: `${(totalSections + 1) * 100}vh` }}
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {/* Three.js canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Side menu */}
        <div
          ref={menuRef}
          className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-20"
          style={{ visibility: "hidden" }}
        >
          <div className="flex flex-col gap-1.5">
            <span className="block w-6 h-0.5 bg-white/60" />
            <span className="block w-4 h-0.5 bg-white/60" />
            <span className="block w-6 h-0.5 bg-white/60" />
          </div>
          <div
            className="text-xs font-bold tracking-[0.3em] text-white/40"
            style={{ writingMode: "vertical-rl" }}
          >
            SPACE
          </div>
        </div>

        {/* Main content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-8 text-center">
          <h1
            ref={titleRef}
            className="text-[clamp(4rem,12vw,10rem)] font-black tracking-tight text-white leading-none mb-6 overflow-hidden"
            style={{ visibility: "hidden" }}
          >
            {splitTitle(SECTIONS[currentSection]?.title ?? "HORIZON")}
          </h1>
          <div
            ref={subtitleRef}
            className="flex flex-col gap-1"
            style={{ visibility: "hidden" }}
          >
            <p className="subtitle-line text-white/50 text-lg md:text-xl font-light tracking-wide">
              {SECTIONS[currentSection]?.line1}
            </p>
            <p className="subtitle-line text-white/50 text-lg md:text-xl font-light tracking-wide">
              {SECTIONS[currentSection]?.line2}
            </p>
          </div>
        </div>

        {/* Scroll progress */}
        <div
          ref={scrollProgressRef}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-20"
          style={{ visibility: "hidden" }}
        >
          <span className="text-xs font-bold tracking-[0.3em] text-white/40">
            SCROLL
          </span>
          <div className="w-32 h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/60 rounded-full transition-all duration-100"
              style={{ width: `${scrollProgress * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono text-white/30">
            {String(currentSection + 1).padStart(2, "0")} /{" "}
            {String(totalSections).padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
