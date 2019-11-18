const Chessground = require("chessground").Chessground
const m = require('mithril')
const chessjs = require('chess.js')

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
    orientation: 'white',
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
                Board.move_in_transit = { src, dest }
                if (is_promote({ src, dest })) {
                    const promote = require('../promote')
                    promote.is_hidden = false
                    m.redraw()
                    return true
                }
                console.log('--> piece from', Board.chessjs.get(src))
                const move = Board.chessjs.move({ from: src, to: dest })
                console.log('events.after', src, dest, meta)
                console.log('chessjs move', move)

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
    const fixed_config = Object.assign(
        {},
        Board.config,
        {
            fen: Board.chessjs.fen(),
            turnColor: letter_to_color[ Board.chessjs.turn() ],
            dests: Board.make_dests(Board.chessjs),
            movable: Object.assign(
                {},
                Board.config.movable,
                {
                    color: letter_to_color[ Board.chessjs.turn() ],
                    dests: Board.make_dests(Board.chessjs)
                })
        })
    Board.chessground.set(fixed_config)
}


window.chessjs = Board.chessjs = new chessjs()
Board.chessjs.reset()

module.exports = Board