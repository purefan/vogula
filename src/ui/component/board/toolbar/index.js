const m = require('mithril')
const Board = require('../chessground')
const Moves = require('../../pgn/moves')
const toolbar = {
    view: () => [
        m('button.toolbar-item', { onclick: () => move_backwards() }, '<'),
        m('button.toolbar-item', { onclick: () => toggle_orientation() }, 'Flip'),
        m('button.toolbar-item', { onclick: () => move_forwards() }, '>')
    ]
}

function toggle_orientation() {
    Board.chessground.toggleOrientation()
    localStorage.setItem('board.orientation', Board.chessground.state.orientation)
}

function move_backwards() {
    if (Moves.move_list.move_backward()) {
        Board.chessjs.load(Moves.move_list.current_fen)
        Board.sync()
        Moves.move_list.update_vnodes()
    }
}

function move_forwards() {
    if (Moves.move_list.move_forward()) {
        Board.chessjs.load(Moves.move_list.current_fen)
        Board.sync()
        Moves.move_list.update_vnodes()
    }
}
module.exports = toolbar