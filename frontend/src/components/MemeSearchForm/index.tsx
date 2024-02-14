import { useState } from "react"
import { Input } from ".."

export const MemeSearchForm = (props: { onUpdate: (query: string) => void }) => {
    const [query, setQuery] = useState('')

    const onClickSearch = () => props.onUpdate(query)

    const onChangeQuery = (event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return
        onClickSearch()
    }

    return (
        <div id="search-container">
            <Input
                className="input"
                type="text"
                placeholder="Search meme images by caption"
                value={query}
                onChange={onChangeQuery}
                onKeyDown={onKeyDown}
            />
            <Input
                className="button"
                type="button"
                value="Search"
                onClick={onClickSearch}
            />
        </div>
    )
}
