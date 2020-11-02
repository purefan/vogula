const TabManager = require('../../../../../lib/tab')()
const Config = require('./config')()
const Stats = require('./stats')()
const m = require('mithril')
require('./index.scss')

const Settings = {
    state: 'hidden',
    stats: {},
    oninit: () => {
        TabManager.add_tab(Config)
        TabManager.add_tab(Stats)
    },
    view: () => m(
        'div',
        { class: `modal ${Settings.state}` },
        m('div.modal-content', [
            m('button.close-modal', { onclick: e => Settings.state = 'hidden' }, 'Close'),
            m(TabManager)
        ]
    )),
    show: () => {
        Settings.state = 'visible'
        m.redraw()
    }
}

module.exports = Settings