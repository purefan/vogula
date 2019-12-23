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

function format_status(status) {
    if (status == 0) {
        return m('div', { class: 'analysis engine_status_' + status }, 'Analysis queued')
    }

    if (status == 1) {
        return m('div', { class: 'analysis engine_status_' + status }, 'Analysis in progress')
    }

    if (status == 2) {
        return m('div', { class: 'analysis engine_status_' + status }, 'Analysis completed')
    }

    if (status == 'idle') {
        return m('div', { class: 'analysis engine_status_' + status }, 'Idle')
    }

    return m('div', { class: 'analysis' }, ' Unformated status ' + status)
}