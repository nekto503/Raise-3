/* Raise 3 design tokens shared between DOM, canvas textures and 3D scene */

export const COLORS = {
  ink: "#0A0A0A",
  ink2: "#6B7280",
  cobalt: "#2F5BFF",
  cobaltDeep: "#1F3FD6",
  marker: "#FF5C8A",
  sky: "#7EC8F2",
  pink: "#FFB3D9",
  violet: "#B9A3E8",
  night: "#0B0B0D",
  mist: "#F6F7FB",
  white: "#FFFFFF",
} as const;

export const GRADIENT_STUDIO = "linear-gradient(92deg, #7EC8F2 0%, #FFB3D9 46%, #B9A3E8 100%)";

/** gsap-compatible cubic beziers */
export const EASE = {
  expo: [0.16, 1, 0.3, 1] as [number, number, number, number],
  smooth: [0.65, 0, 0.35, 1] as [number, number, number, number],
  springy: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
};

export const DUR = {
  fast: 0.35,
  base: 0.7,
  slow: 1.1,
};

/** fake chart data drawn on generated slide textures */
export const SLIDE_DATA = {
  bars: [46, 68, 57, 82, 74, 96],
  donut: 0.92,
  spark: [12, 30, 22, 44, 38, 58, 52, 76, 70, 92],
};
