const m = require('mithril')
const stream = require('mithril/stream')
const engine = require('../../engine/actions')
const PGN = require('../../../../lib/pgn')

require('./index.scss')

/**
 * Keeps all the moves in the active game, knowing variations and fens
 * moves is an array of PGNMove, these items match the halfmove-1 due to array index
 * moves = [ {
 *      fen: String
 * }, {}, {}]
 */
const pgn_moves = {
    import_pgn,
    move_list: new PGN.MovesList(),
    moves: [],
    halfmove: 1, // starts at 1
    current_move: stream(''), // points to one moves[ <id> ]
}
pgn_moves.view = () => m('div.move_list', pgn_moves.move_list.vnodes())

/**
 * These ids make it a direct access between a move and its parent and any possible variations
 */
function make_id() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * Appends a move to pgn_moves.moves
 * 2 triggers for this function:
 * /component/board/chessground -> onafter
 * /component/board/promote
 * @param {Object} param
 * @param {String} param.color 'white' | 'black'
 * @param {String} param.fen
 * @param {String} param.san
 */
pgn_moves.make_move = param => {
    console.log('make move', param)
    const move = new PGN.Move({
        fen: param.fen,
        san: param.san
    })

    pgn_moves.move_list.add_move(move)

    m.redraw()

    pgn_moves.current_move(move.id)
    engine.fetch_analysis(move.fen) // just trigger it, side-effects yeah I know...
}

/**
 *
 */
function make_move_list() {
    return pgn_moves.moves.map(move => {
        console.log('make_move_list', move)
        return m('span', {
            class: 'move' + (pgn_moves.current_move() == move.id ? ' current_move' : '')
        }, move.halfmove % 2 == 1 ? `${Math.ceil(move.halfmove / 2)}.${move.san}` : ` ${move.san}`)
    })
}

function import_pgn(pgn) {
    /* const chess = new Chess()
    chess.load_pgn(pgn)
    console.log('[import_pgn]', chess.history())
    const copy_chess = new Chess()
    const moves = chess.history().map(san => {
        copy_chess.move(san)
        return new PGN.Move({ san, fen: copy_chess.fen() })
    }) */
    const move_list = new PGN.MovesList()
    move_list.import_pgn(pgn)
    for (move in moves) {
        move_list.add_move(moves[ move ])
    }
    console.log('--> print')
    move_list.print()
}
module.exports = pgn_moves