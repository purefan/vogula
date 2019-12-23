/**
 * All network requests happen here, anything triggered by the user happens here
 */
const m = require('mithril')
const stream = require('mithril/stream')

/**
 * @property {mithril/stream} status -
 * @property {mithril/stream} analysis - Used to display analysis from Resker
 */
const EngineActions = {
    status: stream('idle'),
    analysis: stream({}),
    add_to_queue,
    fetch_analysis
}

/**
* When pressed adds the current position to the resker queue
* @param {Number} [depth_goal=40]
* @param {Number} [priority=40]
*/
async function add_to_queue(param) {
    const pgn_moves = require('../pgn/moves')
    param = Object.assign({}, { depth_goal: 40, priority: 10 }, param)
    assert_valid_key()
    EngineActions.status('Queuing')
    const current_move = pgn_moves.moves.find(move => move.id == pgn_moves.current_move())
    const res = await m.request({
        method: 'POST',
        url: localStorage.getItem('settings.engine.resker.host') + '/position',
        headers: {
            'x-api-key': localStorage.getItem('settings.engine.resker.api_key')
        },
        body: {
            fen: current_move.fen,
            depth_goal: param.depth_goal || 40,
            priority: param.priority || 10 // resker has a bug, it sets this to 5 all the time
        }
    })
    EngineActions.status('idle')
}


/**
 * Requests the position from Resker
 * @param {String} fen
 */
async function fetch_analysis(fen) {
    const pgn_moves = require('../pgn/moves')
    console.log('[Engine::fetch_analysis] fetching analysis for ', fen)
    assert_valid_key()
    EngineActions.status('fetching')
    // @todo implement caching
    const res = await m.request({
        method: 'GET',
        url: localStorage.getItem('settings.engine.resker.host') + '/position',
        headers: {
            'x-api-key': localStorage.getItem('settings.engine.resker.api_key'),
            fen
        }
    })

    console.log('[Engine::fetch_analysis] First fetch:', res)
    EngineActions.analysis(res) // Displays or visually clears the analysis lines
    if (!res) {
        EngineActions.analysis(Object.assign(
            { status: 0 },
            res
        ))
        console.log('[Engine::fetch_analysis] auto-queuing')
        await add_to_queue({
            depth_goal: 30,
            priority: 1
        })
        fetch_analysis(fen)
    } else {
        console.log('[Engine::fetch_analysis] Fetched analysis and streaming it:', res)
        EngineActions.analysis(res)
        EngineActions.status(res.status)
    }

}

function assert_valid_key() {
    if (localStorage.getItem('settings.engine.resker.api_key') == null || localStorage.getItem('settings.engine.resker.api_key').length < 5) {
        EngineActions.status('API key not set')
        throw new Error('API key not set')
    }
}

module.exports = EngineActions