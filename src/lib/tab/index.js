import('./index.scss')
export default new TabManager()
/**
 * @typedef TabContent
 * @description Creates a single tab menu item and its content
 * @property {String} title The name to display in the menu section
 * @property {mithril/vnode} vnode The entire content of this tab
 * @property {String} [id] If no id is provided, it will be generated from the title
 * @property {Boolean} is_active Only one can be active
 * @property {Boolean} is_default Only one can be  default
 */

/**
 * Tabs allow to group visual controls into separate containers, where only
 * of those containers is visible at a time.
 */

/**
 * @returns {Object<TabManager~add_tab>}
 */
function TabManager() {
    let tab_items = [] // list of tabs, each clickable

    /**
     * @function
     * @param {TabContent} tab
     */
    function add_tab(tab_content) {
        if (!tab_content.title) {
            throw new Error('no title')
        }
        if (!tab_content.id) {
            tab_content.id = tab_content.title.toLowerCase().replace(/\s/g, '_')
        }
        if (!tab_content.is_active) {
            tab_content.is_active = false
        }
        if (tab_content.is_default === true) {
            if (tab_items.find(tab => tab.is_active === true)) {
                throw new Error('Adding a default tab but only one tab can be active.')
            }
            tab_content.is_active = true
        }
        tab_items.push(tab_content)
    }

    function make_title(item) {
        return m('div', {
            id: item.id,
            class: [ 'tab-title', item.is_active ? 'active' : null ].filter(name => name != null).join(' '),
            onclick: e => {
                e.preventDefault()
                const new_items = tab_items.map(ite_item => {
                    ite_item.is_active = false
                    if (ite_item.id == item.id) {
                        ite_item.is_active = true
                    }
                    return ite_item
                })

                tab_items = new_items
            }
        }, item.title)
    }

    return {
        add_tab,
        view: () => m('.tab-container', [
            m('.tab-toolbar', tab_items.map(make_title)),
            m('.tab-content-container', tab_items.find(tab => tab.is_active === true).view())
        ])
    }
}


/**
 *
 * @param {TabContent} tab
 */
function tab_content(tab) {
    if (!tab.title) {
        throw new Error('Missing title in tab')
    }
    if (!tab.vnode) {
        throw new Error('Missing content in tab')
    }

}