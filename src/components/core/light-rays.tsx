/*
 * Light Rays by davidhdev — React Bits
 * https://www.reactbits.dev/backgrounds/light-rays
 *
 **/

'use client';

import { Mesh, Program, Renderer, Triangle } from 'ogl';
import { useEffect, useRef, useState } from 'react';

/**
 * Defines the origin point of the light rays animation.
 * Determines where the rays emanate from on the canvas.
 */
export type RaysOrigin =
  | 'top-center'
  | 'top-center-offset'
  | 'top-left'
  | 'top-right'
  | 'right'
  | 'left'
  | 'bottom-center'
  | 'bottom-right'
  | 'bottom-left';

interface LightRaysProps {
  raysOrigin?: RaysOrigin;
  raysColor?: string;
  raysSpeed?: number;
  lightSpread?: number;
  rayLength?: number;
  pulsating?: boolean;
  fadeDistance?: number;
  saturation?: number;
  followMouse?: boolean;
  mouseInfluence?: number;
  noiseAmount?: number;
  distortion?: number;
  className?: string;
}

const DEFAULT_COLOR = '#ffffff';

/**
 * Converts a hexadecimal color string to an RGB array with normalized values (0-1).
 * @param hex - Hexadecimal color string (e.g., '#ffffff' or 'ff0000')
 * @returns RGB array with values normalized to [0, 1] range
 */
const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return m
    ? [
        parseInt(m[1], 16) / 255,
        parseInt(m[2], 16) / 255,
        parseInt(m[3], 16) / 255,
      ]
    : [1, 1, 1];
};

/**
 * Determines the anchor point and direction vector for light rays based on the specified origin.
 * Used to position the rays' starting point and direction on the canvas.
 *
 * @param origin - The origin position of the rays
 * @param w - Canvas width in pixels
 * @param h - Canvas height in pixels
 * @returns Object containing anchor point [x, y] and direction vector [dx, dy]
 */
const getAnchorAndDir = (
  origin: RaysOrigin,
  w: number,
  h: number,
): { anchor: [number, number]; dir: [number, number] } => {
  // Offset distance for rays originating outside the canvas (in normalized units)
  const outside = 0.2;

  switch (origin) {
    case 'top-left':
      return { anchor: [0, -outside * h], dir: [0, 1] };
    case 'top-right':
      return { anchor: [w, -outside * h], dir: [0, 1] };
    case 'top-center-offset':
      return {
        anchor: [0.5 * w + 0.2 * w, -outside * h],
        dir: [-0.2, 1],
      };
    case 'left':
      return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
    case 'right':
      return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
    case 'bottom-left':
      return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
    case 'bottom-center':
      return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
    case 'bottom-right':
      return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
    default: // "top-center"
      return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
  }
};

type Vec2 = [number, number];
type Vec3 = [number, number, number];

/**
 * Uniform variables for the WebGL shader program that control ray rendering.
 * These values are updated in real-time to create dynamic animations.
 */
interface Uniforms {
  iTime: { value: number };
  iResolution: { value: Vec2 };
  rayPos: { value: Vec2 };
  rayDir: { value: Vec2 };
  raysColor: { value: Vec3 };
  raysSpeed: { value: number };
  lightSpread: { value: number };
  rayLength: { value: number };
  pulsating: { value: number };
  fadeDistance: { value: number };
  saturation: { value: number };
  mousePos: { value: Vec2 };
  mouseInfluence: { value: number };
  noiseAmount: { value: number };
  distortion: { value: number };
}

/**
 * LightRays Component - A WebGL-based light ray animation effect.
 *
 * Renders an animated light rays effect on a canvas using WebGL shaders. The rays
 * can originate from various positions, respond to mouse movement, and be customized
 * with colors, speed, spread, and various visual effects.
 *
 * @component
 * @param {LightRaysProps} props - Component configuration
 * @param {RaysOrigin} [props.raysOrigin='top-center'] - Origin point of the rays
 * @param {string} [props.raysColor='#ffffff'] - Hex color of the rays
 * @param {number} [props.raysSpeed=1] - Speed multiplier for ray animation
 * @param {number} [props.lightSpread=1] - Controls how much rays spread outward
 * @param {number} [props.rayLength=2] - Maximum length of rays relative to viewport
 * @param {boolean} [props.pulsating=false] - Enable pulsing effect on rays
 * @param {number} [props.fadeDistance=1.0] - Distance at which rays begin to fade
 * @param {number} [props.saturation=1.0] - Color saturation (0 = grayscale, 1 = full color)
 * @param {boolean} [props.followMouse=true] - Enable rays to follow mouse cursor
 * @param {number} [props.mouseInfluence=0.1] - Strength of mouse influence on ray direction
 * @param {number} [props.noiseAmount=0.0] - Amount of noise texture applied to rays
 * @param {number} [props.distortion=0.0] - Amount of distortion applied to ray shapes
 * @param {string} [props.className=''] - Additional CSS classes for styling
 * @returns A div container that renders the WebGL canvas
 */
