import { useState } from "react"
import { Button, Input } from ".."

import './style.css'

export const MemeSearchForm = (props: {
    query: string
    onUpdate: (query: string) => void
}) => {
    const [query, setQuery] = useState(props.query)

    const onClickSearch = () => props.onUpdate(query)

    const onChangeQuery = (event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)

    return (
        <div id="search-container">
            <Input
                className="input"
                type="text"
                placeholder="Search meme images by caption"
                value={query}
                onChange={onChangeQuery}
                onPressEnter={onClickSearch}
            />
            <Button
                value="Search"
                onClick={onClickSearch}
            />
        </div>
    )
}
