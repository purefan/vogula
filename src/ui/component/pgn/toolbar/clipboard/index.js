import moves from '../../moves'
import Board from '../../../board/chessground'
import modal from '../../../../../lib/modal.js'
import './index.scss'

const Clipboard = {
    show,
    state: 'hidden',
    content: m('div.pgn_toolbar_clipboard', {}, [
        m('label', { for: 'clipboard_textarea' }, 'Paste the PGN or the FEN in the text box below:'),
        m('textarea', {
            id: 'clipboard_textarea',
            onchange: e => Clipboard.data = e.target.value
        }),
        m('div.actions', [
            m('button', { onclick: () => import_pgn() }, 'Copy from text box to the board'),
            m('button', { onclick: fen_to_clipboard }, 'Copy position to clipboard'),
            m('button', 'Copy game to clipboard')
        ])
    ])
}

/**
 * Displays the overlay and
 */
function show() {
    Clipboard.state = 'visible'
    modal.content = Clipboard.content
    modal.state = 'visible'
}

function fen_to_clipboard() {
    navigator.clipboard.writeText(Board.chessjs.fen())
}

function import_pgn() {
    moves.import_pgn(Clipboard.data)
    Clipboard.state = 'hidden'
}

export default Clipboard
