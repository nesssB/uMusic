// The player bar's like buttons keep the track's rating in their
// `like-status` attribute, as LIKE, DISLIKE or INDIFFERENT. Only a like
// counts here, so a dislike reads as not liked.
// Returns null when the attribute is missing or has a value it does not know.
export function parseLikeAttribute(value: string | null): boolean | null {
  switch (value) {
    case 'LIKE':
      return true
    case 'DISLIKE':
    case 'INDIFFERENT':
      return false
    default:
      return null
  }
}
