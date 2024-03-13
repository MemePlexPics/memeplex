import stylex from '@stylexjs/stylex'

export const applyClassNameToStyleX = (
  xstyle: ReturnType<typeof stylex.props>,
  className?: string,
) => {
  return {
    className: `${className} ${xstyle.className}`,
    style: xstyle.style,
  }
}
