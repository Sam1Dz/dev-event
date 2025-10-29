'use client';

import { Mesh, Program, Renderer, Triangle } from 'ogl';
import React from 'react';

/**
 * Defines the origin point and direction of the light rays in the canvas.
 * Each option positions the rays at different edges or centers of the viewport.
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

/**
 * Configuration properties for the LightRays component.
 * All properties are optional and have sensible defaults.
 *
 * @interface LightRaysProps
 * @property {RaysOrigin} [raysOrigin='top-center'] - The origin point and direction of the rays
 * @property {string} [raysColor='#ffffff'] - Hex color code for the rays
 * @property {number} [raysSpeed=1] - Animation speed multiplier (affects pulsation and wave speed)
 * @property {number} [lightSpread=1] - Controls how widely the rays spread from origin (higher = wider spread)
 * @property {number} [rayLength=2] - Length of the rays as a multiplier of canvas width
 * @property {boolean} [pulsating=false] - Whether the rays have a pulsating animation effect
 * @property {number} [fadeDistance=1.0] - Distance at which rays start to fade (normalized to 0-1)
 * @property {number} [saturation=1.0] - Color saturation level (0 = grayscale, 1 = full color)
 * @property {boolean} [followMouse=true] - Whether rays follow the mouse cursor
 * @property {number} [mouseInfluence=0.1] - How much the mouse affects ray direction (0-1)
 * @property {number} [noiseAmount=0.0] - Amount of noise/grain effect applied to rays (0-1)
 * @property {number} [distortion=0.0] - Wave distortion effect strength
 * @property {string} [className=''] - Additional CSS classes for the container div
 */
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

/** Default color for rays when not specified (white) */
const DEFAULT_COLOR = '#ffffff';
/** Maximum device pixel ratio to prevent over-rendering on ultra-high DPI displays */
const DPR_MAX = 2;
/** Intersection Observer threshold for visibility detection (10% of element must be visible) */
const INTERSECTION_OBSERVER_THRESHOLD = 0.1;
/** Delay in milliseconds before initializing WebGL (allows DOM to settle) */
const WEBGL_INITIALIZATION_DELAY_MS = 10;
/** Smoothing factor for mouse position interpolation (higher = smoother but slower tracking) */
const MOUSE_SMOOTHING_FACTOR = 0.92;

/** Ratio for offsetting ray anchor points beyond canvas boundaries */
const RAYS_ANCHOR_OFFSET_RATIO = 0.2;

/**
 * Converts a hex color string to normalized RGB values (0-1 range).
 * Used for passing color data to WebGL shaders.
 *
 * @param {string} hex - Hex color code (e.g., '#ffffff' or 'ff0000')
 * @returns {[number, number, number]} Array of normalized RGB values [r, g, b] in range 0-1
 *
 * @example
 * hexToRgb('#ff0000') // Returns [1, 0, 0] (red)
 * hexToRgb('00ff00') // Returns [0, 1, 0] (green)
 */
const hexToRgb = (hex: string): [number, number, number] => {
  const hexMatch = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!hexMatch) return [1, 1, 1];

  // Extract R, G, B hex values and convert to 0-1 normalized range
  return [
    parseInt(hexMatch[1], 16) / 255,
    parseInt(hexMatch[2], 16) / 255,
    parseInt(hexMatch[3], 16) / 255,
  ];
};

/**
 * Calculates the anchor point and direction vector for rays based on the specified origin.
 * The anchor point is positioned at or beyond the canvas edge, and the direction vector
 * points toward the center of the canvas.
 *
 * @param {RaysOrigin} origin - The origin position for the rays
 * @param {number} width - Canvas width in pixels
 * @param {number} height - Canvas height in pixels
 * @returns {{anchor: [number, number], dir: [number, number]}} Object containing:
 *   - anchor: [x, y] position of ray origin (can be outside canvas boundaries)
 *   - dir: [dx, dy] normalized direction vector toward canvas
 *
 * @example
 * getAnchorAndDir('top-center', 1920, 1080)
 * // Returns: { anchor: [960, -216], dir: [0, 1] }
 */
