const m = require('mithril')
const moves = require('../../moves')
const Board = require('../../../board/chessground')
require('./index.scss')

const Clipboard = {
    show,
    state: 'hidden',
    view: () => m('div.pgn_toolbar_clipboard', { class: `modal ${Clipboard.state}` }, m('div.modal-content', [
        m('button.close-modal', { onclick: e => Clipboard.state = 'hidden' }, 'Close'),
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
    ]))
}

/**
 * Displays the overlay and
 */
function show() {
    Clipboard.state = 'visible'
}

function fen_to_clipboard() {
    navigator.clipboard.writeText(Board.chessjs.fen())
}

function import_pgn() {
    moves.import_pgn(Clipboard.data)
    Clipboard.state = 'hidden'
}

module.exports = Clipboard