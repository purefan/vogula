/**
 * All network requests happen here, anything triggered by the user happens here
 */
const m = require('mithril')
const stream = require('mithril/stream')
const cache = require('../../../lib/cache')
const queue = require('../../../lib/queue')
const request = require('../../../lib/request')

/**
 * @property {mithril/stream} status -
 * @property {mithril/stream} analysis - Used to display analysis from Resker
 */
const EngineActions = {
    status: stream('init'),
    analysis_stream: stream({}),
    analysis: set_analysis,
    add_to_resker_queue,
    fetch_analysis,
    xhr: null,
    cache: new cache({ name: 'resker.position' }),
    queue: new queue()
}
window.actions = EngineActions

function set_analysis(result) {
    if (!result || result == null || typeof result == undefined) {
        console.log('[EngineActions] Requesting the value of the stream', EngineActions.analysis_stream())
        return  EngineActions.analysis_stream()
    }
    if (EngineActions.analysis_cache == result._id) {
        return console.log('[EngineActions] Not duplicating')
    }
    EngineActions.analysis_cache = result._id
    EngineActions.analysis_stream(result)
}

/**
* When pressed adds the current position to the resker queue
* @param {Number} [param.depth_goal=40]
* @param {Number} [param.priority=5]
* @param {String} [param.fen] - Defaults to the current fen
*/
async function add_to_resker_queue(param) {
    const pgn_moves = require('../pgn/moves')
    param = Object.assign({}, { depth_goal: 40, priority: 10 }, param)
    assert_valid_key()
    EngineActions.status('Queuing')
    const body_params = {
        fen: param.fen || pgn_moves.move_list.current_fen,
        depth_goal: param.depth_goal || 40,
        priority: param.priority || 5
    }

    if (localStorage.getItem('settings.engine.resker.smart_prio.enabled') === 'true') {
        const fen_parts = body_params.fen.split(' ')
        const calculated_priority = 38 - fen_parts[ 5 ] // 1st move = 37 = median length
        body_params.priority = calculated_priority < 1 ? 1 : calculated_priority
    }

    return new Promise((resolve, reject) => {
        request({
            method: 'POST',
            url: localStorage.getItem('settings.engine.resker.host') + '/position',
            headers: {
                'x-api-key': localStorage.getItem('settings.engine.resker.api_key'),
                resker_client: localStorage.getItem('settings.engine.resker.client')
            },
            body: body_params
        }).then((res) => {
            EngineActions.status(`Added to resker with depth: ${body_params.depth_goal}@${body_params.priority}`)
            resolve(res)
        })
    })
}

/**
 * Requests the position from Resker
 * Caching is implemented at network level with the Request library
 * @param {String} fen
 */
async function fetch_analysis(fen) {
    console.log('[Engine:fetch_analysis]', fen)
    EngineActions.status('Fetching from resker...')
    if (!fen) {
        throw new Error('Fen cannot be empty')
    }

    const analysis = await fetch_position_from_resker(fen)

    if (!analysis || !analysis._id) {
        // Add the position for analysis
        console.log('[Engine:fetch_analysis] Setting empty analysis( status: 0 )')
        EngineActions.analysis(Object.assign({ status: 0 }))
        queue_position_on_resker(fen)
    } else {
        console.log('[Engine:fetch_analysis] Setting analysis on step 3.3', analysis)
        EngineActions.analysis(analysis)
        EngineActions.status(analysis)
    }
}

async function fetch_position_from_resker(fen) {
    console.log('[Engine:fetch_position_from_resker] fen: ', fen)
    if (EngineActions.xhr !== null) {
        console.log('[Engine:fetch_position_from_resker] aborting')
        EngineActions.xhr.abort()
        EngineActions.xhr = null
    }

    return new Promise((resolve, reject) => {
        request({
            method: 'GET',
            config: xhr => EngineActions.xhr = xhr,
            url: localStorage.getItem('settings.engine.resker.host') + '/position',
            headers: {
                'x-api-key': localStorage.getItem('settings.engine.resker.api_key'),
                fen,
                resker_client: localStorage.getItem('settings.engine.resker.client')
            }
        }).then(res => {
            EngineActions.xhr = null
            console.log('[Engine::fetch_position_from_resker] Fetched:', res)
            resolve(res)
        }).catch(err => {
            console.log('error', err)
            EngineActions.analysis('')
            queue_position_on_resker(fen)
        })
    })

}

async function queue_position_on_resker(fen) {
    assert_valid_key()
    EngineActions.status('Adding to resker')
    console.log('[Engine:queue_position_on_resker] queueing')
    await add_to_resker_queue({
        fen,
        depth_goal: parseInt(localStorage.getItem('settings.engine.resker.auto_depth_goal')) || 30,
        multipv_goal: parseInt(localStorage.getItem('settings.engine.resker.auto_multipv_goal')) || 4,
        priority: 1
    })
}

function assert_valid_key() {
    if (localStorage.getItem('settings.engine.resker.api_key') == null || localStorage.getItem('settings.engine.resker.api_key').length < 5) {
        EngineActions.status('API key not set')
        throw new Error('API key not set')
    }
}

module.exports = EngineActions