import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const BLOB_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uLevel;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
${NOISE_GLSL}
void main() {
  vec3 p = position;
  float n1 = snoise(vec3(p.xy * 1.35, uTime * 0.22));
  float n2 = snoise(vec3(p.yz * 2.9 + 4.2, uTime * 0.34));
  float breath = 0.018 + uLevel * 0.13;
  p += normal * (n1 * 0.105 + n2 * 0.032 + breath * (0.6 + 0.4 * sin(uTime * 1.1)));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  vNoise = n1 + n2 * 0.4;
  gl_Position = projectionMatrix * mv;
}
`;

const BLOB_FRAGMENT = /* glsl */ `
uniform vec3 uBase;
uniform vec3 uAccent;
uniform vec3 uRim;
uniform float uLevel;
uniform float uTime;
varying vec3 vNormal;
varying vec3 vView;
varying float vNoise;
void main() {
  float fres = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vView)), 0.0, 1.0), 2.1);
  float bands = smoothstep(-0.5, 0.9, vNoise);
  vec3 col = mix(uBase, uAccent, bands);
  col += uAccent * fres * 0.55;
  col = mix(col, uRim, pow(fres, 3.4) * 0.8);
  col *= 0.9 + 0.1 * sin(vNoise * 18.0 + uTime * 0.9);
  col += uRim * uLevel * fres * 0.25;
  gl_FragColor = vec4(col, 1.0);
}
`;

const RING_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uLevel;
uniform float uPixelRatio;
attribute float aSize;
attribute float aSeed;
varying float vSeed;
varying float vFade;
${NOISE_GLSL}
void main() {
  vec3 p = position;
  float angle = atan(p.z, p.x);
  float wobble = sin(uTime * 0.55 + angle * 3.0 + aSeed * 6.283) * (0.045 + uLevel * 0.16);
  p.y += wobble;
  p.xz *= 1.0 + uLevel * 0.1 + 0.02 * sin(uTime * 0.4 + aSeed * 12.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aSize * uPixelRatio * (5.2 / max(0.8, -mv.z)) * (1.0 + uLevel * 0.9);
  gl_Position = projectionMatrix * mv;
  vSeed = aSeed;
  vFade = 1.0 - smoothstep(2.0, 8.0, -mv.z);
}
`;

