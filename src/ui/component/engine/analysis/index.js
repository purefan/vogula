const m = require('mithril')
const stream = require('mithril/stream')
const EngineActions = require('../actions')
const moves = require('../../pgn/moves')
const chess = require('chess.js')
const pgn = require('../../../../lib/pgn')

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
                    score: step.score.value
                }, [
                    m('div.td', step.centipawn),
                    m('div.td', step.depth),
                    m('div.td', m('div.move_list', step.move_list.map(move => move.make_vnode())))
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
 * @param {Object} result
 * @param {Array} result.analysis
 * @param {Object} result.analysis[0]
 *
 * @returns {Array}
 */
function prepare(result) {
    console.log('[prepare]', result)
    if (!result.analysis) {
        return []
    }
    const position = Object.assign({}, result)
    // find the PVs with the highest depth
    const max_depth = Math.max(...position.analysis.map(pv => pv.depth))
    // take only the analysis with the highest depth
    position.analysis = position.analysis.filter(pv => pv.depth == max_depth)

    // There might be 2 analysis with depth = max and best_move equals between themselves
    const dedupe_analysis = position.analysis.reduce((acc, curr) => {
        if (!acc[ curr.best_move ] || acc[ curr.best_move ].nodes < curr.nodes) {
            acc[ curr.best_move ] = curr
        }
        return acc
    }, {})
    position.analysis = Object.values(dedupe_analysis)
    // Extract all the steps from all the analysis
    position.steps = position.analysis
        .reduce((acc, curr) => {
            acc = acc.concat(curr.steps)
            return acc
        }, [])
        .filter(step => step.depth == max_depth)
        .map(step => {
            const validator = new chess()
            validator.load(result._id)
            const steps = Object.assign(step, {
                centipawn: Number.parseFloat(step.score.value / 100).toFixed(2),
                move_list: step.pv
                    .split(' ')
                    .map(sloppy => {
                        let current_half_move = moves.move_list.count_half_moves_before()
                        current_half_move++
                        const chess_move = validator.move(sloppy, { sloppy: true })
                        if (!chess_move) {
                            throw new Error('invalid move')
                        }
                        return new pgn.Move({
                            san: chess_move.san,
                            fen: validator.fen(),
                            half_move: current_half_move
                        })
                    })
            })
            steps.san = steps.move_list[0].san
            return steps
        })
        .reduce((acc, curr) => {
            if (!acc[curr.san] || acc[curr.san].nodes < curr.nodes) {
                acc[curr.san] = curr
            }
            return acc
        }, {})
    position.steps = Object.values(position.steps)
    position.steps.sort((a, b) => {
        if (result._id.split(' ')[1] != 'w') {
            return a.score.value - b.score.value
        }
        return b.score.value - a.score.value
    })
    console.log('[prepare] valid analysis', position)
    return position.steps
}


module.exports = Engine