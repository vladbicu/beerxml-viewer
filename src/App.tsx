import { useState } from 'react'
import { RecipeTicket } from './components/RecipeTicket'
import { UploadZone } from './components/UploadZone'
import { parseBeerXML, readRecipeFile } from './lib/parseBeerXML'
import type { Recipe } from './lib/types'
import { useWakeLock } from './lib/useWakeLock'

export default function App() {
  // One file at a time — no library, no tabs, nothing persisted across reloads.
  const [recipes, setRecipes] = useState<Recipe[] | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [index, setIndex] = useState(0)

  useWakeLock(recipes !== null)

  const handleFile = async (file: File) => {
    try {
      const { recipes: parsed, errors: parseErrors } = parseBeerXML(await readRecipeFile(file))

      if (parsed.length === 0) {
        setRecipes(null)
        setErrors(parseErrors.length > 0 ? parseErrors : ['Fișierul nu conține nicio rețetă.'])
        return
      }

      // A batch export with one bad recipe still shows every good sibling.
      setRecipes(parsed)
      setErrors(parseErrors)
      setIndex(0)
    } catch (err) {
      setRecipes(null)
      setErrors([`Fișierul nu a putut fi citit: ${err instanceof Error ? err.message : err}`])
    }
  }

  const reset = () => {
    setRecipes(null)
    setErrors([])
    setIndex(0)
  }

  if (recipes === null) {
    return <UploadZone onFile={handleFile} errors={errors} />
  }

  const recipe = recipes[index] ?? recipes[0]!

  return (
    <>
      {errors.length > 0 && (
        <div role="alert" className="mx-auto max-w-[1200px] px-4 pt-8 sm:px-8">
          <div className="rounded border border-[rgba(220,90,60,0.4)] bg-[rgba(220,90,60,0.08)] px-6 py-4">
            <ul className="space-y-1 text-[1rem] text-[#e8896b]">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <RecipeTicket
        recipe={recipe}
        onReset={reset}
        position={
          recipes.length > 1
            ? {
                index,
                total: recipes.length,
                onNext: () => setIndex((i) => (i + 1) % recipes.length),
              }
            : null
        }
      />
    </>
  )
}
