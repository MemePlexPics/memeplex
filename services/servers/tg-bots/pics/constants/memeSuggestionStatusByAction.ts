import { EMemeSuggestionCallback } from '.'

export const memeSuggestionStatusByAction = {
  [EMemeSuggestionCallback.APPROVE]: 'approved',
  [EMemeSuggestionCallback.APPROVE_WITHOUT_TEXT]: 'approved',
  [EMemeSuggestionCallback.DECLINE]: 'declined',
} as const
