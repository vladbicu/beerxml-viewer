import { TapBoard } from './components/TapBoard'
import { TapUpload } from './components/TapUpload'
import { useTapList } from './lib/useTapList'
import { useTheme } from './lib/useTheme'
import { useWakeLock } from './lib/useWakeLock'

/**
 * The tap list page: upload several BeerXML files, keep them across reloads, and
 * show each beer with only the facts a taproom board carries. A separate HTML
 * entry (`robinete.html`) — there is no router.
 */
export function TapList() {
  const { theme, toggleTheme } = useTheme()
  const { taps, tapCount, setTapCount, errors, addFiles, remove, move, clear } = useTapList()

  // A TV behind the bar shouldn't dim mid-service.
  useWakeLock(taps.length > 0)

  if (taps.length === 0) {
    return (
      <TapUpload full onFiles={addFiles} errors={errors} theme={theme} onToggleTheme={toggleTheme} />
    )
  }

  return (
    <TapBoard
      taps={taps}
      tapCount={tapCount}
      onTapCountChange={setTapCount}
      errors={errors}
      onAdd={addFiles}
      onRemove={remove}
      onMove={move}
      onClear={clear}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  )
}