const RING_FRAGMENT = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vSeed;
varying float vFade;
void main() {
  vec2 coord = gl_PointCoord - 0.5;
  float d = length(coord);
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.04, d) * 0.6 * vFade;
  vec3 col = mix(uColorA, uColorB, vSeed);
  gl_FragColor = vec4(col, alpha);
}
`;

function makeRing(count, inner = 1.72, outer = 2.42) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = inner + Math.pow(Math.random(), 0.7) * (outer - inner);
    const thickness = (Math.random() - 0.5) * 0.38;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = thickness;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
    sizes[i] = 0.7 + Math.random() * 1.5;
    seeds[i] = Math.random();
  }
  return { positions, sizes, seeds };
}

function Blob({ quality, audioRef }) {
  const meshRef = useRef(null);
  const groupRef = useRef(null);
  const levelRef = useRef(0.12);
  const hueRef = useRef(0.1);
  const pointer = useRef({ x: 0, y: 0 });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLevel: { value: 0.12 },
      uBase: { value: new THREE.Color('#190d23') },
      uAccent: { value: new THREE.Color('#8a3a32') },
      uRim: { value: new THREE.Color('#ffd9a0') },
    }),
    [],
  );

  const segments = quality === 'high' ? 88 : 48;

  useEffect(() => {
    const onMove = (event) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((state, delta) => {
    const audio = audioRef?.current;
    const t = state.clock.elapsedTime;
    const simulated = 0.14 + 0.09 * Math.sin(t * 0.75) + 0.04 * Math.sin(t * 2.1 + 1.7);
    const targetLevel = audio?.live ? Math.min(1, (audio.level || 0) * 1.2) : simulated;
    const targetHue = audio?.live ? 0.06 + (audio.pitch || 0) * 0.48 : 0.1 + 0.018 * Math.sin(t * 0.12);

    levelRef.current = THREE.MathUtils.damp(levelRef.current, targetLevel, 4.5, delta);
    hueRef.current = THREE.MathUtils.damp(hueRef.current, targetHue, 2.4, delta);

    uniforms.uTime.value = t;
    uniforms.uLevel.value = levelRef.current;
    uniforms.uAccent.value.setHSL(hueRef.current, 0.66, 0.34);
    uniforms.uRim.value.setHSL(0.09 + hueRef.current * 0.1, 0.74, 0.72);

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.055;
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.04;
      groupRef.current.scale.setScalar(1 + levelRef.current * 0.06);
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.03;
    }

    const camera = state.camera;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.current.x * 0.16, 2.2, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, -pointer.current.y * 0.1, 2.2, delta);
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.08, segments, segments]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={BLOB_VERTEX}
          fragmentShader={BLOB_FRAGMENT}
        />
      </mesh>
      <RingParticles quality={quality} audioRef={audioRef} hueRef={hueRef} />
    </group>
  );
}

function RingParticles({ quality, audioRef, hueRef }) {
  const pointsRef = useRef(null);
  const groupRef = useRef(null);
  const count = quality === 'high' ? 4600 : 1500;
  const { positions, sizes, seeds } = useMemo(() => makeRing(count), [count]);
  const { positions: farPositions, sizes: farSizes, seeds: farSeeds } = useMemo(
    () => makeRing(Math.round(count * 0.45), 2.5, 3.15),
    [count],
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLevel: { value: 0.12 },
      uPixelRatio: { value: 1 },
      uColorA: { value: new THREE.Color('#e9b44c') },
      uColorB: { value: new THREE.Color('#e1557a') },
    }),
    [],
  );

  const farUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLevel: { value: 0.1 },
      uPixelRatio: { value: 1 },
      uColorA: { value: new THREE.Color('#6c8cff') },
      uColorB: { value: new THREE.Color('#e9b44c') },
    }),
    [],
  );

  useFrame((state, delta) => {
    const audio = audioRef?.current;
    const t = state.clock.elapsedTime;
    const target = audio?.live ? Math.min(1, (audio.level || 0) * 1.1) : 0.14 + 0.06 * Math.sin(t * 0.8);
    uniforms.uLevel.value = THREE.MathUtils.damp(uniforms.uLevel.value, target, 3.5, delta);
    farUniforms.uLevel.value = uniforms.uLevel.value * 0.7;
    uniforms.uTime.value = t;
    farUniforms.uTime.value = t;
    uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    farUniforms.uPixelRatio.value = state.gl.getPixelRatio();
    const hue = hueRef.current;
    uniforms.uColorB.value.setHSL(0.05 + hue * 0.5, 0.7, 0.62);
    uniforms.uColorA.value.setHSL(0.1, 0.72, 0.66);
    if (pointsRef.current) pointsRef.current.rotation.y = -t * 0.045;
    if (groupRef.current) {
      groupRef.current.rotation.z = t * 0.02;
      groupRef.current.rotation.x = -0.36 + Math.sin(t * 0.15) * 0.03;
    }
  });

  return (
    <group ref={groupRef} rotation={[-0.36, 0, 0.1]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
          <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
        </bufferGeometry>
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={RING_VERTEX}
          fragmentShader={RING_FRAGMENT}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <points rotation={[0.5, 0.8, -0.2]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[farPositions, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[farSizes, 1]} />
          <bufferAttribute attach="attributes-aSeed" args={[farSeeds, 1]} />
        </bufferGeometry>
        <shaderMaterial
          uniforms={farUniforms}
          vertexShader={RING_VERTEX}
          fragmentShader={RING_FRAGMENT}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

function Scene({ quality, audioRef, onReady }) {
  return <Blob quality={quality} audioRef={audioRef} onReady={onReady} />;
}

export default function HeroScene({ quality = 'high', audioRef, active = true, onReady }) {
  const cap = quality === 'high' ? 2 : 1.5;
  return (
    <Canvas
      dpr={[1, cap]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 40 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        window.setTimeout(() => onReady?.(), 60);
      }}
      style={{ position: 'absolute', inset: 0 }}
      aria-hidden="true"
    >
      <Scene quality={quality} audioRef={audioRef} />
    </Canvas>
  );
}
