const smoothScroll = (() => {

    const currentYPosition = () => self.pageYOffset ||
        (document.documentElement && document.documentElement.scrollTop) ||
        document.body.scrollTop

    const elementYPosition = (element) => {
        let positionY = element.offsetTop
        let target = element
        while (target.offsetParent && (node.offsetParent != document.body)) {
            target = target.offsetParent
            positionY += target.offsetTop
        }
    }

    return (element) => {
        const start = currentYPosition(),
              stop = elementYPosition(element),
              distance = Math.abs(start - stop)
        if (distance < 100) return scrollTo(0, stop)
        const speed = Math.min(Math.round(distance / 100), 20),
              step = Math.round(distance / 25)
        let leap = (stop > start) ? (start + step) : (start - step),
            timer = 0
        const scroll = () => {
            setTimeout(`scrollTo(0, ${leap})`, timer * speed)
        }
        if (stop > start) {
            for (let i = start;i < stop;i += step) {
                setTimeout(`scrollTo(0, ${leap})`, timer * speed)
                leap += step, timer++
                if (leap > stop) leap = stop
            }
        }
        for (let i = start;i > stop;i -= step) {
            setTimeout(`scrollTo(0, ${leap})`, timer * speed)
            leap -= step, timer++
            if (leap < stop) leap = stop
        }
    }

})()

export { smoothScroll }