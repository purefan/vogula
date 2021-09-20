import clipboard from './clipboard/index.js'
import Moves from '../moves/index.js'
import headers from '../headers/index.js'
import Board from '../../board/chessground/index.js'

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
    headers.set_headers(headers.make_default_headers())
    m.redraw()
}

export default pgn_toolbar
