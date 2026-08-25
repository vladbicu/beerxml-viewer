import { useRef, useState } from 'react'

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
      <p className="eyebrow mb-4">BeerXML Viewer</p>
      <h1 className="font-display mb-3 text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] font-semibold">
        Fișa de rețetă,
        <br />
        pe ecran mare.
      </h1>
      <p className="text-cream-dim mb-10 max-w-[36ch] text-[1.15rem]">
        Încarcă un export BeerXML din Grainfather, Brewfather sau BeerSmith. Totul rămâne în browser
        — nimic nu se trimite nicăieri.
      </p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`panel flex w-full cursor-pointer flex-col items-center gap-3 px-8 py-16 text-center transition-colors ${
          dragging ? 'border-copper-bright bg-oak-high' : ''
        }`}
      >
        <span className="text-copper-bright text-[2.5rem] leading-none">↓</span>
        <span className="text-[1.3rem] font-semibold">Trage fișierul aici</span>
        <span className="text-cream-dim text-[1rem]">sau apasă pentru a-l alege</span>
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
