

export const __get__ = {
  x(a: number | Array<number>) { return typeof a === "number" ? a : a[0] ?? 0 },
  y(a: number | Array<number>) { return typeof a === "number" ? a : a[1] ?? 0 },
  z(a: number | Array<number>) { return typeof a === "number" ? a : a[2] ?? 0 },
  w(a: number | Array<number>) { return typeof a === "number" ? a : a[3] ?? 0 },
  n(a: number | Array<number>) { return typeof a === "number" ? 1 : a.length  },
}

export const __set__ = {
  x(a: number | Array<number>, x: number) { return Array.isArray(a) ? (a[0] = x) : a; },
  y(a: number | Array<number>, y: number) { return Array.isArray(a) ? (a[1] = y) : a; },
  z(a: number | Array<number>, z: number) { return Array.isArray(a) ? (a[2] = z) : a; },
  w(a: number | Array<number>, w: number) { return Array.isArray(a) ? (a[3] = w) : a; },
}

export function x(a: number | Array<number>, x ?: number) {
  return x !== undefined ? __set__.x(a, x): __get__.x(a);
}

export function y(a: number | Array<number>, y ?: number) {
  return y !== undefined ? __set__.y(a, y): __get__.y(a);
}

export function z(a: number | Array<number>, z ?: number) {
  return z !== undefined ? __set__.z(a, z): __get__.z(a);
}

export function w(a: number | Array<number>, w ?: number) {
  return w !== undefined ? __set__.w(a, w): __get__.w(a);
}

export const Vector = {
  x, y, z, w,
  __get__,
  __set__,
}

export type Vector2 = [number, number]
export type Vector3 = [number, number, number]
export type Vector4 = [number, number, number, number]

export const Vector2 = {
  new(x: number, y: number) { return [x, y] satisfies Vector2 },
}

export const Vector3 = {
  new(x: number, y: number, z: number) { return [x, y, z] satisfies Vector3 },
}

export const Vector4 = {
  new(x: number, y: number, z: number, w: number) { return [x, y, z, w] satisfies Vector4 },
}

export function vec2(x: number, y: number) { return Vector2.new(x, y) }
export function vec3(x: number, y: number, z: number) { return Vector3.new(x, y, z) }
export function vec4(x: number, y: number, z: number, w: number) { return Vector4.new(x, y, z, w) }