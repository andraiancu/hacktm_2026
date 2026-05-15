import { Await, createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { Suspense, useState } from 'react'

const personServerFn = createServerFn({ method: 'GET' })
  .inputValidator((d: string) => d)
  .handler(({ data: name }) => {
    return { name, randomNumber: Math.floor(Math.random() * 100) }
  })

const slowServerFn = createServerFn({ method: 'GET' })
  .inputValidator((d: string) => d)
  .handler(async ({ data: name }) => {
    await new Promise((r) => setTimeout(r, 1000))
    return { name, randomNumber: Math.floor(Math.random() * 100) }
  })

export const Route = createFileRoute('/deferred')({
  loader: async () => {
    return {
      deferredStuff: new Promise<string>((r) =>
        setTimeout(() => r('Hello deferred!'), 2000),
      ),
      deferredPerson: slowServerFn({ data: 'Tanner Linsley' }),
      person: await personServerFn({ data: 'John Doe' }),
    }
  },
  component: Deferred,
})

function Deferred() {
  const [count, setCount] = useState(0)
  const { deferredStuff, deferredPerson, person } = Route.useLoaderData()

  return (
    <div className="min-h-screen bg-bg-main px-6 py-16 text-text-secondary">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-bg-card/85 p-6 backdrop-blur-md md:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-accent-lime">Deferred</p>
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-white/10 bg-bg-secondary/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Regular person</p>
            <div className="mt-2 text-text-primary" data-testid="regular-person">
              {person.name} - {person.randomNumber}
            </div>
          </div>
          <Suspense fallback={<div className="rounded-xl border border-white/10 bg-bg-secondary/70 p-4 text-text-muted">Loading person...</div>}>
            <Await
              promise={deferredPerson}
              children={(data) => (
                <div className="rounded-xl border border-white/10 bg-bg-secondary/70 p-4" data-testid="deferred-person">
                  <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Deferred person</p>
                  <div className="mt-2 text-text-primary">
                    {data.name} - {data.randomNumber}
                  </div>
                </div>
              )}
            />
          </Suspense>
          <Suspense fallback={<div className="rounded-xl border border-white/10 bg-bg-secondary/70 p-4 text-text-muted">Loading stuff...</div>}>
            <Await
              promise={deferredStuff}
              children={(data) => (
                <div className="rounded-xl border border-white/10 bg-bg-secondary/70 p-4 text-text-primary" data-testid="deferred-stuff">
                  {data}
                </div>
              )}
            />
          </Suspense>
          <div className="rounded-xl border border-white/10 bg-bg-secondary/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">Count</p>
            <div className="mt-2 text-text-primary">{count}</div>
          </div>
          <button
            onClick={() => setCount(count + 1)}
            className="rounded-xl border border-border-strong/70 bg-accent-lime px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-bg-deep transition-colors hover:bg-accent-lime-soft"
          >
            Increment
          </button>
        </div>
      </div>
    </div>
  )
}
