import stylex from '@stylexjs/stylex'

import { useEffect, useState } from 'react'

import { s } from './style'

export const Tabs = (props: {
  tabs: string[]
  children?: React.ReactElement[]
  onChange?: (tab: (typeof props)['tabs'][number]) => unknown
}) => {
  type TTab = (typeof props)['tabs'][number]
  const [currentTab, setCurrentTab] = useState<TTab>(props.tabs[0])

  const onChangeTab = (tab: TTab) => {
    setCurrentTab(tab)
    props.onChange?.(tab)
  }

  useEffect(() => {
    setCurrentTab(props.tabs[0])
  }, [props.tabs])

  return (
    <div>
      <div {...stylex.props(s.tabs)}>
        {props.tabs.map(tab => (
          <div
            key={tab}
            {...stylex.props(s.tab, currentTab === tab ? s.isActive : null)}
            onClick={() => {
              onChangeTab(tab)
            }}
          >
            {tab}
          </div>
        ))}
      </div>
      <div>
        {props.children?.map(element => ({
          ...element,
          props: {
            ...element.props,
            ...stylex.props(element.key === currentTab ? s.isActiveContent : s.tabContent),
          },
        }))}
      </div>
    </div>
  )
}
