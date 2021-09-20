import TabManager from '../../../../../lib/tab'
import Config from './config'
import Stats from './stats'

import './index.scss'

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

export default Settings
