import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Strictly letters from the 8 supported languages:
// Arabic, French, English, Russian, Italian, Spanish, Portuguese, German
const ORBITING_GLYPHS = [
  'أ', 'ض', 'ع', 'A', 'Z', 'É', 'Ç', 'Ñ',
  'Ü', 'ß', 'Ж', 'Д', 'Я', 'Ã', 'Õ', 'À',
  'E', 'Ш', 'Ó', 'Q', 'Ê', 'Б',
];

function hash3(x: number, y: number, z: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123;
  return n - Math.floor(n);
}

function noise3(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const uz = fz * fz * (3 - 2 * fz);

  const n000 = hash3(ix, iy, iz);
  const n100 = hash3(ix + 1, iy, iz);
  const n010 = hash3(ix, iy + 1, iz);
  const n110 = hash3(ix + 1, iy + 1, iz);
  const n001 = hash3(ix, iy, iz + 1);
  const n101 = hash3(ix + 1, iy, iz + 1);
  const n011 = hash3(ix, iy + 1, iz + 1);
  const n111 = hash3(ix + 1, iy + 1, iz + 1);

  const nx00 = n000 + (n100 - n000) * ux;
  const nx10 = n010 + (n110 - n010) * ux;
  const nx01 = n001 + (n101 - n001) * ux;
  const nx11 = n011 + (n111 - n011) * ux;

  const nxy0 = nx00 + (nx10 - nx00) * uy;
  const nxy1 = nx01 + (nx11 - nx01) * uy;

  return nxy0 + (nxy1 - nxy0) * uz;
}