const getAnchorAndDir = (
  origin: RaysOrigin,
  width: number,
  height: number,
): { anchor: [number, number]; dir: [number, number] } => {
  const offset = RAYS_ANCHOR_OFFSET_RATIO;

  switch (origin) {
    case 'top-left':
      return { anchor: [0, -offset * height], dir: [0, 1] };
    case 'top-right':
      return { anchor: [width, -offset * height], dir: [0, 1] };
    case 'top-center-offset':
      return {
        anchor: [0.5 * width + 0.2 * width, -offset * height],
        dir: [-0.2, 1],
      };
    case 'left':
      return { anchor: [-offset * width, 0.5 * height], dir: [1, 0] };
    case 'right':
      return { anchor: [(1 + offset) * width, 0.5 * height], dir: [-1, 0] };
    case 'bottom-left':
      return { anchor: [0, (1 + offset) * height], dir: [0, -1] };
    case 'bottom-center':
      return { anchor: [0.5 * width, (1 + offset) * height], dir: [0, -1] };
    case 'bottom-right':
      return { anchor: [width, (1 + offset) * height], dir: [0, -1] };
    default:
      return { anchor: [0.5 * width, -offset * height], dir: [0, 1] };
  }
};

/**
 * Returns the vertex shader source code.
 * Transforms screen-space coordinates to normalized UV coordinates for fragment shader.
 *
 * @returns {string} GLSL vertex shader source code
 */
const getVertexShaderSource = (): string => `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

/**
 * Returns the fragment shader source code.
 * Implements the main ray rendering algorithm with various effects:
 * - Multi-layer ray generation with different frequencies
 * - Mouse-following capability
 * - Pulsating, distortion, and noise effects
 * - Color saturation control
 * - Vertical brightness gradient
 *
 * @returns {string} GLSL fragment shader source code
 */
const getFragmentShaderSource = (): string => `precision highp float;

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
 * Pseudo-random number generator using sine and fract functions.
 * Produces consistent, smooth noise based on input coordinates.
 */
float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

/**
 * Calculates the strength/intensity of a single ray layer at a given coordinate.
 * Combines angle-based spreading, distance falloff, and temporal animation.
 *
 * @param raySource - Origin point of the ray
 * @param rayRefDirection - Reference direction vector
 * @param coord - Current pixel coordinate being evaluated
 * @param seedA - Seed value for first sine oscillation
 * @param seedB - Seed value for second cosine oscillation
 * @param speed - Animation speed multiplier
 * @returns Float value (0-1) representing ray strength at this coordinate
 */
