import { describe, expect, it, vi } from 'vitest'

describe('tmdb fallback', () => {
  it('returns local results when TMDB_API_KEY is missing', async () => {
    vi.stubEnv('TMDB_API_KEY', '')
    const { searchMovies, getMovieDetails } = await import('@/lib/tmdb')
    const results = await searchMovies('interstelar')
    expect(results[0].id).toBe(157336)
    const movie = await getMovieDetails(157336)
    expect(movie.title).toBe('Interestelar')
  })

  it('returns related movies from the same local collection', async () => {
    vi.stubEnv('TMDB_API_KEY', '')
    vi.resetModules()
    const { searchMovies } = await import('@/lib/tmdb')
    const results = await searchMovies('Matrix')
    expect(results.map((movie) => movie.title)).toEqual(expect.arrayContaining(['Matrix', 'Matrix Reloaded', 'Matrix Revolutions', 'Matrix Resurrections', 'Animatrix']))
  })

  it('returns fast and furious fallback results for Portuguese franchise search', async () => {
    vi.stubEnv('TMDB_API_KEY', '')
    vi.resetModules()
    const { searchMovies } = await import('@/lib/tmdb')
    const results = await searchMovies('velozes e furiosos')
    expect(results.map((movie) => movie.title)).toEqual(expect.arrayContaining(['Velozes e Furiosos', '+ Velozes + Furiosos', 'Velozes & Furiosos 5: Operação Rio']))
    expect(results[0].title).not.toBe('Interestelar')
  })

  it('does not return unrelated fallback movies for unknown searches', async () => {
    vi.stubEnv('TMDB_API_KEY', '')
    vi.resetModules()
    const { searchMovies } = await import('@/lib/tmdb')
    const results = await searchMovies('zzzzzzzzzz')
    expect(results).toEqual([])
  })
})
