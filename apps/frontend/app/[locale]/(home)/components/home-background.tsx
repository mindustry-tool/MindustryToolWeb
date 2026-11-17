'use client';

import React, { useRef, useMemo, useSyncExternalStore } from 'react';
import { Color, Mesh, ShaderMaterial } from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { CatchError } from '@/components/error/catch-error';

function isWebGLAvailable(): boolean {
	if (typeof window === 'undefined') return false;
	try {
		const canvas = document.createElement('canvas');
		return Boolean(
			(window.WebGL2RenderingContext && canvas.getContext('webgl2')) ||
			(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
		);
	} catch {
		return false;
	}
}

const emptySubscribe = () => () => {};
const getWebGLClientSnapshot = () => isWebGLAvailable();
const getWebGLServerSnapshot = () => false;

function Stars({ count = 2000 }) {
	const positions = useMemo(() => {
		const arr = new Float32Array(count * 3);
		let seed = 1;

		// Simple deterministic random function
		function random() {
			const x = Math.sin(seed++) * 10000;
			return x - Math.floor(x);
		}

		for (let i = 0; i < count; i++) {
			// random sphere distribution
			const r = 200 + random() * 200;
			const theta = random() * Math.PI * 2;
			const phi = Math.acos(2 * random() - 1);
			const x = r * Math.sin(phi) * Math.cos(theta);
			const y = r * Math.sin(phi) * Math.sin(theta);
			const z = r * Math.cos(phi);
			arr[i * 3] = x;
			arr[i * 3 + 1] = y;
			arr[i * 3 + 2] = z;
		}
		return arr;
	}, [count]);

	return (
		<points>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					count={positions.length / 3}
					array={positions}
					itemSize={3}
					args={[positions, 3]}
				/>
			</bufferGeometry>
			<pointsMaterial size={1.2} sizeAttenuation color={'#9fb3ff'} transparent opacity={0.8} />
		</points>
	);
}

function Planet() {
	const ref = useRef<Mesh>(null!);

	const uniforms = useMemo(
		() => ({
			uTime: { value: 0 },
			uColorA: { value: new Color('#1a0b2e') }, // very dark purple
			uColorB: { value: new Color('#33105f') }, // dark purple
			uColorC: { value: new Color('#4c1d95') }, // dim glow
		}),
		[],
	);

	useFrame((state, delta) => {
		if (ref.current) {
			ref.current.rotation.y += delta * 0.2; // slow rotation
			ref.current.rotation.x += delta * 0.05;

			const material = ref.current.material as ShaderMaterial;
			if (material.uniforms?.uTime) {
				material.uniforms.uTime.value = state.clock.elapsedTime;
			}
		}
	});

	const vertex = /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPos = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `;

	const fragment = /* glsl */ `
    precision highp float;
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;
    varying vec3 vNormal;
    varying vec3 vWorldPos;

    // simple 3D value noise
    float hash(vec3 p){
      return fract(sin(dot(p, vec3(12.9898, 78.233, 54.53))) * 43758.5453);
    }
    
    float noise(vec3 p){
      vec3 i = floor(p);
      vec3 f = fract(p);
      float n000 = hash(i + vec3(0,0,0));
      float n100 = hash(i + vec3(1,0,0));
      float n010 = hash(i + vec3(0,1,0));
      float n110 = hash(i + vec3(1,1,0));
      float n001 = hash(i + vec3(0,0,1));
      float n101 = hash(i + vec3(1,0,1));
      float n011 = hash(i + vec3(0,1,1));
      float n111 = hash(i + vec3(1,1,1));
      vec3 u = f*f*(3.0-2.0*f);
      float n00 = mix(n000, n100, u.x);
      float n01 = mix(n001, n101, u.x);
      float n10 = mix(n010, n110, u.x);
      float n11 = mix(n011, n111, u.x);
      float n0 = mix(n00, n10, u.y);
      float n1 = mix(n01, n11, u.y);
      return mix(n0, n1, u.z);
    }
    float fbm(vec3 p){
      float v = 0.0;
      float a = 0.5;
      for(int i=0;i<3;i++){
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
      }
      return v;
    }

    void main(){
      // drive pattern by normal-space to avoid seams
      vec3 n = normalize(vNormal);
      float t = uTime * 0.15;

      // blotchy, quantized clouds
      float m = fbm(n * 6.0 + vec3(t, t*0.7, t*1.2));
      float cells = floor(m * 9.0) / 9.0; // pixelated/hex-like feel

      vec3 base = mix(uColorA, uColorB, cells);
      base = mix(base, uColorC, smoothstep(0.6, 1.0, cells));

      // subtle moving highlights
      float swirl = fbm(n * 10.0 + vec3(t*0.6, -t*0.4, t*0.8));
      base += 0.15 * vec3(0.4,0.2,0.8) * swirl;
      
      // rim glow (fresnel)
      vec3 viewDir = normalize(cameraPosition - vWorldPos);
      float fresnel = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), 3.0);
      vec3 glow = vec3(1.2, 0.7, 1.5) * fresnel * 2.0;

      // final
      vec3 col = base + glow;
      // slight vignette on the sphere edge
      float edge = clamp(dot(n, viewDir), 0.0, 1.0);
      col *= mix(0.95, 1.0, edge);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

	return (
		<mesh ref={ref}>
			<sphereGeometry args={[5.8, 64, 64]} />
			<shaderMaterial args={[{ uniforms, vertexShader: vertex, fragmentShader: fragment }]} transparent={false} />
		</mesh>
	);
}

export default function HomeBackground() {
	const webglSupported = useSyncExternalStore(emptySubscribe, getWebGLClientSnapshot, getWebGLServerSnapshot);

	return (
		<div
			style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 0, background: 'black' }}
		>
			{webglSupported && (
				<CatchError fallback={null} logError={false}>
					<Canvas
						dpr={[1, 1.5]}
						gl={{ alpha: false, powerPreference: 'low-power' }}
						camera={{ position: [0, 0, 20], fov: 45 }}
					>
						<color attach="background" args={['#000000']} />
						<ambientLight intensity={0.1} />
						<pointLight position={[10, 10, 10]} intensity={0.5} color={'#b17cff'} />
						<Stars />
						<Planet />
					</Canvas>
				</CatchError>
			)}
			<div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black pointer-events-none" />
		</div>
	);
}
