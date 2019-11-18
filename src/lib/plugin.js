/**
 * The meat of this project, everything is a plugin. The core functionality is
 * just to orchestrate plugins
 */
// This is to avoid the requestAnimationFrame error
// global.requestAnimationFrame = () => { }

console.log('----> ', process.extraResources)
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const os = require('os')
const shell = require('shelljs')
const path_to_home = require('electron').remote.app.getAppPath()
//path.join(os.homedir(), '.vogula')
const path_to_plugins = path.join(path_to_home, '..', 'plugins')
const m = require('mithril')

mkdirp.sync(path_to_plugins)
const debug = require('debug')
const Plugin = {}


/**
 * Returns the menu definitions from the already loaded plugins
 */
Plugin.load_menus = () => {

}

Plugin.slots = {}
Plugin.views = {}

// Load Views and Events
shell.ls(path_to_plugins).forEach(function (plugin) {
    console.log(`Looking in ${path_to_plugins} and this plugin is ${plugin}`)
    const path_to_plugin = path.join(path_to_plugins, plugin)
    // Check if this plugin has an events folder
    const path_to_events = path.join(path_to_plugin, 'events')
    if (shell.test('-d', path_to_events)) {
        // Register all the events
        shell.ls(path_to_events).forEach(slot => {
            const slot_name = slot.replace('.js', '')
            if (!Plugin.slots[ slot_name ]) {
                Plugin.slots[ slot_name ] = []
            }
            Plugin.slots[ slot_name ].push(require(path.join(path_to_events, slot)))
        })
    }

    // Check if there are views in this plug in
    const path_to_views = path.join(path_to_plugin, 'views')
    if (shell.test('-d', path_to_views)) {
        // Register all the events
        shell.ls(path_to_views).forEach(view => {
            const view_name = view.replace('.js', '')
            if (!Plugin.views[ view_name ]) {
                Plugin.views[ view_name ] = []
            }
            Plugin.views[ view_name ].push(require(path.join(path_to_views, view)))
        })
    }
})

/**
 * @param {String} view_name
 */
Plugin.view = view_name => {
    const log = console.log
    log('Loaded views %O', Plugin.views)
    if (!Plugin.views[ view_name ]) {
        console.log('Loading ' + view_name + ' for the first time')
        Plugin.views[ view_name ] = []
        const path_to_default_view = path.resolve(path.join('./', 'src', 'views', `${view_name}.js`))
        log('Loading default view from %s', path_to_default_view)
        Plugin.views[ view_name ] = global.require(path_to_default_view)
        log('Loaded plugins after the last require %O', Plugin.views)
    }
    console.log('Returning ', Plugin.views[ view_name ])
    return Plugin.views[ view_name ]
}


module.exports = Plugin