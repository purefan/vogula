const m = require('mithril')
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
    current_move
}
pgn_moves.view = () => m('div.move_list.tree-branch', pgn_moves.move_list.vnodes())
function current_move(id) {
    if (id) {
        pgn_moves.move_list.current_move(id)
        pgn_moves.move_list.update_vnodes()
    } else {
        return pgn_moves.move_list.current_move()
    }
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
    const move = new PGN.Move({
        fen: param.fen,
        san: param.san
    })

    pgn_moves.move_list.add_move(move)
    pgn_moves.move_list.update_vnodes()
    m.redraw()
}

function import_pgn(pgn) {
    pgn_moves.move_list.import_pgn(pgn)
}

module.exports = pgn_moves