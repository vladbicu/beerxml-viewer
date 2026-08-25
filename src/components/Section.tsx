interface SectionProps {
  title: string
  aside?: string
  children: React.ReactNode
}

export function Section({ title, aside, children }: SectionProps) {
  return (
    <section className="border-line border-t px-7 py-9 sm:px-10">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="section-title">{title}</h2>
        {aside && <span className="text-cream-faint num text-[0.95rem]">{aside}</span>}
      </header>
      {children}
    </section>
  )
}
