const m = require('mithril')
const stream = require('mithril/stream')
const Engine = require('../analysis')
const Actions = require('../actions')
const Status = {

    view: () => m('div.engine_status', [
        Actions.analysis().status == 0 ? show_not_found() : null,
        Actions.analysis().status == 1 ? show_in_progess() : null,
        Actions.analysis().status == 2 ? show_in_analysis() : null,
        m('div', { class: 'status ' + Actions.status }, Actions.status())
    ])
}

module.exports = Status

function show_not_found() {
    return m('div.not_found', 'This position has not been analyzed')
}

function show_in_progess() {
    return m('div.in_progress', 'This position is being analyzed')
}

function show_in_analysis() {
    return m('div.analysis', 'This is the analysis')
}