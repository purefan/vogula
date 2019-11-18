const m = require('mithril')
const base = require('./ui/base')
require('./index.scss')

const routes = {
    '/': base
}

m.route(document.body, '/', routes)