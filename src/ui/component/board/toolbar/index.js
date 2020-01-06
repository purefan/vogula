const m = require('mithril')
const Board = require('../chessground')
const Moves = require('../../pgn/moves')
const toolbar = {
    oninit: () => {
        document.onkeydown = e => {
            e.preventDefault()
            if (e.keyCode == 39) {
                move_forwards()
            }
            if (e.keyCode == 37) {
                move_backwards()
            }
        }
    },
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

/**
 * Moves backwards one move and syncs the chessground configuration
 * it is triggered by pressing a key or clicking on a button
 */
function move_backwards() {
    if (Moves.move_list.move_backward()) {
        Board.chessjs.load(Moves.move_list.current_fen)
        Board.sync()
        Moves.move_list.update_vnodes()
    }
}

/**
 * Moves forwards one move and syncs the chessground configuration
 * it is triggered by pressing a key or clicking on a button
 */
function move_forwards() {
    if (Moves.move_list.move_forward()) {
        Board.chessjs.load(Moves.move_list.current_fen)
        Board.sync()
        Moves.move_list.update_vnodes()
    }
}
module.exports = toolbar