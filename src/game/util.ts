export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function multisetEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  const map = new Map<T, number>();
  a.forEach((x) => map.set(x, (map.get(x) ?? 0) + 1));
  for (const x of b) {
    const c = map.get(x);
    if (!c) return false;
    map.set(x, c - 1);
  }
  return true;
}