function fbm3(x: number, y: number, z: number, octaves = 4): number {
  let value = 0;
  let amp = 0.5;
  let freq = 1.0;
  for (let i = 0; i < octaves; i++) {
    value += amp * noise3(x * freq, y * freq, z * freq);
    freq *= 2.05;
    amp *= 0.5;
  }
  return value;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function createRealisticEarthTextures() {
  const width = 1024;
  const height = 512;

  // Step 1: High-detail continental mask canvas (blurred smoothly for shallow reefs & coastal fade)
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = width;
  maskCanvas.height = height;
  const mCtx = maskCanvas.getContext('2d')!;
  mCtx.fillStyle = '#000000';
  mCtx.fillRect(0, 0, width, height);

  const toXY = (lon: number, lat: number): [number, number] => [
    ((lon + 180) / 360) * width,
    ((90 - lat) / 180) * height,
  ];

  const continentPolys: [number, number][][] = [
    // North America
    [
      [-168, 65], [-152, 71], [-130, 70], [-105, 72], [-80, 68], [-64, 58],
      [-54, 48], [-67, 44], [-75, 36], [-81, 25], [-88, 21], [-84, 10],
      [-78, 8], [-92, 15], [-105, 20], [-115, 30], [-124, 40], [-130, 54], [-150, 60],
    ],
    // Greenland
    [[-54, 60], [-42, 60], [-22, 70], [-20, 81], [-50, 82], [-66, 76], [-56, 68]],
    // South America
    [
      [-79, 9], [-71, 12], [-60, 8], [-50, 1], [-35, -6], [-39, -18],
      [-47, -25], [-55, -34], [-65, -43], [-68, -55], [-74, -52],
      [-75, -38], [-71, -20], [-81, -5],
    ],
    // Africa
    [
      [-17, 15], [-13, 28], [-6, 35], [10, 37], [25, 32], [33, 31],
      [43, 12], [51, 11], [41, -2], [40, -15], [33, -26], [20, -35],
      [15, -26], [12, -12], [9, 4], [2, 6], [-8, 5], [-16, 11],
    ],
    // Madagascar
    [[44, -25], [47, -25], [50, -14], [48, -12], [44, -18]],
    // Europe
    [
      [-9, 37], [-9, 43], [-2, 43], [-4, 48], [2, 51], [9, 55], [6, 61],
      [16, 69], [28, 71], [40, 67], [58, 68], [60, 52], [42, 43],
      [29, 41], [23, 38], [16, 39], [12, 44], [5, 43], [0, 39], [-5, 36],
    ],
    // UK & Ireland
    [[-6, 50], [1.5, 51], [-1, 58], [-6, 57], [-9, 53]],
    // Arabian Peninsula & Asia
    [
      [34, 31], [36, 37], [46, 41], [58, 52], [62, 68], [95, 75], [135, 71], [172, 66],
      [162, 55], [142, 52], [135, 43], [128, 35], [122, 31], [116, 22],
      [108, 16], [104, 2], [98, 8], [91, 22], [80, 12], [77, 8],
      [68, 23], [56, 26], [59, 22], [53, 16], [44, 13], [39, 21],
    ],
    // Japan
    [[130, 32], [136, 35], [141, 41], [145, 44], [141, 38], [134, 33]],
    // Indonesia / SE islands
    [[96, 5], [105, -6], [115, -8], [118, -3], [106, -2]],
    // Australia
    [
      [114, -22], [129, -14], [137, -12], [142, -11], [153, -26],
      [150, -37], [138, -36], [129, -32], [115, -34], [113, -27],
    ],
    // Antarctica
    [
      [-180, -71], [-120, -73], [-60, -66], [0, -70], [60, -68], [120, -67],
      [180, -71], [180, -90], [-180, -90],
    ],
  ];

  mCtx.filter = 'blur(8px)';
  mCtx.fillStyle = '#FFFFFF';
  continentPolys.forEach((poly) => {
    mCtx.beginPath();
    poly.forEach(([lon, lat], idx) => {
      const [x, y] = toXY(lon, lat);
      if (idx === 0) mCtx.moveTo(x, y);
      else mCtx.lineTo(x, y);
    });
    mCtx.closePath();
    mCtx.fill();
  });
  mCtx.filter = 'none';

  const maskData = mCtx.getImageData(0, 0, width, height).data;

  const colorData = new Uint8Array(width * height * 4);
  const roughData = new Uint8Array(width * height * 4);
  const bumpData = new Uint8Array(width * height * 4);
  const nightData = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y++) {
    const v = y / (height - 1);
    const lat = (0.5 - v) * Math.PI; // +pi/2 (North) to -pi/2 (South)
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    const absLat = Math.abs(lat) / (Math.PI * 0.5);

    for (let x = 0; x < width; x++) {
      const u = x / width;
      const lon = (u - 0.5) * Math.PI * 2;
      const nx = cosLat * Math.cos(lon);
      const ny = sinLat;
      const nz = cosLat * Math.sin(lon);

      const idx = (y * width + x) * 4;
      const baseMask = maskData[idx] / 255;

      // Multi-octave 3D spherical noise for seamless coastlines, mountains & clouds
      const coastNoise = fbm3(nx * 4.5, ny * 4.5, nz * 4.5, 4);
      const detailNoise = fbm3(nx * 14.0 + 7.2, ny * 14.0, nz * 14.0 - 3.1, 3);
      const ridgeNoise = 1.0 - Math.abs(noise3(nx * 18.0, ny * 18.0, nz * 18.0) * 2.0 - 1.0);

      const landSignal = baseMask + (coastNoise - 0.5) * 0.42 + (detailNoise - 0.5) * 0.14;
      const polarThreshold = 0.84 + (coastNoise - 0.5) * 0.09;
      const isPolarIce = absLat > polarThreshold;

      let r = 0;
      let g = 0;
      let b = 0;
      let rough = 215;
      let bump = 18;
      let nightR = 0;
      let nightG = 0;
      let nightB = 0;

      if (isPolarIce) {
        // Arctic & Antarctic ice sheets
        const iceShade = 228 + Math.floor(detailNoise * 27);
        r = iceShade - 6;
        g = iceShade;
        b = Math.min(255, iceShade + 8);
        rough = 128;
        bump = 80 + Math.floor(detailNoise * 45);
      } else if (landSignal > 0.48) {
        // Continental landmass
        const elev = clamp((landSignal - 0.48) * 1.9 + ridgeNoise * 0.36, 0, 1);
        bump = 78 + Math.floor(elev * 170);
        rough = 218;

        // Realistic desert belt (Sahara, Arabia, Central Asia, Australian Outback, SW USA)
        const latDeg = (lat * 180) / Math.PI;
        const lonDeg = (lon * 180) / Math.PI;
        const saharaArabia =
          latDeg > 13 && latDeg < 34 && lonDeg > -16 && lonDeg < 62 ? 1.0 : 0.0;
        const outback =
          latDeg < -16 && latDeg > -32 && lonDeg > 116 && lonDeg < 145 ? 0.85 : 0.0;
        const desertBelt = Math.max(saharaArabia, outback) * clamp(0.65 + detailNoise * 0.5, 0, 1);

        if (elev > 0.82) {
          // Snow-dusted high mountain peaks
          r = 220 + Math.floor(detailNoise * 30);
          g = 226 + Math.floor(detailNoise * 28);
          b = 234 + Math.floor(detailNoise * 21);
          rough = 175;
        } else if (elev > 0.67) {
          // Alpine rock & highland plateaus
          r = Math.floor(112 + detailNoise * 32);
          g = Math.floor(104 + detailNoise * 28);
          b = Math.floor(92 + detailNoise * 24);
        } else if (desertBelt > 0.45) {
          // Desert sand dunes
          r = Math.floor(188 + detailNoise * 36);
          g = Math.floor(156 + detailNoise * 30);
          b = Math.floor(104 + detailNoise * 22);
          rough = 235;
        } else {
          // Tropical & temperate biomes
          const tropical = clamp(1.0 - absLat * 2.1, 0, 1);
          const veg = clamp(coastNoise * 0.65 + detailNoise * 0.35, 0, 1);
          r = Math.floor(34 + (1 - tropical) * 28 + veg * 24);
          g = Math.floor(84 + tropical * 34 + veg * 38);
          b = Math.floor(36 + (1 - tropical) * 18 + veg * 14);
        }

        // Subtle golden city lights on populated coastal / temperate zones (visible on night side)
        const isPopulatedBand = absLat > 0.14 && absLat < 0.66 && elev < 0.58 && desertBelt < 0.4;
        if (isPopulatedBand) {
          const cityCluster = hash3(Math.floor(nx * 58), Math.floor(ny * 58), Math.floor(nz * 58));
          if (cityCluster > 0.82 && detailNoise > 0.56) {
            const glow = clamp((cityCluster - 0.82) * 5.2, 0, 1);
            nightR = Math.floor(255 * glow);
            nightG = Math.floor(196 * glow);
            nightB = Math.floor(96 * glow);
          }
        }
      } else {
        // Oceans with turquoise continental shelves + deep bathymetry
        const shelf = clamp((landSignal - 0.25) / 0.23, 0, 1);
        const oceanWave = (detailNoise - 0.5) * 16;
        r = clamp(Math.floor(5 + shelf * 28 + oceanWave * 0.4), 2, 70);
        g = clamp(Math.floor(32 + shelf * 102 + oceanWave * 0.6), 18, 175);
        b = clamp(Math.floor(78 + shelf * 92 + oceanWave), 48, 210);
        rough = 58 + Math.floor(detailNoise * 24); // Specular ocean sheen
        bump = 12;
      }

      colorData[idx] = r;
      colorData[idx + 1] = g;
      colorData[idx + 2] = b;
      colorData[idx + 3] = 255;

      roughData[idx] = rough;
      roughData[idx + 1] = rough;
      roughData[idx + 2] = rough;
      roughData[idx + 3] = 255;

      bumpData[idx] = bump;
      bumpData[idx + 1] = bump;
      bumpData[idx + 2] = bump;
      bumpData[idx + 3] = 255;

      nightData[idx] = nightR;
      nightData[idx + 1] = nightG;
      nightData[idx + 2] = nightB;
      nightData[idx + 3] = 255;
    }
  }

  // Swirling spherical clouds (768x384)
  const cw = 768;
  const ch = 384;
  const cloudData = new Uint8Array(cw * ch * 4);
  for (let y = 0; y < ch; y++) {
    const v = y / (ch - 1);
    const lat = (0.5 - v) * Math.PI;
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    for (let x = 0; x < cw; x++) {
      const u = x / cw;
      const lon = (u - 0.5) * Math.PI * 2;
      // Coriolis swirl shear by latitude
      const swirlLon = lon + sinLat * 0.65;
      const nx = cosLat * Math.cos(swirlLon);
      const ny = sinLat;
      const nz = cosLat * Math.sin(swirlLon);

      const c1 = fbm3(nx * 3.8 + 11.4, ny * 5.2, nz * 3.8 - 2.1, 4);
      const c2 = fbm3(nx * 9.5, ny * 9.5 + 4.3, nz * 9.5, 3);
      const density = clamp((c1 * 0.72 + c2 * 0.28 - 0.50) * 3.1, 0, 1);

      const idx = (y * cw + x) * 4;
      cloudData[idx] = 248;
      cloudData[idx + 1] = 252;
      cloudData[idx + 2] = 255;
      cloudData[idx + 3] = Math.floor(density * 215);
    }
  }

  const colorTex = new THREE.DataTexture(colorData, width, height, THREE.RGBAFormat);
  colorTex.colorSpace = THREE.SRGBColorSpace;
  colorTex.wrapS = THREE.RepeatWrapping;
  colorTex.generateMipmaps = true;
  colorTex.minFilter = THREE.LinearMipmapLinearFilter;
  colorTex.magFilter = THREE.LinearFilter;
  colorTex.needsUpdate = true;

  const roughTex = new THREE.DataTexture(roughData, width, height, THREE.RGBAFormat);
  roughTex.wrapS = THREE.RepeatWrapping;
  roughTex.minFilter = THREE.LinearFilter;
  roughTex.magFilter = THREE.LinearFilter;
  roughTex.needsUpdate = true;

  const bumpTex = new THREE.DataTexture(bumpData, width, height, THREE.RGBAFormat);
  bumpTex.wrapS = THREE.RepeatWrapping;
  bumpTex.minFilter = THREE.LinearFilter;
  bumpTex.magFilter = THREE.LinearFilter;
  bumpTex.needsUpdate = true;

  const nightTex = new THREE.DataTexture(nightData, width, height, THREE.RGBAFormat);
  nightTex.colorSpace = THREE.SRGBColorSpace;
  nightTex.wrapS = THREE.RepeatWrapping;
  nightTex.minFilter = THREE.LinearFilter;
  nightTex.magFilter = THREE.LinearFilter;
  nightTex.needsUpdate = true;

  const cloudTex = new THREE.DataTexture(cloudData, cw, ch, THREE.RGBAFormat);
  cloudTex.colorSpace = THREE.SRGBColorSpace;
  cloudTex.wrapS = THREE.RepeatWrapping;
  cloudTex.minFilter = THREE.LinearFilter;
  cloudTex.magFilter = THREE.LinearFilter;
  cloudTex.needsUpdate = true;

  return { colorTex, roughTex, bumpTex, nightTex, cloudTex };
}

