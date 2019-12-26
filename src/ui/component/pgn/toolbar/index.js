const m = require('mithril')
const clipboard = require('./clipboard')

const pgn_toolbar = {
    view: () => [
        m('button.toolbar-item', {
            onclick: e => clipboard.show()
            , title: 'Copy to and from Clipboard'
        }, 'Clipboard'),
        m(clipboard)
    ]
}

module.exports = pgn_toolbar