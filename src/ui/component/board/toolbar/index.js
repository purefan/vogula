const m = require('mithril')
const Board = require('../chessground')
require('./index.scss')
const toolbar = {
    view: () => [
        m('button', { onclick: () => toggle_orientation() }, 'Flip')
    ]
}

function toggle_orientation() {
    Board.chessground.toggleOrientation()
    localStorage.setItem('board.orientation', Board.chessground.state.orientation)
}
module.exports = toolbar