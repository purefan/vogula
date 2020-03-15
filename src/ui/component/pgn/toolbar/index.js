const m = require('mithril')
const clipboard = require('./clipboard')
const Moves = require('../moves')
const headers = require('../headers')
const Board = require('../../board/chessground')

const pgn_toolbar = {
    view: () => [
        m('button.toolbar-item', {
            onclick: new_game,
            title: 'Clear moves and headers'
        }, 'Clear'),
        m('button.toolbar-item', {
            onclick: () => clipboard.show()
            , title: 'Copy to and from Clipboard'
        }, 'Clipboard')
    ]
}

function new_game() {
    Moves.move_list.reset()
    Board.chessjs.load(Moves.move_list.current_fen)
    Board.sync()
    headers.data(headers.make_default_headers())
    m.redraw()
}

module.exports = pgn_toolbar