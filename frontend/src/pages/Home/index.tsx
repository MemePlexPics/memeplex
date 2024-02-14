
import { useState } from "react"
import { Loader, MemeSearchForm, MemeSearchResults } from "../../components"
import { useMemes } from "./hooks/useMemes"
import './style.css'

export const Home = () => {
    const [query, setQuery] = useState('')
    const data = useMemes(query)

    return (
        <>
            <MemeSearchForm onUpdate={(query) => setQuery(query)} />
            {data?.memes.length !== 0
                ? <MemeSearchResults memes={data.memes} />
                : <p className='nothing-found'>Nothing found</p>
            }
            {data.isError
                ? <p className='error-response'>An error occurred, please try again later</p>
                : null
            }
            <Loader state={data.isLoading} />
        </>
    )
}
