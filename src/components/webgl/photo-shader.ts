export const TRAIL = 16;

export const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * The photo stays in its true colours. The cursor only bends it:
 * soft liquid ripples from recent pointer points, and a faint RGB split
 * that appears on fast moves and settles back to a clean image.
 */
export const fragment = /* glsl */ `
  precision highp float;
  #define TRAIL ${TRAIL}

  uniform sampler2D uTex;
  uniform float uTime;
  uniform float uVel;
  uniform float uAspect;
  uniform vec2 uDir;
  uniform vec3 uTrail[TRAIL];
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    vec2 asp = vec2(uAspect, 1.0);

    vec2 disp = vec2(0.0);
    for (int i = 0; i < TRAIL; i++) {
      vec3 p = uTrail[i];
      if (p.z < 0.002) continue;
      vec2 d = (uv - p.xy) * asp;
      float dist = length(d);
      float ring = sin(dist * 55.0 - uTime * 7.0) * exp(-dist * 12.0);
      disp += (d / (dist + 1e-4)) * ring * p.z * 0.0065;
    }
    uv += disp / asp;

    vec2 split = uDir * uVel * 0.012;
    vec4 base = texture2D(uTex, uv);
    vec4 r = texture2D(uTex, uv + split);
    vec4 b = texture2D(uTex, uv - split);
    vec3 rgb = vec3(r.r, base.g, b.b);
    float a = max(base.a, max(r.a, b.a) * step(0.02, uVel));

    // Texture is sampled as raw sRGB and written straight out, so the
    // canvas matches the <img> fallback pixel for pixel.
    gl_FragColor = vec4(rgb * a, a);
  }
`;