export function LightRays({
  raysOrigin = 'top-center',
  raysColor = DEFAULT_COLOR,
  raysSpeed = 1,
  lightSpread = 1,
  rayLength = 2,
  pulsating = false,
  fadeDistance = 1.0,
  saturation = 1.0,
  followMouse = true,
  mouseInfluence = 0.1,
  noiseAmount = 0.0,
  distortion = 0.0,
  className = '',
}: LightRaysProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<Uniforms | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
  const animationIdRef = useRef<number | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const cleanupFunctionRef = useRef<(() => void) | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /**
   * Setup Intersection Observer to detect when the component is visible in the viewport.
   * This allows us to initialize WebGL only when needed, improving performance.
   */
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  /**
   * Main WebGL initialization and rendering setup.
   *
   * This effect:
   * 1. Initializes the OGL renderer with proper sizing
   * 2. Compiles vertex and fragment shaders for the ray effect
   * 3. Sets up the animation loop using requestAnimationFrame
   * 4. Handles resize events to keep canvas responsive
   * 5. Manages cleanup when component unmounts or visibility changes
   */
  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    if (cleanupFunctionRef.current) {
      cleanupFunctionRef.current();
      cleanupFunctionRef.current = null;
    }

    const initializeWebGL = async () => {
      if (!containerRef.current) return;

      await new Promise((resolve) => setTimeout(resolve, 10));

      if (!containerRef.current) return;

      const renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, 2),
        alpha: true,
      });

      rendererRef.current = renderer;

      const gl = renderer.gl;

      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';

      // Clear previous canvas if any
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      containerRef.current.appendChild(gl.canvas);

      const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

      /**
       * Fragment shader that renders the light rays effect.
       *
       * Key shader logic:
       * - rayStrength() calculates intensity at each pixel based on angle to ray source
       * - Uses dual sine/cosine waves with different frequencies for visual complexity
       * - Applies spread, fade, and distortion effects
       * - Includes pulsation, noise, and saturation adjustments
       * - Applies brightness gradient from top to bottom
       */
      const frag = `precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

/**
 * Simple pseudo-random number generator using sine function.
 * Used for noise generation to add visual variety to rays.
 */
float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  // Vector from ray source to current pixel
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  // Apply time-based distortion to create wave-like effects
  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  
  // Calculate spread factor: higher values tighten the cone of rays
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  // Calculate how far the pixel is from the ray source
  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  
  // Falloff based on ray length (rays fade as they extend)
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
  
  // Separate fade falloff for smooth transition at specified distance
  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  
  // Pulsating effect with sinusoidal variation
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  // Combine two sine/cosine waves with different seeds for visual complexity
  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  // Flip Y coordinate: fragment coordinates have origin at bottom-left, but we need top-left
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  
  // Interpolate ray direction between fixed direction and mouse direction
  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  // Combine two ray patterns with different random seeds for richer visuals
  vec4 rays1 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                           1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                           1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  // Add noise texture if enabled
  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  // Apply brightness gradient from top to bottom with color channel modulation
  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  // Apply saturation adjustment: 0 = grayscale, 1 = full color
  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  // Apply the specified ray color
  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor  = color;
}`;

      const uniforms: Uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] },

        rayPos: { value: [0, 0] },
        rayDir: { value: [0, 1] },

        raysColor: { value: hexToRgb(raysColor) },
        raysSpeed: { value: raysSpeed },
        lightSpread: { value: lightSpread },
        rayLength: { value: rayLength },
        pulsating: { value: pulsating ? 1.0 : 0.0 },
        fadeDistance: { value: fadeDistance },
        saturation: { value: saturation },
        mousePos: { value: [0.5, 0.5] },
        mouseInfluence: { value: mouseInfluence },
        noiseAmount: { value: noiseAmount },
        distortion: { value: distortion },
      };

      uniformsRef.current = uniforms;

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex: vert,
        fragment: frag,
        uniforms,
      });
      const mesh = new Mesh(gl, { geometry, program });

      meshRef.current = mesh;

      /**
       * Updates canvas size and ray position based on container dimensions.
       * Called on initialization and whenever the window resizes.
       */
      const updatePlacement = () => {
        if (!containerRef.current || !renderer) return;

        renderer.dpr = Math.min(window.devicePixelRatio, 2);

        const { clientWidth: wCSS, clientHeight: hCSS } = containerRef.current;

        renderer.setSize(wCSS, hCSS);

        // Calculate physical pixel dimensions accounting for device pixel ratio
        const dpr = renderer.dpr;
        const w = wCSS * dpr;
        const h = hCSS * dpr;

        uniforms.iResolution.value = [w, h];

        const { anchor, dir } = getAnchorAndDir(raysOrigin, w, h);

        uniforms.rayPos.value = anchor;
        uniforms.rayDir.value = dir;
      };

      /**
       * Animation loop executed every frame via requestAnimationFrame.
       * Updates time uniform and renders the scene continuously.
       */
      const loop = (t: number) => {
        if (!rendererRef.current || !uniformsRef.current || !meshRef.current) {
          return;
        }

        uniforms.iTime.value = t * 0.001;

        if (followMouse && mouseInfluence > 0.0) {
          // Smooth mouse movement with exponential smoothing (92% decay)
          // This creates a natural lag effect that's visually pleasing
          const smoothing = 0.92;

          smoothMouseRef.current.x =
            smoothMouseRef.current.x * smoothing +
            mouseRef.current.x * (1 - smoothing);
          smoothMouseRef.current.y =
            smoothMouseRef.current.y * smoothing +
            mouseRef.current.y * (1 - smoothing);

          uniforms.mousePos.value = [
            smoothMouseRef.current.x,
            smoothMouseRef.current.y,
          ];
        }

        try {
          renderer.render({ scene: mesh });
          animationIdRef.current = requestAnimationFrame(loop);
        } catch (error) {
          // Catch and log WebGL errors without crashing the component
          console.warn('WebGL rendering error:', error);

          return;
        }
      };

      window.addEventListener('resize', updatePlacement);
      updatePlacement();
      animationIdRef.current = requestAnimationFrame(loop);

      /**
       * Cleanup function to properly dispose of WebGL resources.
       * Removes event listeners, cancels animation frame, and releases GPU memory.
       */
      cleanupFunctionRef.current = () => {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
          animationIdRef.current = null;
        }

        window.removeEventListener('resize', updatePlacement);

        if (renderer) {
          try {
            const canvas = renderer.gl.canvas;
            // Use WebGL extension to properly lose context and free GPU memory
            const loseContextExt =
              renderer.gl.getExtension('WEBGL_lose_context');

            if (loseContextExt) {
              loseContextExt.loseContext();
            }

            // Remove canvas from DOM
            if (canvas && canvas.parentNode) {
              canvas.parentNode.removeChild(canvas);
            }
          } catch (error) {
            console.warn('Error during WebGL cleanup:', error);
          }
        }

        // Reset all refs to null to prevent memory leaks
        rendererRef.current = null;
        uniformsRef.current = null;
        meshRef.current = null;
      };
    };

    initializeWebGL();

    return () => {
      if (cleanupFunctionRef.current) {
        cleanupFunctionRef.current();
        cleanupFunctionRef.current = null;
      }
    };
  }, [
    isVisible,
    raysOrigin,
    raysColor,
    raysSpeed,
    lightSpread,
    rayLength,
    pulsating,
    fadeDistance,
    saturation,
    followMouse,
    mouseInfluence,
    noiseAmount,
    distortion,
  ]);

  /**
   * Update shader uniforms when props change.
   * This allows real-time adjustments to the ray appearance and behavior.
   */
  useEffect(() => {
    if (!uniformsRef.current || !containerRef.current || !rendererRef.current)
      return;

    const u = uniformsRef.current;
    const renderer = rendererRef.current;

    u.raysColor.value = hexToRgb(raysColor);
    u.raysSpeed.value = raysSpeed;
    u.lightSpread.value = lightSpread;
    u.rayLength.value = rayLength;
    u.pulsating.value = pulsating ? 1.0 : 0.0;
    u.fadeDistance.value = fadeDistance;
    u.saturation.value = saturation;
    u.mouseInfluence.value = mouseInfluence;
    u.noiseAmount.value = noiseAmount;
    u.distortion.value = distortion;

    // Recalculate anchor and direction if origin or size changes
    const { clientWidth: wCSS, clientHeight: hCSS } = containerRef.current;
    const dpr = renderer.dpr;
    const { anchor, dir } = getAnchorAndDir(raysOrigin, wCSS * dpr, hCSS * dpr);

    u.rayPos.value = anchor;
    u.rayDir.value = dir;
  }, [
    raysColor,
    raysSpeed,
    lightSpread,
    raysOrigin,
    rayLength,
    pulsating,
    fadeDistance,
    saturation,
    mouseInfluence,
    noiseAmount,
    distortion,
  ]);

  /**
   * Track mouse movement to enable ray following effect.
   * Calculates normalized coordinates (0-1) relative to the container.
   */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !rendererRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Calculate normalized coordinates (0-1) relative to container
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      mouseRef.current = { x, y };
    };

    if (followMouse) {
      window.addEventListener('mousemove', handleMouseMove);

      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [followMouse]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none relative z-3 h-full w-full overflow-hidden ${className}`.trim()}
      role="presentation"
    />
  );
}
