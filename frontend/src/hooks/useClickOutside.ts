import { useEventListener } from '.'

export const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  callback: (event: Event) => void,
): void => {
  useEventListener(
    'click',
    e => {
      if (ref.current === null || ref.current.contains(e.target as Node)) return
      callback(e)
    },
    window,
  )
}
