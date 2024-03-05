export const calculateHowManyObjectFit = (width: number, objectWidth: number, gap: number = 0) => {
    let stop = false
    let supposedWidth = 0
    let count = 0
    while (!stop) {
        const currentMaxWidth = objectWidth * (count + 1) + count * gap
        if (currentMaxWidth <= width) {
            count += 1
            supposedWidth = currentMaxWidth
        }
        else stop = true
    }
    return {
        count,
        supposedWidth,
    }

}
