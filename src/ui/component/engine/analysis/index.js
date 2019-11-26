const m = require('mithril')
const stream = require('mithril/stream')
const pgn = require('../../pgn/moves')
const toolbar = require('../toolbar')

/**
 * Queries resker for analysis and allows to queue a position.
 * Updates analysis when a new move is displayed if it exists in resker
 */

const Engine = {
    oninit: () => {

    }
    , status: 'idle'
    , analysis: {}
    , view: () => m('div.engine_analysis', [
    ])
}

window.engine = Engine



module.exports = Engine