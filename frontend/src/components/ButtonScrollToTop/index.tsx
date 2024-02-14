import './style.css'

export const ButtonScrollToTop = () => (
    <button
        id="scroll-to-top"
        title="Go to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >^</button>
)
