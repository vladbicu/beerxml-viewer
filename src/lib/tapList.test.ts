import { expect, it } from 'vitest'
import { moveTap, parseStoredTaps, type Tap, tapsFromRecipes } from './tapList'
import type { Recipe } from './types'

const recipe = (name: string): Recipe =>
  ({
    name,
    type: 'All Grain',
    brewer: '',
    date: '',
    batchSize: 20,
    boilSize: null,
    boilTime: 60,
    efficiency: null,
    og: 1.05,
    fg: 1.01,
    abv: 5.25,
    ibu: 30,
    ibuMethod: '',
    color: 8,
    calories: null,
    notes: '',
    style: null,
    fermentables: [],
    hops: [],
    yeasts: [],
    miscs: [],
    mashSteps: [],
    mashName: '',
    fermentation: null,
  }) satisfies Recipe

const tap = (id: string, name = id): Tap => ({ id, recipe: recipe(name), addedAt: 0 })

it('wraps every recipe in a tap, duplicates included', () => {
  const taps = tapsFromRecipes([recipe('Saison'), recipe('Saison')], ['a', 'b'], 111)
  expect(taps).toHaveLength(2)
  expect(taps.map((t) => t.id)).toEqual(['a', 'b'])
  expect(taps.every((t) => t.addedAt === 111)).toBe(true)
})

it('falls back to a synthetic id when the pool runs short', () => {
  const taps = tapsFromRecipes([recipe('A'), recipe('B')], ['only-one'], 5)
  expect(taps[0]!.id).toBe('only-one')
  expect(taps[1]!.id).toBe('5-1')
})

it('moveTap reorders immutably and ignores out-of-range indices', () => {
  const taps = [tap('a'), tap('b'), tap('c')]
  expect(moveTap(taps, 0, 2).map((t) => t.id)).toEqual(['b', 'c', 'a'])
  expect(moveTap(taps, 2, 0).map((t) => t.id)).toEqual(['c', 'a', 'b'])
  expect(moveTap(taps, 1, 1)).toBe(taps)
  expect(moveTap(taps, 0, 9)).toBe(taps)
  expect(taps.map((t) => t.id)).toEqual(['a', 'b', 'c'])
})

it('parseStoredTaps round-trips a real board', () => {
  const taps = [tap('a', 'Helles'), tap('b', 'Dunkel')]
  expect(parseStoredTaps(JSON.stringify(taps))).toEqual(taps)
})

it('parseStoredTaps returns an empty board for anything malformed', () => {
  expect(parseStoredTaps(null)).toEqual([])
  expect(parseStoredTaps('')).toEqual([])
  expect(parseStoredTaps('not json')).toEqual([])
  expect(parseStoredTaps('{"not":"an array"}')).toEqual([])
  expect(parseStoredTaps('[{"id":"a"}]')).toEqual([])
  expect(parseStoredTaps('[{"id":1,"addedAt":0,"recipe":{"name":"x"}}]')).toEqual([])
})

it('parseStoredTaps drops only the bad entries', () => {
  const good = tap('a', 'Kölsch')
  const raw = JSON.stringify([good, { id: 'b', addedAt: 0, recipe: { style: 'x' } }])
  expect(parseStoredTaps(raw)).toEqual([good])
})
