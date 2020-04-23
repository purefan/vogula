const m = require('mithril')
const stream = require('mithril/stream')
const Engine = require('../analysis')
const Actions = require('../actions')
const Status = {

    view: () => m('div.engine_status', [
        format_status(Actions.status())
    ])
}

module.exports = Status

function format_status(analysis) {
    let cached = ''
    if (analysis.from_cache) {
        cached = '(Cached) '
    }
    if (analysis.status == 0) {
        return m('div', { class: 'analysis engine_status_' + analysis.status }, `${cached}Analysis queued: ${analysis.depth_goal}x${analysis.multipv_goal}@${analysis.priority}`)
    }

    if (analysis.status == 1) {
        return m('div', { class: 'analysis engine_status_' + analysis.status }, `${cached}Analysis in progress: ${analysis.depth_goal}x${analysis.multipv_goal}@${analysis.priority}`)
    }

    if (analysis.status == 2) {
        return m('div', { class: 'analysis engine_status_' + analysis.status }, `${cached}Analysis completed`)
    }

    if (analysis.status == 'idle') {
        return m('div', { class: 'analysis engine_status_' + analysis.status }, 'Idle')
    }

    if (analysis == 'init') {
        return m('div', { class: 'analysis engine_status_init' }, 'Ready')
    }

    return m('div', { class: 'analysis' }, analysis)
}