const m = require('mithril')
const moves = require('../../pgn/moves')
const analysis = require('../analysis') // should refactor the status out of the analysis
const actions = require('../actions')
const settings = require('./settings')
const Toolbar = {
    view: () => m('div.engine_toolbar', [
        m('button', {
            onclick: e => settings.show()
        }, 'Settings'),
        m(settings),

        m('button', {
            onclick: actions.add_to_queue
        }, 'Queue')
    ])
}

module.exports = Toolbar