export type TSessionInMemory = {
  debounce?: NodeJS.Timeout
  abortController?: AbortController
  suggestedMemeTextByMediaGroupId?: [media_group_id: string, text: string]
}
