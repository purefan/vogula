import { Chessground } from 'chessground'
import chessjs from 'chess.js'
import moves from '../../pgn/moves/index.js'
import EngineActions from '../../engine/actions.js'
import promote from '../promote'
import Debug from 'debug'
const debug = Debug('chessground')

// @ts-ignore
import './chessground.scss'
// @ts-ignore
import './theme.scss'
// @ts-ignore
import './index.scss'

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
                debug('chessjs move', move)

                Board.chessground.set({
                    turnColor: Board.chessjs.turn() == 'b' ? 'black' : 'white',
                    movable: {
                        color: Board.chessjs.turn() == 'b' ? 'black' : 'white',
                        dests: Board.make_dests(Board.chessjs)
                    }
                })

                Board.vnode.dispatchEvent(new CustomEvent('Board.ready', {
                    detail: { move }
                }))

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
    const dests = new Map()
    chess.SQUARES.forEach(function (s) {
        const ms = chess.moves({
            square: s,
            verbose: true
        })
        if (ms.length) dests.set(s, ms.map(m => m.to))
    })
    return dests
}

Board.oncreate = vnode => {
    Board.vnode = vnode.dom
    Board.config.movable.dests = Board.make_dests(Board.chessjs)
    Board.chessground = Chessground(vnode.dom, Board.config)

    Board.vnode.addEventListener('Board.ready', Board.process_queue_after_move)
}

Board.queue_after_move = []
/**
 * Coordinates all the side effects of drag and dropping a piece
 */
Board.process_queue_after_move = async e => {
    e = e || {}
    debug('process_queue_after_move', e)

    if (Board.is_processing_queue) { }
    EngineActions.fetch_analysis(Board.chessjs.fen())

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
Board.sync = async () => {
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
    debug('[Boardsync] Fixed config', fixed_config)
    Board.chessground.set(fixed_config)
    return new Promise(resolve => setTimeout(resolve, 200))
}

// @ts-ignore
Board.chessjs = new chessjs()
Board.chessjs.reset()

Board.make_one_off = make_one_off

/**
 *
 * @param {Object} param
 * @param {String} param.fen
 */
function make_one_off(param) {
    const chess = new chessjs(param.fen)
    const config = {
        fen: param.fen,
        viewOnly: true,
        orientation: letter_to_color[ chess.turn() ]
    }
    const board = {
        oncreate: vnode => Chessground(vnode.dom, config)
    }

    board.view = () => m('div', {
        class: 'one_off_board board wood small merida coordinates blue'
    }, 'board goes here')

    return {
        view: () => m('div', m(board))
    }
}
export default Board
