import chessground from './chessground/index.js'
import toolbar from './toolbar/index.js'

export default {
    chessground,
    toolbar,
    config: {
        oncreate: vnode => {
            vnode.dom.addEventListener('wheel', event => {
                if (event.deltaY > 0) {
                    toolbar.move_forwards()
                } else {
                    toolbar.move_backwards()
                }
            }, { passive: true })
        }
    }
}