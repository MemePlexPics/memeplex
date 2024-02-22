
import { useState } from "react"
import { Loader, MemeSearchForm, MemeSearchResults } from "../../components"
import { useMemes } from "./hooks/useMemes"
import './style.css'
import { useAtomValue } from "jotai"
import { pageOptionsAtom } from "../../store/atoms"

export const HomePage = () => {
    const [query, setQuery] = useState(useAtomValue(pageOptionsAtom).query)
    const data = useMemes(query)

    return (
        <>
            <MemeSearchForm query={query} onUpdate={(query) => setQuery(query)} />
            <Loader state={data.isLoading} overPage />
            {data.isLoaded && !data.memes.length
                ? <p className='nothing-found'>Nothing found</p>
                : data.memes.length
                    ? <MemeSearchResults memes={data.memes} />
                    : null
            }
            {data.isError
                ? <p className='error-response'>An error occurred, please try again later</p>
                : null
            }
        </>
    )
}
