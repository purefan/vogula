const Chessground = require("chessground").Chessground
const m = require('mithril')
const chessjs = require('chess.js')
const moves = require('../../pgn/moves')

require('./chessground.scss')
require('./theme.scss')
require('./index.scss')

/**
 * When making a move:
 * - First store the board state
 * - Then check if its a promotion
 * - --> If its a promotion: Display the alert and do nothing else.
 * - --> If its not a promo:
 */

const Board = {}

Board.config = {
    orientation: localStorage.getItem('board.orientation') || 'white',
    coordinates: true,
    autoCastle: true,
    turnColor: 'white',
    viewOnly: false,
    highlight: {
        lastMove: true
    },
    premovable: {
        enabled: false
    },
    movable: {
        free: false,
        color: 'white',
        showDests: true,
        events: {
            after: (src, dest, meta) => {
                Board.move_in_transit = {
                    src,
                    dest,
                    piece: Board.chessjs.get(src),
                    from: make_square_description(src),
                    to: make_square_description(dest)
                }
                if (is_promote({ src, dest })) {
                    // Updating the visual list of moves happens in promote
                    const promote = require('../promote')
                    promote.is_hidden = false
                    m.redraw()
                    return true
                }
                const move = Object.assign(
                    {},
                    Board.chessjs.move({ from: src, to: dest }),
                    { // the position in the .assign is important
                        fen: Board.chessjs.fen()
                    }
                )
                moves.make_move(move)
                if (move.flags == 'e') {
                    Board.sync()
                }
                console.log('[chessground] chessjs move', move)

                Board.chessground.set({
                    turnColor: Board.chessjs.turn() == 'b' ? 'black' : 'white',
                    movable: {
                        color: Board.chessjs.turn() == 'b' ? 'black' : 'white',
                        dests: Board.make_dests(Board.chessjs)
                    }
                })
            }
        }
    }
}

/**
 *
 * @param {String} square <col><row>
 */
function make_square_description(square) {
    const chessjs_square = Board.chessjs.get(square)
    return {
        piece: chessjs_square != null ? chessjs_square.type : null,
        piece_color: chessjs_square != null ? chessjs_square.color : null,
        col: square.charAt(0),
        col_number: square.charCodeAt(0) - 96, // A:1
        row: Number(square.charAt(1))
    }
}

function is_promote(param) {
    const piece = Board.chessjs.get(param.src)
    if (piece.type != 'p') { return false }
    if (piece.color == 'w' && Number(param.dest.charAt(1)) != 8) { return false }
    if (piece.color == 'b' && Number(param.dest.charAt(1)) != 1) { return false }
    return true
}

Board.make_dests = chess => {
    const dests = {}
    chess.SQUARES.forEach(function (s) {
        const ms = chess.moves({
            square: s,
            verbose: true
        })
        if (ms.length) dests[ s ] = ms.map(m => m.to)
    })
    return dests
}

Board.oncreate = vnode => {
    Board.config.movable.dests = Board.make_dests(Board.chessjs)
    window.chessground = Board.chessground = Chessground(vnode.dom, Board.config)
}

Board.view = () => m('div', {
    class: 'board wood small merida coordinates blue'
}, 'board goes here')

const letter_to_color = {
    w: 'white',
    b: 'black'
}

/**
 * Syncs chessjs into chessground
 */
Board.sync = () => {
    const lastMove = []
    if (Board.chessjs.history({ verbose: true }).length > 0) {
        const move = Board.chessjs.history({ verbose: true }).pop()
        lastMove.push(move.from)
        lastMove.push(move.to)
    }
    const fixed_config = Object.assign(
        {},
        Board.config,
        {
            fen: Board.chessjs.fen(),
            turnColor: letter_to_color[ Board.chessjs.turn() ],
            orientation: localStorage.getItem('board.orientation') || 'white',
            dests: Board.make_dests(Board.chessjs),
            lastMove,
            movable: Object.assign(
                {},
                Board.config.movable,
                {
                    color: letter_to_color[ Board.chessjs.turn() ],
                    dests: Board.make_dests(Board.chessjs)
                })
        })
    console.log('fixed config', fixed_config)
    Board.chessground.set(fixed_config)
}


window.chessjs = Board.chessjs = new chessjs()
Board.chessjs.reset()

module.exports = Board