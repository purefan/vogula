/**
 * All network requests happen here, anything triggered by the user happens here
 */
import stream from 'mithril/stream'
import cache from '../../../lib/cache.js'
import queue from '../../../lib/queue'
import request from '../../../lib/request.js'
import PositionAnalysed from '../../../lib/analysis'
import Debug from 'debug'
import pgn_moves from '../pgn/moves'
const debug = Debug('ui/component/engineactions')

/**
 * @property {mithril/stream} status -
 * @property {mithril/stream<PositionAnalysed>} analysis - Used to display analysis from Resker
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

/**
 *
 * @param {*} [result]
 * @returns {PositionAnalysed|null}
 */
function set_analysis(result) {
    const log = debug.extend('set_analysis')
    log('[EngineActions:set_analysis]', result)
    if (!result || result == null || typeof result == undefined) {
        log('[EngineActions] Requesting the value of the stream', EngineActions.analysis_stream())
        return EngineActions.analysis_stream()
    }
    if (EngineActions.analysis_cache == result._id) {
        log('[EngineActions] Not duplicating ', EngineActions.analysis_cache)
        return null
    }
    EngineActions.analysis_cache = result._id
    EngineActions.analysis_stream(new PositionAnalysed(result))
    m.redraw()
    log('[EngineActions] done')
}

/**
* When pressed adds the current position to the resker queue
* @param {object} param
* @param {Number} [param.depth_goal=40]
* @param {Number} [param.multipv_goal=5]
* @param {Number} [param.priority=5]
* @param {String} [param.fen] - Defaults to the current fen
*/
async function add_to_resker_queue(param) {
    param = Object.assign({}, { depth_goal: 40, priority: 10 }, param)
    assert_valid_key()
    EngineActions.status('Queuing')
    const body_params = {
        fen: param.fen || pgn_moves.move_list.current_fen,
        depth_goal: param.depth_goal || 40,
        multipv_goal: param.multipv_goal || 5,
        priority: param.priority || 5
    }

    if (localStorage.getItem('settings.engine.resker.smart_prio.enabled') === 'true') {
        body_params.priority = calculate_priority({ fen: body_params.fen })
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
    const log = debug.extend('fetch_analysis')
    log('[Engine:fetch_analysis]', fen)
    EngineActions.status('Fetching from resker...')
    if (!fen) {
        throw new Error('Fen cannot be empty')
    }

    const analysis = await fetch_position_from_resker(fen)
    log('[Engine:fetch_analysis] after fetch_position_from_resker', analysis)

    if (!analysis || !analysis._id) {
        // Add the position for analysis
        log('[Engine:fetch_analysis] Setting empty analysis( status: 0 )')
        EngineActions.analysis(Object.assign({ status: 0 }))
        queue_position_on_resker(fen)
    } else {
        log('[Engine:fetch_analysis] Setting analysis on step 3.3', analysis)
        EngineActions.analysis(analysis)
        EngineActions.status(analysis)
    }
}

async function fetch_position_from_resker(fen) {
    const log = debug.extend('fetch_position_from_resker')
    log('[Engine:fetch_position_from_resker] fen: ', fen)
    if (EngineActions.xhr !== null) {
        log('[Engine:fetch_position_from_resker] aborting')
        EngineActions.xhr.abort()
        EngineActions.xhr = null
    }

    return new Promise(resolve => {
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
            log('[Engine::fetch_position_from_resker] Fetched:', res)
            // @TODO Fix in everywhere here:
            if (!res._id && res.fen) {
                res._id = res.fen
            }
            resolve(res)
        }).catch(err => {
            log('error', err)
            EngineActions.analysis('')
            queue_position_on_resker(fen)
        })
    })

}


/**
 * Manually entered moves get a bonus in priority of 1000
 * Large imports do not get a bonus at this point.
 * @param {Object} param
 * @param {String} param.fen
 * @returns {Number} The calculated depth_goal
 */
function calculate_priority(param) {
    let priority = parseInt(localStorage.getItem('settings.engine.resker.auto_depth_goal')) || 10
    if (localStorage.getItem('settings.engine.resker.smart_prio.enabled') == 'true') {
        priority = 38 - parseInt(param.fen.split(' ')[ 5 ]) // 1st move = 37 = median length
    }
    return priority + 1000
}

/**
 *
 */
async function queue_position_on_resker(fen) {
    assert_valid_key()
    EngineActions.status('Adding to resker')
    const log = debug.extend('queue_position_on_resker')
    log('[Engine:queue_position_on_resker] queueing')
    await add_to_resker_queue({
        depth_goal: 40,
        multipv_goal: parseInt(localStorage.getItem('settings.engine.resker.auto_multipv_goal')) || 5,
        priority: calculate_priority({ fen })
    })
}

function assert_valid_key() {
    if (localStorage.getItem('settings.engine.resker.api_key') == null || localStorage.getItem('settings.engine.resker.api_key').length < 5) {
        EngineActions.status('API key not set')
        throw new Error('API key not set')
    }
}

export default EngineActions
