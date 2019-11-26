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
        m('div.analysis', [
            Engine.analysis_stream().status == 0 ? show_not_found() : null,
            Engine.analysis_stream().status == 1 ? show_in_progess() : null,
            Engine.analysis_stream().status == 2 ? show_in_analysis() : null,
        ]) ])
}

Engine.analysis_stream = stream(Engine.analysis)
window.engine = Engine
function show_not_found() {
    return m('div.not_found', 'This position has not been analyzed')
}

function show_in_progess() {
    return m('div.in_progress', 'This position is being analyzed')
}

function show_in_analysis() {
    return m('div.analysis', 'This is the analysis')
}


module.exports = Engine