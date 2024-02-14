import './style.css'

export const Loader = (props: { state?: boolean }) => {
    if (props.state === false)
        return null
    return <div id="loader"></div>
}
