export type Point = { x: number; y: number };

export type PathCommand =
  | { op: 'M' | 'L'; to: Point }
  | { op: 'Q'; c: Point; to: Point }
  | { op: 'C'; c1: Point; c2: Point; to: Point }
  | { op: 'Z' };

export type Affine = { origin: Point; u: Point; v: Point };

export function fmt(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  return String(rounded === 0 ? 0 : rounded);
}

function applyAffine(point: Point, affine: Affine): Point {
  return {
    x: affine.origin.x + point.x * affine.u.x + point.y * affine.v.x,
    y: affine.origin.y + point.x * affine.u.y + point.y * affine.v.y,
  };
}

function transformCommand(command: PathCommand, affine: Affine): PathCommand {
  switch (command.op) {
    case 'M':
    case 'L':
      return { op: command.op, to: applyAffine(command.to, affine) };
    case 'Q':
      return { op: 'Q', c: applyAffine(command.c, affine), to: applyAffine(command.to, affine) };
    case 'C':
      return {
        op: 'C',
        c1: applyAffine(command.c1, affine),
        c2: applyAffine(command.c2, affine),
        to: applyAffine(command.to, affine),
      };
    case 'Z':
      return command;
  }
}

export function transformCommands(commands: PathCommand[], affine: Affine): PathCommand[] {
  return commands.map((command) => transformCommand(command, affine));
}

function points(...list: Point[]): string {
  return list.map((point) => `${fmt(point.x)} ${fmt(point.y)}`).join(' ');
}

function commandData(command: PathCommand): string {
  switch (command.op) {
    case 'M':
    case 'L':
      return `${command.op}${points(command.to)}`;
    case 'Q':
      return `Q${points(command.c, command.to)}`;
    case 'C':
      return `C${points(command.c1, command.c2, command.to)}`;
    case 'Z':
      return 'Z';
  }
}

export function toPathData(commands: PathCommand[]): string {
  return commands.map(commandData).join('');
}

export function polygonCommands(vertices: Point[]): PathCommand[] {
  return [
    ...vertices.map((to, index): PathCommand => ({ op: index === 0 ? 'M' : 'L', to })),
    { op: 'Z' },
  ];
}

export function rectCommands(x: number, y: number, w: number, h: number): PathCommand[] {
  return polygonCommands([
    { x, y },
    { x: x + w, y },
    { x: x + w, y: y + h },
    { x, y: y + h },
  ]);
}

export function roundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  if (radius === 0) {
    return toPathData(rectCommands(x, y, w, h));
  }

  const arc = (to: Point) => `A${fmt(radius)} ${fmt(radius)} 0 0 1 ${points(to)}`;
  return [
    `M${points({ x: x + radius, y })}`,
    `L${points({ x: x + w - radius, y })}`,
    arc({ x: x + w, y: y + radius }),
    `L${points({ x: x + w, y: y + h - radius })}`,
    arc({ x: x + w - radius, y: y + h }),
    `L${points({ x: x + radius, y: y + h })}`,
    arc({ x, y: y + h - radius }),
    `L${points({ x, y: y + radius })}`,
    arc({ x: x + radius, y }),
    'Z',
  ].join('');
}
