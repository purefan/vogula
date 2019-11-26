const m = require('mithril')
const stream = require('mithril/stream')
const Engine = require('../analysis')
const Status = {

    view: () => m('div.engine_status', [
        m('div', { class: 'status ' + Engine.status }, stream(Engine.status)())
    ])
}

module.exports = Status