const m = require('mithril')
const engine = require('../../engine/actions')
require('./index.scss')

/**
 * How we internally store a move that will be displayed in the pgn viewer.
 * color is inferred from halfmove: halfmove % 2 == 0 ---> black
 * @typedef PGNMove
 * @property {String} id - Unique move identifier
 * @property {String} fen_after_move - How the board looks after making this move
 * @property {String} san - human readable format
 * @property {Number} halfmove - starting from 1 according to standards
 * @property {PGNMove[]} ravs - variations stemming from this position
 */


/**
 * Keeps all the moves in the active game, knowing variations and fens
 * moves is an array of moves, these items match the halfmove-1 due to array index
 * moves = [ {
 *      fen_after_move: String
 * }, {}, {}]
 */
const pgn_moves = {
    moves: [],
    halfmove: 1, // starts at 1
    current_move: null, // points to one moves[ <id> ]
    view: () => m('div.move_list', make_move_list())
}

/**
 * These ids make it a direct access between a move and its parent and any possible variations
 */
function make_id() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * 2 triggers for this function:
 * /component/board/chessground -> onafter
 * /component/board/promote
 * @param {Object} param
 * @param {String} param.color 'white' | 'black'
 * @param {String} param.fen
 * @param {String} param.san
 */
pgn_moves.make_move = param => {
    const move = {
        id: make_id(),
        fen_after_move: param.fen,
        san: param.san,
        halfmove: pgn_moves.halfmove,
        ravs: []
    }

    if (pgn_moves.halfmove < (pgn_moves.moves.length + 1)) {
        // user is looking at "not the last move"
        const append_at = pgn_moves.moves.find(move => move.id == pgn_moves.current_move)
        append_at.push(move)
    } else {
        pgn_moves.moves.push(move)
    }

    pgn_moves.halfmove++
    m.redraw()

    pgn_moves.current_move = move.id
    engine.fetch_analysis(move.fen_after_move) // just trigger it, side-effects yeah I know...
}

/**
 *
 * @param {Number} depth tells the depth of the variation we're in
 */
function make_move_list(depth) {
    return pgn_moves.moves.map(move => {
        console.log('make_move_list', move)
        return m('span', {
            class: 'move'
        }, move.halfmove % 2 == 1 ? `${Math.ceil(move.halfmove / 2)}.${move.san}` : ` ${move.san}`)
    })
}

module.exports = pgn_moves