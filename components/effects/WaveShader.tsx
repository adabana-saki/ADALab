'use client';

import { useEffect, useRef } from 'react';

export function WaveShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Setup canvas size
    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    updateSize();

    // Initialize WebGL
    const gl = canvas.getContext('webgl', { alpha: true, antialias: true });
    if (!gl) {
      return;
    }
    glRef.current = gl;

    // Vertex Shader
    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment Shader - Mathematical wave patterns
    const fragmentShaderSource = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;

      // Cyberpunk color palette
      vec3 neonCyan = vec3(0.024, 0.714, 0.824);
      vec3 neonPurple = vec3(0.545, 0.361, 0.965);
      vec3 neonFuchsia = vec3(0.851, 0.275, 0.937);
      vec3 neonPink = vec3(0.925, 0.282, 0.6);

      // Multiple wave functions
      float wave(vec2 uv, float speed, float freq, float amp) {
        return sin(uv.x * freq + u_time * speed) * amp +
               sin(uv.y * freq * 0.7 + u_time * speed * 0.8) * amp * 0.5;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        vec2 center = uv - 0.5;

        // Create multiple wave layers
        float w1 = wave(uv, 0.5, 8.0, 0.15);
        float w2 = wave(uv, -0.3, 12.0, 0.1);
        float w3 = wave(uv, 0.7, 6.0, 0.2);

        // Combine waves
        float waves = w1 + w2 + w3;

        // Add radial gradient from center
        float dist = length(center);
        float radial = 1.0 - smoothstep(0.0, 0.7, dist);

        // Create pulsing effect
        float pulse = sin(u_time * 0.5) * 0.3 + 0.7;

        // Color mixing based on wave intensity
        vec3 color1 = mix(neonCyan, neonPurple, uv.x + waves * 0.3);
        vec3 color2 = mix(neonFuchsia, neonPink, uv.y + waves * 0.3);
        vec3 finalColor = mix(color1, color2, sin(waves * 2.0 + u_time) * 0.5 + 0.5);

        // Apply radial gradient and pulse
        finalColor *= radial * pulse;

        // Add wave highlights
        float highlight = smoothstep(0.98, 1.0, sin(waves * 10.0));
        finalColor += vec3(highlight) * 0.5;

        // Vignette effect
        float vignette = smoothstep(0.8, 0.2, dist);
        finalColor *= vignette;

        // Final alpha with fade at edges
        float alpha = radial * 0.15 * pulse;

        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    // Compile shader
    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return;
    }

    programRef.current = program;
    gl.useProgram(program);

    // Setup geometry (fullscreen quad)
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

    // Enable blending for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Animation loop
    const startTime = Date.now();

    const render = () => {
      if (!gl || !program) return;

      const currentTime = (Date.now() - startTime) * 0.001; // Convert to seconds

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(timeLocation, currentTime);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    // Handle resize
    const handleResize = () => {
      updateSize();
      if (gl) {
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);

      // Cleanup WebGL resources
      if (gl && program) {
        gl.deleteProgram(program);
      }
      if (gl && vertexShader) {
        gl.deleteShader(vertexShader);
      }
      if (gl && fragmentShader) {
        gl.deleteShader(fragmentShader);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[5]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
