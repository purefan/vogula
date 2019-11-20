const m = require('mithril')
const board = require('../chessground') // for state
const moves = require('../../pgn/moves')

require('./index.scss')
const promote = {
    oninit: () => {
        promote.is_hidden = true
        console.log('promote:oninit board', board)
    },
    view: () => m('div', {
        class: 'overlay' + (promote.is_hidden ? ' hidden' : '')
    }, [
        m('div.popup', [
            // content
            make_btn_choose_piece({ piece: `${board.chessjs.turn()}N` }),
            make_btn_choose_piece({ piece: `${board.chessjs.turn()}B` }),
            make_btn_choose_piece({ piece: `${board.chessjs.turn()}R` }),
            make_btn_choose_piece({ piece: `${board.chessjs.turn()}Q` })
        ])
    ])
}

module.exports = promote

function make_btn_choose_piece(param) {
    return m('button', {
        class: `btn_${param.piece}`,
        onclick: () => {
            const promote_params = {
                from: board.move_in_transit.src,
                to: board.move_in_transit.dest,
                promotion: param.piece.charAt(1).toLowerCase()
            }
            const move = Object.assign(
                {},
                {
                    fen: board.chessjs.fen()
                },
                promote_params,
                board.chessjs.move(promote_params)
            )
            moves.make_move(move)
            board.sync()

            promote.is_hidden = true
            m.redraw()
        }
    })
}