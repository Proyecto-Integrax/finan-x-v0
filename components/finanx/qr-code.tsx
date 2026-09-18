import { cn } from "@/lib/utils"

/**
 * Deterministic decorative QR-style matrix rendered from a seed string.
 * Includes the three finder patterns so it reads as a real verification code
 * without pulling in a QR dependency for a mockup.
 */
export function QrCode({
  value,
  size = 96,
  className,
}: {
  value: string
  size?: number
  className?: string
}) {
  const cells = 25
  const modules: boolean[] = []

  // Hash the seed into a repeatable bit stream.
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  let s = h >>> 0
  const nextBit = () => {
    s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff
    return (s >> 16) % 2 === 0
  }

  const isFinder = (r: number, c: number) => {
    const inBox = (br: number, bc: number) =>
      r >= br && r < br + 7 && c >= bc && c < bc + 7
    return inBox(0, 0) || inBox(0, cells - 7) || inBox(cells - 7, 0)
  }

  const finderFilled = (r: number, c: number) => {
    const local = (br: number, bc: number) => {
      const rr = r - br
      const cc = c - bc
      const edge = rr === 0 || rr === 6 || cc === 0 || cc === 6
      const core = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4
      return edge || core
    }
    if (r < 7 && c < 7) return local(0, 0)
    if (r < 7 && c >= cells - 7) return local(0, cells - 7)
    if (r >= cells - 7 && c < 7) return local(cells - 7, 0)
    return false
  }

  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if (isFinder(r, c)) {
        modules.push(finderFilled(r, c))
      } else if (
        (r === 7 && c < 8) ||
        (c === 7 && r < 8) ||
        (r === 7 && c >= cells - 8) ||
        (c === cells - 8 && r < 8) ||
        (r === cells - 8 && c < 8) ||
        (c === 7 && r >= cells - 8)
      ) {
        modules.push(false)
      } else {
        modules.push(nextBit())
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${cells} ${cells}`}
      className={cn("rounded-sm", className)}
      role="img"
      aria-label={`Código de verificación ${value.slice(0, 8)}`}
      shapeRendering="crispEdges"
    >
      <rect x={0} y={0} width={cells} height={cells} fill="#ffffff" />
      {modules.map((on, i) =>
        on ? (
          <rect
            key={i}
            x={i % cells}
            y={Math.floor(i / cells)}
            width={1}
            height={1}
            fill="#0f172a"
          />
        ) : null,
      )}
    </svg>
  )
}
