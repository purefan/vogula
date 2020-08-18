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
    , view: () => m('div.engine_analysis', m('div.table', [
        m('div.tr', [
            m('div.td', 'Score'),
            m('div.td', 'Depth'),
            m('div.td', 'Line'),
        ]),
        stream.lift(format_analysis, EngineActions.analysis)()
    ]))
}

window.engine = Engine

/**
 * Formats the result of a chess engine analysis
 * @param {Object} result
 */
function format_analysis(result) {
    if (Engine.cache.fen == result._id) {
        console.log('[Analysis:format_analysis] Not processing the same position twice', result._id)
        return Engine.cache.vnodes
    }

    console.log('[Analysis:format_analysis]', result)

    if (!result.analysis || result.analysis.length < 1) {
        console.log('[Analysis:format_analysis] No analysis')
        Engine.cache = {
            fen: result._id,
            vnodes: false
        }
        return false
    }

    // Find the deepest analysis, this causes a single engine to count
    const analysis = result.analysis.reduce((acc, curr) => {
        if (curr.depth > acc.depth) {
            return curr
        }
        return acc
    }, { depth: 0 })

    const current_move = moves.move_list.moves[ moves.move_list.current_move() ]

    const validator = new chess()
    const vnodes = analysis.steps
        .filter(step => step.depth == EngineActions.analysis().depth_goal)
        // Make the array unique by comparing the first move in pv and taking
        // the highest nodes count
        .reduce((acc, curr) => {
            curr.first_pv = curr.pv.split(' ')[ 0 ]
            const pos_found = acc.findIndex(looking_at => looking_at.first_pv == curr.first_pv)
            if (pos_found < 0) {
                acc.push(curr)
            } else if (acc[ pos_found ].nodes < curr.nodes) {
                acc[ pos_found ] = curr
            }
            return acc
        }, [])
        .map(step => {
            validator.load(current_move.fen)
            let current_half_move = moves.move_list.count_half_moves_before()
            let eval_symbol = '+'
            // is_white_move refers to the actual current_move, but when displaying
            // we need "is white's turn to play", that is why it is "inverted" in this
            // condition
            if (
                (!current_move.is_white_move && step.score.value < 0) ||
                (current_move.is_white_move && step.score.value > 0)) {
                eval_symbol = '-'
            }
            if (step.score.value == 0.0) {
                eval_symbol = ''
            }
            return m('div.tr', {
                depth: step.depth,
                score: step.score.value
            }, [
                m('div.td', `${eval_symbol}${(Math.abs(step.score.value) / 100).toFixed(2)}`),
                m('div.td', step.depth),
                m('div.td', m('div.move_list', step.pv
                    .split(' ')
                    .map(sloppy => {
                        current_half_move++
                        const chess_move = validator.move(sloppy, { sloppy: true })
                        if (!chess_move) {
                            return null
                        }
                        const move = new pgn.Move({
                            san: chess_move.san,
                            fen: validator.fen(),
                            half_move: current_half_move
                        })
                        return move.make_vnode()
                    })
                ))
            ])
        })
    vnodes.sort((a, b) => {
        console.log('Sorting', current_move.is_white_move, b.attrs.score, a.attrs.score)
        if (!current_move.is_white_move) return b.attrs.score - a.attrs.score
        return b.attrs.score - a.attrs.score
    })
    Engine.cache = {
        fen: result._id,
        vnodes
    }
    Engine.status = `Fetched at depth ${EngineActions.analysis().depth_goal}`
    return vnodes
}


module.exports = Engine