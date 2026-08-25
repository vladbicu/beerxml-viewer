import { useRef, useState } from 'react'
import { Mark } from './Mark'

interface UploadZoneProps {
  onFile: (file: File) => void
  errors: string[]
}

export function UploadZone({ onFile, errors }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) onFile(file)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[900px] flex-col justify-center px-6 py-16">
      {/* The empty kettle: the same mark, unfilled and dimmed to the faint
          tier. No arrow — the level line already points at the horizontal. */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`bg-oak border-line flex w-full cursor-pointer flex-col items-center gap-11 rounded border px-8 py-24 text-center transition-colors ${
          dragging ? 'border-copper-bright bg-oak-raised' : ''
        }`}
      >
        <span className="h-[132px] w-[132px] opacity-55">
          <Mark ink={dragging ? 'var(--copper-bright)' : 'var(--cream-faint)'} fill="none" />
        </span>

        <span className="flex flex-col items-center gap-3">
          <span className="display-title text-[clamp(2rem,4vw,2.75rem)] leading-tight">
            Cazanul e gol
          </span>
          <span className="text-cream-dim text-[1.15rem]">Trage un fișier BeerXML aici</span>
        </span>

        <span className="bg-line-strong h-px w-[180px]" />

        <span className="num text-cream-faint text-[0.85rem] tracking-[0.1em] uppercase">
          .xml · Grainfather · Brewfather · BeerSmith
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".xml,text/xml,application/xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          // Reset so picking the same file twice in a row still fires onChange.
          e.target.value = ''
        }}
      />

      <p className="text-cream-faint mt-8 text-center text-[0.95rem]">
        Totul rămâne în browser — nimic nu se trimite nicăieri.
      </p>

      {errors.length > 0 && (
        <div
          role="alert"
          className="mt-8 rounded border border-[rgba(220,90,60,0.4)] bg-[rgba(220,90,60,0.08)] px-6 py-5"
        >
          <p className="mb-2 text-[1.05rem] font-semibold text-[#e8896b]">
            Fișierul nu a putut fi încărcat
          </p>
          <ul className="text-cream-dim space-y-1 text-[1rem]">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
