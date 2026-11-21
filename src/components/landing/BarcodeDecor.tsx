// Código de barras decorativo con un haz de escaneo animado (solo adorno)
const PATTERN = [
  2, 1, 1, 3, 1, 2, 4, 1, 1, 2, 2, 1, 3, 1, 1, 4, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 2, 1, 1, 4, 1, 2,
  3, 1, 1, 2, 1, 3, 2, 1, 4, 1, 1, 2, 2, 1, 3, 1, 2, 1, 1, 4, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 4,
  1, 2, 1, 1, 3, 1, 2, 2, 1, 1, 3, 2, 1, 4, 1, 1, 2, 1, 3, 2,
];
const UNIT = 5;

const { bars, total } = (() => {
  let x = 0;
  const list: { x: number; w: number }[] = [];
  PATTERN.forEach((w, i) => {
    if (i % 2 === 0) list.push({ x, w: w * UNIT });
    x += w * UNIT;
  });
  return { bars: list, total: x };
})();

export default function BarcodeDecor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute hidden md:block"
      style={{
        right: "6%",
        top: "50%",
        transform: "translateY(-50%)",
        width: "min(44vw, 540px)",
        height: "min(42vh, 300px)",
      }}
    >
      <svg
        viewBox={`0 0 ${total} 100`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%", opacity: 0.13 }}
      >
        {bars.map((b) => (
          <rect key={b.x} x={b.x} y={0} width={b.w} height={100} fill="#ffffff" />
        ))}
      </svg>

      <div
        style={{
          position: "absolute",
          top: "-8%",
          bottom: "-8%",
          left: 0,
          width: 3,
          borderRadius: 2,
          background: "var(--brand)",
          boxShadow: "0 0 26px 7px rgba(255,90,0,0.5)",
          animation: "trazzo-scan 4.8s ease-in-out infinite",
        }}
      />
    </div>
  );
}