function createGlyphTexture(glyph: string, accent: string): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, size, size);

  ctx.shadowColor = accent;
  ctx.shadowBlur = 14;
  ctx.fillStyle = 'rgba(4, 10, 26, 0.92)';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, 42, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 46px "Cairo", "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(glyph, size / 2, size / 2 + 2);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function EarthGlobe3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglFallback, setWebglFallback] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isSoftwareGl = (() => {
      const probe = document.createElement('canvas').getContext('webgl2');
      if (!probe) return true;
      const ext = probe.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
      const gpu = String(probe.getParameter(param));
      probe.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFallback(true);
      return;
    }

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 360;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFallback(true);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    const scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.35;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 5.15);

    // Sunlit space key + crisp atmospheric rim illumination
    const sunDir = new THREE.Vector3(5, 2.6, 4.8).normalize();
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x051126, 0.38);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 3.1);
    sunLight.position.copy(sunDir).multiplyScalar(10);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.35);
    rimLight.position.set(-5, -1.8, -4.5);
    scene.add(rimLight);

    // 3D Starfield surrounding the globe
    const starCount = 720;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starPalette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#bae6fd'),
      new THREE.Color('#fef3c7'),
      new THREE.Color('#a7f3d0'),
    ];
    for (let i = 0; i < starCount; i++) {
      const r = 4.3 + Math.random() * 14;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      const c = starPalette[i % starPalette.length];
      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.052,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      sizeAttenuation: true,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    const { colorTex, roughTex, bumpTex, nightTex, cloudTex } = createRealisticEarthTextures();
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    colorTex.anisotropy = maxAniso;
    bumpTex.anisotropy = maxAniso;

    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = THREE.MathUtils.degToRad(23.5);
    scene.add(earthGroup);

    // Photorealistic Earth surface with ocean specular & night-side city lights
    const earthGeo = new THREE.SphereGeometry(1.2, 72, 72);
    const earthMat = new THREE.MeshStandardMaterial({
      map: colorTex,
      roughnessMap: roughTex,
      roughness: 0.95,
      metalness: 0.06,
      bumpMap: bumpTex,
      bumpScale: 0.045,
      emissiveMap: nightTex,
      emissive: new THREE.Color('#fbbf24'),
      emissiveIntensity: 1.5,
    });
    earthMat.onBeforeCompile = (shader) => {
      shader.uniforms.uSunDir = { value: sunDir };
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          '#include <common>\nvarying vec3 vWorldNorm;'
        )
        .replace(
          '#include <worldpos_vertex>',
          '#include <worldpos_vertex>\nvWorldNorm = normalize(mat3(modelMatrix) * objectNormal);'
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\nuniform vec3 uSunDir;\nvarying vec3 vWorldNorm;'
        )
        .replace(
          '#include <emissivemap_fragment>',
          `
          #include <emissivemap_fragment>
          float nightMask = smoothstep(0.18, -0.22, dot(normalize(vWorldNorm), normalize(uSunDir)));
          totalEmissiveRadiance *= nightMask;
          `
        );
    };

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // Volumetric swirling cloud layer
    const cloudGeo = new THREE.SphereGeometry(1.224, 56, 56);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTex,
      transparent: true,
      opacity: 0.84,
      depthWrite: false,
      roughness: 0.95,
      metalness: 0,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(cloudMesh);

    // Inner atmospheric Rayleigh scatter rim
    const innerAtmoGeo = new THREE.SphereGeometry(1.255, 56, 56);
    const innerAtmoMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        uSunDir: { value: sunDir },
      },
      vertexShader: `
        varying vec3 vNormalView;
        varying vec3 vWorldNorm;
        void main() {
          vNormalView = normalize(normalMatrix * normal);
          vWorldNorm = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDir;
        varying vec3 vNormalView;
        varying vec3 vWorldNorm;
        void main() {
          float rim = pow(clamp(1.0 - max(0.0, vNormalView.z), 0.0, 1.0), 3.4);
          float sunSide = smoothstep(-0.4, 0.7, dot(normalize(vWorldNorm), normalize(uSunDir)));
          vec3 skyCol = mix(vec3(0.08, 0.25, 0.55), vec3(0.26, 0.72, 1.0), sunSide);
          gl_FragColor = vec4(skyCol, rim * (0.28 + 0.52 * sunSide));
        }
      `,
    });
    const innerAtmoMesh = new THREE.Mesh(innerAtmoGeo, innerAtmoMat);
    earthGroup.add(innerAtmoMesh);

    // Outer atmospheric halo
    const atmoGeo = new THREE.SphereGeometry(1.36, 48, 48);
    const atmoMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.62 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.2);
          gl_FragColor = vec4(0.22, 0.78, 1.0, 1.0) * intensity * 0.92;
        }
      `,
    });
    const atmoMesh = new THREE.Mesh(atmoGeo, atmoMat);
    earthGroup.add(atmoMesh);

    const orbitGroups: {
      group: THREE.Group;
      speed: number;
      sprites: THREE.Sprite[];
    }[] = [];

    const ringConfigs = [
      { radius: 1.68, tiltX: 0.42, tiltZ: -0.25, speed: 0.22, accent: '#34D399', count: 8 },
      { radius: 1.9, tiltX: -0.52, tiltZ: 0.34, speed: -0.17, accent: '#38BDF8', count: 8 },
      { radius: 2.1, tiltX: 0.14, tiltZ: 0.64, speed: 0.13, accent: '#FBBF24', count: 6 },
    ];

    const glyphTextures: THREE.CanvasTexture[] = [];
    const spriteMaterials: THREE.SpriteMaterial[] = [];
    const ringGeos: THREE.BufferGeometry[] = [];
    const ringMats: THREE.Material[] = [];

    let glyphIdx = 0;
    ringConfigs.forEach((cfg) => {
      const orbitGroup = new THREE.Group();
      orbitGroup.rotation.x = cfg.tiltX;
      orbitGroup.rotation.z = cfg.tiltZ;
      scene.add(orbitGroup);

      const ringGeo = new THREE.TorusGeometry(cfg.radius, 0.006, 8, 96);
      const ringMat = new THREE.MeshBasicMaterial({
        color: cfg.accent,
        transparent: true,
        opacity: 0.26,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      orbitGroup.add(ringMesh);
      ringGeos.push(ringGeo);
      ringMats.push(ringMat);

      const sprites: THREE.Sprite[] = [];
      for (let i = 0; i < cfg.count; i++) {
        const glyph = ORBITING_GLYPHS[glyphIdx % ORBITING_GLYPHS.length];
        glyphIdx++;
        const tex = createGlyphTexture(glyph, cfg.accent);
        glyphTextures.push(tex);
        const mat = new THREE.SpriteMaterial({
          map: tex,
          transparent: true,
          depthTest: true,
        });
        spriteMaterials.push(mat);

        const sprite = new THREE.Sprite(mat);
        const angle = (i / cfg.count) * Math.PI * 2;
        sprite.position.set(
          Math.cos(angle) * cfg.radius,
          0,
          Math.sin(angle) * cfg.radius
        );
        sprite.scale.set(0.32, 0.32, 1);
        orbitGroup.add(sprite);
        sprites.push(sprite);
      }

      orbitGroups.push({ group: orbitGroup, speed: cfg.speed, sprites });
    });

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let isDragging = false;
    let lastX = 0;
    let dragVelY = 0;
    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastX = e.clientX;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      dragVelY = dx * 0.005;
      earthMesh.rotation.y += dragVelY;
    };
    const onPointerUp = () => {
      isDragging = false;
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 360;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);

      if (!prefersReducedMotion) {
        earthMesh.rotation.y += delta * 0.11 + dragVelY * 0.1;
        cloudMesh.rotation.y += delta * 0.15;
        starPoints.rotation.y += delta * 0.015;
        dragVelY *= 0.92;

        orbitGroups.forEach((og) => {
          og.group.rotation.y += delta * og.speed;
        });
      }

      renderer.render(scene, camera);

      if (prefersReducedMotion) return;
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('webglcontextlost', handleContextLost);

      earthGeo.dispose();
      earthMat.dispose();
      cloudGeo.dispose();
      cloudMat.dispose();
      innerAtmoGeo.dispose();
      innerAtmoMat.dispose();
      atmoGeo.dispose();
      atmoMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      colorTex.dispose();
      roughTex.dispose();
      bumpTex.dispose();
      nightTex.dispose();
      cloudTex.dispose();
      envTex.dispose();
      glyphTextures.forEach((t) => t.dispose());
      spriteMaterials.forEach((m) => m.dispose());
      ringGeos.forEach((g) => g.dispose());
      ringMats.forEach((m) => m.dispose());

      renderer.dispose();
      if (domEl.parentNode === container) {
        container.removeChild(domEl);
      }
    };
  }, []);

  if (webglFallback) {
    return (
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-sky-500 via-blue-700 to-emerald-600 shadow-[0_0_60px_rgba(56,189,248,0.35)] flex items-center justify-center border-4 border-emerald-400/40">
        <div className="text-center text-white font-display font-bold text-2xl tracking-wide">
          أ · A · Ж · Ñ · Ã · Ü
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="w-full max-w-[390px] sm:max-w-[440px] h-[340px] sm:h-[390px] cursor-grab active:cursor-grabbing select-none"
      aria-label="كرة أرضية حقيقية ثلاثية الأبعاد تدور ببطء في الفضاء وحولها أحرف اللغات الثماني"
    />
  );
}
