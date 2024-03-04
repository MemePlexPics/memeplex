export const getXPosition = (event: MouseEvent | TouchEvent) => {
    return event instanceof MouseEvent
        ? event.pageX
        : event.touches[0].pageX
}
