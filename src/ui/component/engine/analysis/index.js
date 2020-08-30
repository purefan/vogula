const m = require('mithril')
const stream = require('mithril/stream')
const EngineActions = require('../actions')
const moves = require('../../pgn/moves')
const chess = require('chess.js')
const pgn = require('../../../../lib/pgn')
const PositionAnalysed = require('../../../../lib/analysis')

require('./index.scss')

/**
 * Formats the analysis stored in EngineActions
 */
const Engine = {
    status: 'idle'
    , cache: {} // Simple caching
    , analysis: {}
    , vnode_analysis: m('div', 'def')
    , view: () => m('div.engine_analysis', m('div.table', [
        m('div.tr', [
            m('div.td', 'Score'),
            m('div.td', 'Depth'),
            m('div.td', 'Line'),
        ]),
        prepare(EngineActions.analysis())
            .map(step =>
                m('div.tr', {
                    depth: step.depth,
                    score: step.score
                }, [
                    m('div.td', step.score),
                    m('div.td', step.depth),
                    m('div.td', m('div.move_list', step.moves.map(move => move.make_vnode())))
                ])
            )
    ]))
}


/**
 *
 * Removes low depth analysis
 * Removes pvs that dont match the best move
 * Removes duplicated best_moves (taking highest node count)
 * Sorts according to eval respecting player turn
 * @param {PositionAnalysed} result
 *
 * @returns {Array}
 */
function prepare(result) {
    console.log('[prepare]', result)
    if (!result.analysis) {
        return []
    }

    const best_analysis = result.get_deepest_analysis(result.analysis)
    const best_steps = result.get_best_steps(best_analysis)
    const unique_steps = result.remove_duplicated_first_pv(best_steps)
    unique_steps.sort((a, b) => {
        if (a.fen.split(' ')[1] != 'w') {
            return a.score - b.score
        }
        return b.score - a.score
    })
    return unique_steps
}


module.exports = Engine