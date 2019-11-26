/**
 * All network requests happen here, anything triggered by the user happens here
 */
const m = require('mithril')
const stream = require('mithril/stream')
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
    param = Object.assign({}, { depth_goal: 40, priority: 10 }, param)
    assert_valid_key()
    analysis.status('Queuing')
    const current_move = moves.moves.find(move => move.id == moves.current_move)
    const res = await m.request({
        method: 'POST',
        url: localStorage.getItem('settings.engine.resker.host') + '/position',
        headers: {
            'x-api-key': localStorage.getItem('settings.engine.resker.api_key')
        },
        body: {
            fen: current_move.fen_after_move,
            depth_goal: param.depth_goal || 40,
            priority: param.priority || 10 // resker has a bug, it sets this to 5 all the time
        }
    })
    analysis.status('idle')
}


/**
 * Requests the position from Resker
 * @param {String} fen
 */
async function fetch_analysis(fen) {
    console.log('fetching analysis for ', fen)
    assert_valid_key()
    EngineActions.status('fetching')
    // @todo implement caching
    try {
        const res = await m.request({
            method: 'GET',
            url: localStorage.getItem('settings.engine.resker.host') + '/position',
            headers: {
                'x-api-key': localStorage.getItem('settings.engine.resker.api_key'),
                fen
            }
        })
        EngineActions.status('idle')
        console.log('[Engine::fetch_analysis]', res)
        EngineActions.analysis(res)
        if (!res) {
            EngineActions.analysis(Object.assign(
                { status: 0 },
                res
            ))
            console.log('auto-queuing')
            await add_to_queue({
                depth_goal: 30,
                priority: 1
            })
            fetch_analysis(move.fen_after_move)
        } else {
            console.log('fetch_analysis res', res)
            EngineActions.analysis(res)
        }
    } catch (error) {
        if (error.code == 401) {

        }
        console.log('error fetching analysis ' + error.code + ': ' + error.message)
    }

}

function assert_valid_key() {
    if (localStorage.getItem('settings.engine.resker.api_key') == null || localStorage.getItem('settings.engine.resker.api_key').length < 5) {
        EngineActions.status('API key not set')
        throw new Error('API key not set')
    }
}

module.exports = EngineActions