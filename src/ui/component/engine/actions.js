/**
 * All network requests happen here, anything triggered by the user happens here
 */

/**
* When pressed adds the current position to the resker queue
* @param {Number} [depth_goal=40]
* @param {Number} [priority=40]
*/
async function add_to_queue(param) {
    param = Object.assign({}, { depth_goal: 40, priority: 10 }, param)
    analysis.status = 'Queuing'
    const current_move = moves.moves.find(move => move.id == moves.current_move)
    const res = await m.request({
        method: 'POST',
        url: localStorage.getItem('settings.engine.resker.host') + '/position',
        headers: {
            'x-api-key': localStorage.getItem('setting.engine.resker.api_key')
        },
        body: {
            fen: current_move.fen_after_move,
            depth_goal: param.depth_goal || 40,
            priority: param.priority || 10 // resker has a bug, it sets this to 5 all the time
        }
    })
    analysis.status = 'idle'
}


/**
 * Requests the position from Resker
 * @param {String} fen
 */
async function fetch_analysis(fen) {
    console.log('fetching analysis for ', fen)
    Engine.status = 'fetching'
    // @todo implement caching
    const res = await m.request({
        method: 'GET',
        url: localStorage.getItem('settings.engine.resker.host') + '/position',
        headers: {
            'x-api-key': localStorage.getItem('setting.engine.resker.api_key'),
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
        await add_to_queue({
            depth_goal: 30,
            priority: 1
        })
        fetch_analysis(move.fen_after_move)
    } else {
        console.log('fetch_analysis res', res)
        Engine.analysis_stream(res)
    }
}

module.exports = {
    add_to_queue,
    fetch_analysis
}