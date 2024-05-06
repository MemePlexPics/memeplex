export type TSessionInMemory = Record<
number,
{
  debounce?: NodeJS.Timeout
  abortController?: AbortController
}
>
