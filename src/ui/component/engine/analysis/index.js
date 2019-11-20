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
    , fetch_analysis
    , view: () => m('div.engine_analysis', [
        m('div.analysis', [
            Engine.analysis_stream().status == 0 ? show_not_found() : null,
            Engine.analysis_stream().status == 1 ? show_in_progess() : null,
            Engine.analysis_stream().status == 2 ? show_in_analysis() : null,
        ]),
        m('div', { class: 'status ' + Engine.status }, stream(Engine.status)())
    ])
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

async function fetch_analysis(fen) {
    console.log('fetching analysis for ', fen)
    Engine.status = 'fetching'
    // @todo implement caching
    const res = await m.request({
        method: 'GET',
        url: 'http://192.168.1.7:8080/position',
        headers: {
            'x-api-key': 'vogula-v1.0',
            fen
        }
    })

    Engine.status = 'idle'
    console.log('[Engine::fetch_analysis]', res)
    Engine.analysis = res
    if (!res) {
        Engine.analysis_stream(Object.assign(
            { status: 0 },
            res
        ))
        console.log('auto-queuing')
        await toolbar.add_to_queue({
            depth_goal: 30,
            priority: 1
        })
        engine.fetch_analysis(move.fen_after_move)
        // @todo resker will just overwrite the depth_goal and priority, should instead
        // take the highest value
    } else {
        console.log('fetch_analysis res', res)
        Engine.analysis_stream(res)
    }
}

module.exports = Engine