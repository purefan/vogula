const m = require('mithril')
const stream = require('mithril/stream')
const EngineActions = require('../actions')
const moves = require('../../pgn/moves')
const chess = require('chess.js')
const pgn = require('../../../../lib/pgn')
const clipboard = require('../../pgn/toolbar/clipboard')

require('./index.scss')
/**
 * Queries resker for analysis and allows to queue a position.
 * Updates analysis when a new move is displayed if it exists in resker
 * Updates the analysis display every time moves.move_list.current_move changes
 * by triggering EngineActions.fetch_analysis
 */

const Engine = {
    oninit: () => {
        stream.lift(move_id => {
            if (clipboard.state == 'hidden') {
                console.log('[Engine] triggering fetch_analysis because current_move changed')
                EngineActions.fetch_analysis(moves.move_list.moves[ move_id ].fen)
            }
        }, moves.move_list.current_move)
    }
    , status: 'idle'
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
        .reduce((acc, curr) => {
            if (!acc.find(looking => looking.pv == curr.pv)) {
                acc.push(curr)
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
        if (!current_move.is_white_move) return Math.abs(b.attrs.score) - Math.abs(a.attrs.score)
        return Math.abs(a.attrs.score) - Math.abs(b.attrs.score)
    })
    Engine.cache = {
        fen: result._id,
        vnodes
    }
    Engine.status = 'idle'
    return vnodes
}


module.exports = Engine