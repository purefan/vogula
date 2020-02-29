/**
 * All network requests happen here, anything triggered by the user happens here
 */
const m = require('mithril')
const stream = require('mithril/stream')
const cache = require('../../../lib/cache')

/**
 * @property {mithril/stream} status -
 * @property {mithril/stream} analysis - Used to display analysis from Resker
 */
const EngineActions = {
    status: stream('idle'),
    analysis: stream({}),
    add_to_resker_queue,
    fetch_analysis,
    xhr: null,
    cache: new cache({ name: 'resker.position' }),
}
window.actions = EngineActions
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
    const res = await m.request({
        method: 'POST',
        url: localStorage.getItem('settings.engine.resker.host') + '/position',
        headers: {
            'x-api-key': localStorage.getItem('settings.engine.resker.api_key'),
            resker_client: localStorage.getItem('settings.engine.resker.client')
        },
        body: {
            fen: pgn_moves.move_list.current_fen,
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
    console.log('[Engine:fetch_analysis]', fen)
    if (!fen) {
        throw new Error('Fen cannot be empty')
    }
    const in_cache = EngineActions.cache.get(fen)
    // 1. Do we have a stored analysis?
    if (localStorage.getItem('settings.engine.resker.cache.enabled') == 'on' && in_cache) {
        // 2. If yes, then send to show it
        console.log('Engine::fetch_analysis] fen found in cache with value', in_cache)
        EngineActions.analysis(in_cache)
        EngineActions.status('Found in local cache')
        return true
    } else {
        console.log('[Engine::fetch] is caching enabled', localStorage.getItem('settings.engine.resker.cache.enabled') == true)

        // 3. If not, then fetch from resker
        // @todo queue this
        const analysis = await fetch_position_from_resker(fen)

        // 3.1 if Resker doesnt have it
        if (!analysis) {
            // 3.2 then add the position for analysis
            console.log('[Engine:fetch_analysis] Setting empty analysis( status: 0 )')
            EngineActions.analysis(Object.assign({ status: 0 }))
            queue_position_on_resker(fen)
        } else {
            console.log('[Engine:fetch_analysis] Setting analysis on step 3.3')
            EngineActions.analysis(analysis)
            EngineActions.status(analysis.status)
            store_analysis_in_local_cache(analysis)
        }
    }
}
function store_analysis_in_local_cache(analysis) {
    if (localStorage.getItem('settings.engine.resker.cache.enabled') != 'on') {
        console.log('[Engine::store_analysis_in_local_cache] Not storing because caching is disabled')
    }
    const one_hour = Date.now() + (60 * 60 * 1000)
    const seven_days = Date.now() + (60 * 60 * 24 * 7 * 1000) //  7 days
    let dies_at = seven_days // 1hr from now
    if (analysis.analysis && analysis.analysis.length > 0) { // @todo potential bug with the dies_at
        const analyzed_goals = analysis.analysis.map(analysis => analysis.depth)
        if (analysis.depth_goal != Math.max(...analyzed_goals)) {
            dies_at = one_hour
        }
    }
    const cache_params = { name: analysis._id || analysis.fen, value: analysis, dies_at: dies_at }
    console.log('[Engine::store_analysis_in_local_cache] Storing analysis in local cache:', JSON.stringify(cache_params).substr(0, 100))
    EngineActions.cache.set(cache_params)
}

    if (EngineActions.xhr !== null) {
        EngineActions.xhr.abort()
        EngineActions.xhr = null
    }

    // @todo implement caching
    const res = await m.request({
        method: 'GET',
        config: xhr => EngineActions.xhr = xhr,
        url: localStorage.getItem('settings.engine.resker.host') + '/position',
        headers: {
            'x-api-key': localStorage.getItem('settings.engine.resker.api_key'),
            fen,
            resker_client: localStorage.getItem('settings.engine.resker.client')
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
            depth_goal: parseInt(localStorage.getItem('settings.engine.resker.auto_depth_goal')) || 30,
            multipv_goal: parseInt(localStorage.getItem('settings.engine.resker.auto_multipv_goal')) || 4,
            priority: 1
        })
        fetch_analysis(fen)
    } else {
        console.log('[Engine::fetch_analysis] Fetched analysis and streaming it:', res)
        /* EngineActions.cache[ fen ] = new fig({
            ttl: '15m',
            value: res
        }) */
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