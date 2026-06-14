// Column-highlight overlay — absolutely positioned inside TabBar container.
// Uses CSS animation for 1s blink cycle.
interface Props {
  left: number
  top: number
  width: number
  height: number
}

export function TabCursor({ left, top, width, height }: Props) {
  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{ left, top, width, height }}
      aria-hidden
    >
      <div
        className="w-full h-full rounded-sm"
        style={{
          backgroundColor: 'rgba(99, 102, 241, 0.22)',
          animation: 'tab-cursor-blink 1s step-end infinite',
        }}
      />
    </div>
  )
}
