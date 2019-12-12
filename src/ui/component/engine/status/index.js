const m = require('mithril')
const stream = require('mithril/stream')
const Engine = require('../analysis')
const Actions = require('../actions')
const Status = {

    view: () => m('div.engine_status', [
        Actions.analysis().status == 0 ? show_not_found() : null,
        Actions.analysis().status == 1 ? show_in_progess() : null,
        Actions.analysis().status == 2 ? show_in_analysis() : null
    ])
}

module.exports = Status

function show_not_found() {
    return m('div', { class: 'not_found ' + Actions.status() }, 'This position is queued to be analyzed - ' + Actions.status())
}

function show_in_progess() {
    return m('div', { class: 'in_progress ' + Actions.status() }, 'This position is being analyzed - ' + Actions.status())
}

function show_in_analysis() {
    return m('div', { class: 'analysis ' + Actions.status() }, 'This is the analysis - ' + Actions.status())
}