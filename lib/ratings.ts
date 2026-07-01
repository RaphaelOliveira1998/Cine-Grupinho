export function formatRatingStars(stars: number | null | undefined) {
  if (!stars) return 'Ainda não avaliou'
  return `${'★'.repeat(stars)}${'☆'.repeat(5 - stars)} ${stars}/5`
}
