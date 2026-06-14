import type { TabBar as TabBarType, TabNote as TabNoteType, TabCursor } from '@/types/tab'
import { BEATS_PER_BAR, getStringCount, getStringNames, isColumnInSelection, GRID_RES, type TabSelection } from '@/lib/tabUtils'
import { TabNote } from './TabNote'
import { TabCursor as TabCursorOverlay } from './TabCursor'

// Grid constants
const COL_W     = 24   // px per 16th-note column
const ROW_H     = 30   // px per string row
const LABEL_W   = 24   // px for string name label
const BARLINE_W = 6    // px for right barline
const HEADER_H  = 18   // px for bar number header

interface Props {
  bar: TabBarType
  barIndex: number
  cursor: TabCursor
  instrument: 'guitar' | 'bass'
  selection: TabSelection | null
  onCursorChange: (c: TabCursor) => void
}

function buildNoteGrid(bar: TabBarType, nStrings: number, nCols: number): Record<string, TabNoteType> {
  const grid: Record<string, TabNoteType> = {}
  for (const note of bar.notes) {
    if (note.string < 1 || note.string > nStrings) continue
    const col = Math.round(note.beatPosition / GRID_RES)
    if (col >= 0 && col < nCols) {
      grid[`${note.string}-${col}`] = note
    }
  }
  return grid
}

export function TabBar({ bar, barIndex, cursor, instrument, selection, onCursorChange }: Props) {
  const nStrings   = getStringCount(instrument)
  const stringNames = getStringNames(instrument)
  const bpb        = BEATS_PER_BAR[bar.timeSignature]
  const nCols      = Math.round(bpb / GRID_RES)
  const noteGrid   = buildNoteGrid(bar, nStrings, nCols)

  const isCursorBar = cursor.barIndex === barIndex
  const cursorCol   = isCursorBar ? Math.round(cursor.beatPosition / GRID_RES) : -1

  const totalW = LABEL_W + nCols * COL_W + BARLINE_W
  const totalH = HEADER_H + nStrings * ROW_H

  return (
    <div
      className="relative shrink-0 select-none"
      style={{ width: totalW, height: totalH }}
    >
      {/* Bar number */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center text-[10px] font-mono text-muted"
        style={{ height: HEADER_H, paddingLeft: LABEL_W }}
      >
        {bar.barNumber}
      </div>

      {/* Cursor column overlay */}
      {isCursorBar && cursorCol >= 0 && cursorCol < nCols && (
        <TabCursorOverlay
          left={LABEL_W + cursorCol * COL_W}
          top={HEADER_H}
          width={COL_W}
          height={nStrings * ROW_H}
        />
      )}

      {/* Active string within cursor column */}
      {isCursorBar && cursorCol >= 0 && cursorCol < nCols && (
        <div
          className="absolute z-20 rounded-sm pointer-events-none"
          style={{
            left: LABEL_W + cursorCol * COL_W,
            top:  HEADER_H + (cursor.string - 1) * ROW_H,
            width: COL_W,
            height: ROW_H,
            backgroundColor: 'rgba(99, 102, 241, 0.4)',
          }}
        />
      )}

      {/* String rows */}
      {Array.from({ length: nStrings }, (_, sIdx) => {
        const strNum  = sIdx + 1
        const strName = stringNames[sIdx]
        const rowTop  = HEADER_H + sIdx * ROW_H

        return (
          <div
            key={sIdx}
            className="absolute flex"
            style={{ top: rowTop, left: 0, width: totalW, height: ROW_H }}
          >
            {/* String label */}
            <div
              className="flex items-center justify-end pr-1 shrink-0 font-mono text-[11px] text-muted"
              style={{ width: LABEL_W, height: ROW_H }}
            >
              {strName}
            </div>

            {/* Note cells */}
            {Array.from({ length: nCols }, (_, cIdx) => {
              const beatPos    = +(cIdx * GRID_RES).toFixed(4)
              const isBeat     = cIdx % 4 === 0
              const note       = noteGrid[`${strNum}-${cIdx}`]
              const isActiveCursorCell = isCursorBar && cIdx === cursorCol && strNum === cursor.string
              const isSelected = selection
                ? isColumnInSelection(barIndex, cIdx, selection, bpb)
                : false

              return (
                <div
                  key={cIdx}
                  className="relative flex items-center justify-center shrink-0 cursor-pointer hover:bg-indigo-500/10 transition-colors"
                  style={{
                    width: COL_W,
                    height: ROW_H,
                    borderLeft:   isBeat ? '1px solid rgba(148,163,184,0.2)' : undefined,
                    borderBottom: '1px solid rgba(148,163,184,0.15)',
                    backgroundColor: isSelected ? 'rgba(99,102,241,0.18)' : undefined,
                  }}
                  onClick={() =>
                    onCursorChange({ barIndex, string: strNum, beatPosition: beatPos })
                  }
                >
                  {note ? (
                    <TabNote
                      note={note}
                      instrument={instrument}
                      isActive={isActiveCursorCell}
                      isSelected={isSelected}
                    />
                  ) : (
                    <span className="text-[10px] font-mono text-slate-600 dark:text-slate-700 select-none">
                      {isBeat ? '-' : '·'}
                    </span>
                  )}
                </div>
              )
            })}

            {/* Right barline */}
            <div
              className="shrink-0 self-stretch border-l-2 border-slate-400 dark:border-slate-500"
              style={{ width: BARLINE_W }}
            />
          </div>
        )
      })}
    </div>
  )
}
