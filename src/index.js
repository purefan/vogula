const m = require('mithril')
const base = require('./ui/base')
require('./index.scss')

const routes = {
    '/': base
}

m.route(document.body, '/', routes)

window.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    console.log('---> Context menu', e)
    //rightClickPosition = {x: e.x, y: e.y}
    //menu.popup(remote.getCurrentWindow())
}, false)
