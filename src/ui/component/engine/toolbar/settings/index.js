const m = require('mithril')
require('./index.scss')

const Settings = {
    state: 'hidden',
    view: () => m('div', { class: `modal ${Settings.state}` }, m('div.modal-content', [
        m('button.close-modal', { onclick: e => Settings.state = 'hidden' }, 'Close'),
        m('div.table', [
            m('div.tr', [
                m('div.td', 'Resker Host:'),
                m('div.td', m('input', {
                    type: 'text',
                    title: 'Full url with port if needed',
                    onkeyup: e => localStorage.setItem('settings.engine.resker.host', e.target.value),
                    value: localStorage.getItem('settings.engine.resker.host')
                }))
            ]),
            m('div.tr', [
                m('div.td', 'Resker Automatic Depth Goal:'),
                m('div.td', m('input', {
                    type: 'text', onkeyup: e => localStorage.setItem('settings.engine.resker.auto_depth_goal', e.target.value),
                    value: localStorage.getItem('settings.engine.resker.auto_depth_goal')
                }))
            ]),
            m('div.tr', [
                m('div.td', 'Resker Automatic MultiPV Goal:'),
                m('div.td', m('input', {
                    type: 'text', onkeyup: e => localStorage.setItem('settings.engine.resker.auto_multipv_goal', e.target.value),
                    value: localStorage.getItem('settings.engine.resker.auto_multipv_goal')
                }))
            ]),
            m('div.tr', [
                m('div.td', 'Resker Api Key:'),
                m('div.td', m('input', {
                    type: 'text', onchange: e => {
                        localStorage.setItem('settings.engine.resker.api_key', e.target.value)
                    },
                    value: localStorage.getItem('settings.engine.resker.api_key')
                }))
            ]),
            m('div.tr', [
                m('div.td', 'Resker Client Name:'),
                m('div.td', m('input', {
                    type: 'text', onchange: e => {
                        localStorage.setItem('settings.engine.resker.client', e.target.value)
                    },
                    value: localStorage.getItem('settings.engine.resker.client')
                }))
            ]),
            m('div.tr', [
                m('div.td', 'Resker Enabled:'),
                m('div', { class: 'td onoff' }, [
                    m('input.onoff', {
                        type: 'checkbox',
                        id: 'resker_onoff',
                        value: localStorage.getItem('settings.engine.resker.enabled'),
                        checked: localStorage.getItem('settings.engine.resker.enabled'),
                        onchange: e => localStorage.setItem('settings.engine.resker.enabled', e.target.value)
                    }),
                    m('label.onoff', { for: 'resker_onoff' })
                ])
            ]),
            m('div.tr', [
                m('div.td', m('button', { onclick: test_resker }, 'Test Resker')),
                m('div.td', Settings.resker_test_result)
            ])
        ])
    ])),
    show: () => {
        Settings.state = 'visible'
        m.redraw()
    }
}

/**
 * Sends a network request to resker
 */
async function test_resker() {
    try {
        Settings.resker_test_result = await m.request({
            url: localStorage.getItem('settings.engine.resker.host') + '/version',
            method: 'GET',
            resker_client: localStorage.getItem('settings.engine.resker.client')
        })

    } catch (error) {
        Settings.resker_test_result = error
    }
}

module.exports = Settings