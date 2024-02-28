export const setMetaProperty = (name: string, content: string) => {
    let tag = document.querySelector(`meta[property="${name}"]`)
    if (!tag) {
        const head = document.getElementsByTagName('head')[0]
        tag = document.createElement('meta')
        tag.setAttribute('property', name);
        head.appendChild(tag)
    }
    tag.setAttribute('content', content);
}
