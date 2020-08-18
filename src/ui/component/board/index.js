const chessground = require('./chessground')
const toolbar = require('./toolbar')

module.exports = {
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
            })
        }
    }
}