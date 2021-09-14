import watch from './watch/index.js'

export default {
    watch,
    view: () => m('div.toolbar-container', [
        m('button', 'import PGN')
        , m('button', 'lock search')
        , m('button', 'filter')
        , m('button', { onclick: watch.show_modal }, 'Watch')
    ])
}