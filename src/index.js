const m = require('mithril')
const base = require('./ui/base')
const cron = require('./lib/cron')()
const db = require('./ui/component/db')


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

cron.register_cron(db.toolbar.watch.run_check, cron.intervals.FIVE_MINUTES)
cron.start()
