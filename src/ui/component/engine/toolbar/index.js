const m = require('mithril')
const actions = require('../actions')
const settings = require('./settings')
const Toolbar = {
    view: () => m('div.engine_toolbar', [
        m('button', {
            onclick: e => settings.show()
        }, 'Settings'),
        m(settings),

        m('button', {
            onclick: actions.add_to_resker_queue
        }, 'Queue')
    ])
}

module.exports = Toolbar