float rayStrength(
  vec2 raySource,
  vec2 rayRefDirection,
  vec2 coord,
  float seedA,
  float seedB,
  float speed
) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  // Apply wave distortion based on time and distance for organic movement
  float distortedAngle =
    cosAngle +
    distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;

  // Power function creates sharp cone-like spread from ray origin
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  // Calculate distance-based falloff to make rays fade with distance
  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);

  // Fade distance creates a smooth transition zone for ray edge
  float fadeFalloff = clamp(
    (iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance),
    0.5,
    1.0
  );

  // Optional pulsating effect: oscillates ray intensity over time
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  // Combine sine and cosine with different seeds for complex wave patterns
  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
      (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0,
    1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);

  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    // Interpolate ray direction toward mouse position based on influence parameter
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  // Combine two ray layers with different animation speeds for visual complexity
  vec4 rays1 =
    vec4(1.0) *
    rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
  vec4 rays2 =
    vec4(1.0) *
    rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234, 1.1 * raysSpeed);

  // Blend two ray layers with weighted intensities
  fragColor = rays1 * 0.5 + rays2 * 0.4;

  // Apply optional noise grain effect
  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  // Apply vertical brightness gradient (brighter at bottom, dimmer at top)
  // This creates the illusion of light fading into the distance
  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  // Apply saturation control: mix with grayscale based on saturation value
  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  // Multiply final color by user-specified ray color
  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}`;

/**
 * Creates initial shader uniform values with default parameters.
 * Uniforms are used to pass data from JavaScript to the WebGL shader.
 *
 * @param {string} raysColor - Hex color code for the rays
 * @returns {Record<string, {value: number | number[] | [number, number, number]}>} Object mapping uniform names to their initial values
 */
const createShaderUniforms = (
  raysColor: string,
): Record<string, { value: number | number[] | [number, number, number] }> => ({
  iTime: { value: 0 },
  iResolution: { value: [1, 1] },
  rayPos: { value: [0, 0] },
  rayDir: { value: [0, 1] },
  raysColor: { value: hexToRgb(raysColor) },
  raysSpeed: { value: 1 },
  lightSpread: { value: 1 },
  rayLength: { value: 2 },
  pulsating: { value: 0.0 },
  fadeDistance: { value: 1.0 },
  saturation: { value: 1.0 },
  mousePos: { value: [0.5, 0.5] },
  mouseInfluence: { value: 0.1 },
  noiseAmount: { value: 0.0 },
  distortion: { value: 0.0 },
});

/**
 * Updates shader uniforms based on component props.
 * Called when props change to reflect updates in the WebGL rendering.
 *
 * @param {Record<string, {value: number | number[] | [number, number, number]}>} uniforms - Shader uniforms object to update
 * @param {Omit<LightRaysProps, 'className'>} props - Component props (excluding className)
 * @returns {void}
 */
const updateShaderUniforms = (
  uniforms: Record<
    string,
    { value: number | number[] | [number, number, number] }
  >,
  props: Omit<LightRaysProps, 'className'>,
): void => {
  const {
    raysColor = DEFAULT_COLOR,
    raysSpeed = 1,
    lightSpread = 1,
    rayLength = 2,
    pulsating = false,
    fadeDistance = 1.0,
    saturation = 1.0,
    mouseInfluence = 0.1,
    noiseAmount = 0.0,
    distortion = 0.0,
  } = props;

  uniforms.raysColor.value = hexToRgb(raysColor);
  uniforms.raysSpeed.value = raysSpeed;
  uniforms.lightSpread.value = lightSpread;
  uniforms.rayLength.value = rayLength;
  uniforms.pulsating.value = pulsating ? 1.0 : 0.0;
  uniforms.fadeDistance.value = fadeDistance;
  uniforms.saturation.value = saturation;
  uniforms.mouseInfluence.value = mouseInfluence;
  uniforms.noiseAmount.value = noiseAmount;
  uniforms.distortion.value = distortion;
};

/**
 * LightRays component - A WebGL-powered animated light ray effect.
 *
 * This component renders dynamic light rays using WebGL through the OGL library.
 * Features include:
 * - Configurable ray origin and direction
 * - Mouse following with smooth interpolation
 * - Pulsating and distortion effects
 * - Color and saturation controls
 * - Optimized rendering with intersection observer for visibility-based updates
 * - Automatic cleanup and resource management
 *
 * The component uses several optimization techniques:
 * - Intersection Observer: Only renders when element is visible
 * - Device Pixel Ratio capping: Prevents over-rendering on ultra-high DPI displays
 * - Exponential smoothing: Smooth mouse position tracking
 * - Proper WebGL cleanup: Releases resources on unmount
 *
 * @component
 * @param {LightRaysProps} props - Configuration properties
 * @returns Container div with WebGL canvas appended
 *
 * @example
 * // Basic usage with default settings
 * <LightRays />
 *
 * @example
 * // Custom configuration
 * <LightRays
 *   raysOrigin="bottom-center"
 *   raysColor="#00ff00"
 *   raysSpeed={1.5}
 *   pulsating={true}
 *   followMouse={true}
 *   className="absolute inset-0"
 * />
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
  // DOM and WebGL references
  const containerRef = React.useRef<HTMLDivElement>(null);
  const uniformsRef = React.useRef<Record<
    string,
    { value: number | number[] | [number, number, number] }
  > | null>(null);
  const rendererRef = React.useRef<Renderer | null>(null);
  // Mouse position tracking with separate refs for raw and smoothed values
  const mouseRef = React.useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = React.useRef({ x: 0.5, y: 0.5 });
  // Animation and lifecycle management
  const animationIdRef = React.useRef<number | null>(null);
  const meshRef = React.useRef<Mesh | null>(null);
  const cleanupFunctionRef = React.useRef<(() => void) | null>(null);
  const observerRef = React.useRef<IntersectionObserver | null>(null);

  // Track visibility state to optimize rendering
  const [isVisible, setIsVisible] = React.useState(false);

  // Effect 1: Set up Intersection Observer to track component visibility
  // This prevents rendering when component is off-screen for performance optimization
  React.useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0].isIntersecting);
      },
      { threshold: INTERSECTION_OBSERVER_THRESHOLD },
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, []);

  // Effect 2: Initialize and manage WebGL rendering
  // This is the main effect that sets up the renderer, shaders, and animation loop
  React.useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    cleanupFunctionRef.current?.();

    const initializeWebGL = async () => {
      if (!containerRef.current) return;

      // Wait briefly for DOM to settle before initializing WebGL
      await new Promise((resolve) =>
        setTimeout(resolve, WEBGL_INITIALIZATION_DELAY_MS),
      );
      if (!containerRef.current) return;

      // Create OGL renderer with device pixel ratio optimization
      const renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, DPR_MAX),
        alpha: true,
      });

      rendererRef.current = renderer;
      const gl = renderer.gl;

      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';

      // Clear container and append WebGL canvas
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      containerRef.current.appendChild(gl.canvas);

      // Create shader uniforms with initial values
      const uniforms = createShaderUniforms(raysColor);

      uniformsRef.current = uniforms;

      // Create geometry and shader program
      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex: getVertexShaderSource(),
        fragment: getFragmentShaderSource(),
        uniforms,
      });
      const mesh = new Mesh(gl, { geometry, program });

      meshRef.current = mesh;

      /**
       * Updates renderer size and ray positioning based on container dimensions.
       * Called on mount and window resize events.
       */
      const updatePlacement = () => {
        if (!containerRef.current || !renderer) return;

        renderer.dpr = Math.min(window.devicePixelRatio, DPR_MAX);
        const { clientWidth: widthCSS, clientHeight: heightCSS } =
          containerRef.current;

        renderer.setSize(widthCSS, heightCSS);

        // Account for device pixel ratio when calculating shader coordinates
        const dpr = renderer.dpr;
        const width = widthCSS * dpr;
        const height = heightCSS * dpr;

        uniforms.iResolution.value = [width, height];

        const { anchor, dir } = getAnchorAndDir(raysOrigin, width, height);

        uniforms.rayPos.value = anchor;
        uniforms.rayDir.value = dir;
      };

      /**
       * Main animation loop - runs every frame via requestAnimationFrame.
       * Updates time uniforms, handles mouse smoothing, and renders the scene.
       */
      const loop = (timeMs: number) => {
        if (!rendererRef.current || !uniformsRef.current || !meshRef.current)
          return;

        // Update elapsed time (in seconds)
        uniformsRef.current.iTime.value = timeMs * 0.001;

        // Apply exponential smoothing to mouse position for smooth tracking
        if (followMouse && mouseInfluence > 0.0) {
          smoothMouseRef.current.x =
            smoothMouseRef.current.x * MOUSE_SMOOTHING_FACTOR +
            mouseRef.current.x * (1 - MOUSE_SMOOTHING_FACTOR);
          smoothMouseRef.current.y =
            smoothMouseRef.current.y * MOUSE_SMOOTHING_FACTOR +
            mouseRef.current.y * (1 - MOUSE_SMOOTHING_FACTOR);

          uniformsRef.current.mousePos.value = [
            smoothMouseRef.current.x,
            smoothMouseRef.current.y,
          ];
        }

        try {
          renderer.render({ scene: mesh });
          animationIdRef.current = requestAnimationFrame(loop);
        } catch (error) {
          console.warn('WebGL rendering error:', error);
        }
      };

      window.addEventListener('resize', updatePlacement);
      updatePlacement();
      animationIdRef.current = requestAnimationFrame(loop);

      /**
       * Cleanup function to properly release WebGL resources.
       * Prevents memory leaks and WebGL context loss.
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
            // Use WEBGL_lose_context extension to properly clean up context
            const loseContextExt =
              renderer.gl.getExtension('WEBGL_lose_context');

            loseContextExt?.loseContext();
            canvas?.parentNode?.removeChild(canvas);
          } catch (error) {
            console.warn('Error during WebGL cleanup:', error);
          }
        }

        rendererRef.current = null;
        uniformsRef.current = null;
        meshRef.current = null;
      };
    };

    initializeWebGL();

    return () => {
      cleanupFunctionRef.current?.();
      cleanupFunctionRef.current = null;
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

  // Effect 3: Update shader uniforms when props change
  // This allows for real-time adjustments to animation parameters
  React.useEffect(() => {
    if (!uniformsRef.current || !containerRef.current || !rendererRef.current)
      return;

    const renderer = rendererRef.current;

    updateShaderUniforms(uniformsRef.current, {
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
    });

    // Recalculate ray position and direction when origin changes
    const { clientWidth: widthCSS, clientHeight: heightCSS } =
      containerRef.current;
    const dpr = renderer.dpr;
    const { anchor, dir } = getAnchorAndDir(
      raysOrigin,
      widthCSS * dpr,
      heightCSS * dpr,
    );

    uniformsRef.current.rayPos.value = anchor;
    uniformsRef.current.rayDir.value = dir;
  }, [
    raysColor,
    raysSpeed,
    lightSpread,
    raysOrigin,
    rayLength,
    pulsating,
    fadeDistance,
    saturation,
    followMouse,
    mouseInfluence,
    noiseAmount,
    distortion,
  ]);

  // Effect 4: Track mouse movement for ray following feature
  // Mouse position is normalized to 0-1 range and stored for use in animation loop
  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current || !rendererRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      // Normalize mouse position relative to container
      mouseRef.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      };
    };

    if (followMouse) {
      window.addEventListener('mousemove', handleMouseMove);

      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [followMouse]);

  // Render container div that will hold the WebGL canvas
  // The canvas is appended dynamically by the WebGL initialization code
  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none relative z-3 h-full w-full overflow-hidden ${className}`.trim()}
      role="presentation"
    />
  );
}
