const m = require('mithril')
const stream = require('mithril/stream')
const pgn = require('../../pgn/moves')
const toolbar = require('../toolbar')
const EngineActions = require('../actions')
require('./index.scss')
/**
 * Queries resker for analysis and allows to queue a position.
 * Updates analysis when a new move is displayed if it exists in resker
 */

const Engine = {
    oninit: () => {

    }
    , status: 'idle'
    , analysis: {}
    , view: () => m('div.engine_analysis', m('div.table', [
        m('div.tr', [
            m('div.td', 'Score'),
            m('div.td', 'Depth'),
            m('div.td', 'Line'),
        ]),
        (EngineActions.analysis().analysis || []).map(format_analysis)
    ]))
}

window.engine = Engine

/**
 * Formats the result of a chess engine analysis
 * @param {Object} result
 */
function format_analysis(result) {
    return result.steps
        .filter(step => step.depth == result.depth)
        .reduce((acc, curr) => {
            if (!acc.find(looking => looking.pv == curr.pv)) {
                acc.push(curr)
            }
            return acc
        }, [])
        .map(step => m('div.tr', [
            m('div.td', step.score.value),
            m('div.td', step.depth),
            m('div.td', step.pv)
        ]))
}


module.exports = Engine