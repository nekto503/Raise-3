export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** normalized progress of p inside a..b segment */
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

/** smoothstep */
export const easeInOut = (t: number) => t * t * (3 - 2 * t);

export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** interpolate through a polyline of [x, y] stops with smoothstep easing */
export function curve(p: number, stops: Array<[number, number]>, easing: (t: number) => number = easeInOut): number {
  if (p <= stops[0][0]) return stops[0][1];
  const last = stops[stops.length - 1];
  if (p >= last[0]) return last[1];
  for (let i = 0; i < stops.length - 1; i++) {
    const [x0, y0] = stops[i];
    const [x1, y1] = stops[i + 1];
    if (p >= x0 && p <= x1) {
      return lerp(y0, y1, easing(seg(p, x0, x1)));
    }
  }
  return last[1];
}

export const TAU = Math.PI * 2;
