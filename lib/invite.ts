import { customAlphabet } from 'nanoid'

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const nanoid = customAlphabet(alphabet, 8)

export function createInviteCode() {
  return nanoid()
}
