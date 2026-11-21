// Tarima isométrica de 2x2 cajas en 3 niveles, con una caja resaltada (escaneada)
const S = 60; // altura de la caja
const DX = 52;
const DY = 30;

function Cube({ x, y, hot = false }: { x: number; y: number; hot?: boolean }) {
  const top = `M${x},${y} L${x + DX},${y + DY} L${x},${y + 2 * DY} L${x - DX},${y + DY} Z`;
  const left = `M${x - DX},${y + DY} L${x},${y + 2 * DY} L${x},${y + 2 * DY + S} L${x - DX},${y + DY + S} Z`;
  const right = `M${x},${y + 2 * DY} L${x + DX},${y + DY} L${x + DX},${y + DY + S} L${x},${y + 2 * DY + S} Z`;

  return (
    <g strokeLinejoin="round" strokeWidth={hot ? 1.6 : 1} stroke={hot ? "#ff8a3d" : "rgba(255,255,255,0.16)"}>
      <path d={left} fill={hot ? "#a83a00" : "#0e1427"} />
      <path d={right} fill={hot ? "#d44a00" : "#141b33"} />
      <path d={top} fill={hot ? "#ff5a00" : "#1a2340"} />
    </g>
  );
}

export default function PalletIllustration({ className = "" }: { className?: string }) {
  const cubes: { key: string; x: number; y: number; hot: boolean }[] = [];

  for (let layer = 0; layer < 3; layer++) {
    // Orden de atrás hacia adelante para que las caras se encimen bien
    for (const [i, j] of [[0, 0], [1, 0], [0, 1], [1, 1]] as const) {
      cubes.push({
        key: `${layer}-${i}-${j}`,
        x: (i - j) * DX,
        y: (i + j) * DY + (2 - layer) * S,
        hot: layer === 2 && i === 1 && j === 0,
      });
    }
  }

  const stroke = "rgba(255,255,255,0.16)";

  return (
    <svg
      viewBox="-130 -8 260 346"
      className={className}
      role="img"
      aria-label="Tarima de cajas"
      xmlns="http://www.w3.org/2000/svg"
    >
      <ellipse cx="0" cy="316" rx="125" ry="16" fill="rgba(255,90,0,0.10)" />

      {/* Base de la tarima */}
      <g strokeLinejoin="round" stroke={stroke}>
        <path d="M-104,240 L0,300 L0,314 L-104,254 Z" fill="#0e1427" />
        <path d="M0,300 L104,240 L104,254 L0,314 Z" fill="#141b33" />
        <path d="M0,180 L104,240 L0,300 L-104,240 Z" fill="#1a2340" />
      </g>

      {cubes.map((c) => (
        <Cube key={c.key} x={c.x} y={c.y} hot={c.hot} />
      ))}
    </svg>
  );
}