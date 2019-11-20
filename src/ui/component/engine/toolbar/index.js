const m = require('mithril')
const moves = require('../../pgn/moves')
const analysis = require('../analysis') // should refactor the status out of the analysis

const Toolbar = {
    add_to_queue,
    view: () => m('div.engine_toolbar', [
        m('button', {
            onclick: add_to_queue
        }, 'Queue')
    ])
}


/**
 * When pressed adds the current position to the resker queue
 * @param {Number} [depth_goal=40]
 * @param {Number} [priority=40]
 */
async function add_to_queue(param) {
    param = Object.assign({}, { depth_goal: 40, priority: 10 }, param)
    analysis.status = 'Queuing'
    const current_move = moves.moves.find(move => move.id == moves.current_move)
    console.log('[Engine:toolbar:add_to_queue]', current_move)
    const res = await m.request({
        method: 'POST',
        url: 'http://192.168.1.7:8080/position',
        headers: {
            'x-api-key': 'vogula-v1.0'
        },
        body: {
            fen: current_move.fen_after_move,
            depth_goal: param.depth_goal || 40,
            priority: param.priority || 10 // resker has a bug, it sets this to 5 all the time
        }
    })
    console.log('add_to_queue res', res)
    analysis.status = 'idle'
}

module.exports = Toolbar