import watch from './watch/index.js'
import importer from './import/index.js'

export default {
    watch,
    view: () => m('div.toolbar-container', [
        m(importer)
        , m('button', 'Lock search')
        , m('button', 'Filter')
        , m('button', { onclick: watch.show_modal }, 'Watch')
    ])
}