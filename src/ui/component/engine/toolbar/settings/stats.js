import Debug from 'debug'
const debug = Debug('engine:toolbar:settings:stats')
import Board from '../../../board/chessground/index'

function Stats() {
    let stats = {}

    async function get() {
        const log = debug.extend('get')
        const res = await m.request({
            url: localStorage.getItem('settings.engine.resker.host') + '/stats',
            method: 'GET',
            resker_client: localStorage.getItem('settings.engine.resker.client'),
            headers: {
                'x-api-key': localStorage.getItem('settings.engine.resker.api_key'),
                resker_client: localStorage.getItem('settings.engine.resker.client')
            }
        })
        log('Received', res)
        stats = res
    }

    async function release(fen) {
        await m.request({
            url: localStorage.getItem('settings.engine.resker.host') + '/position/status',
            method: 'PUT',
            resker_client: localStorage.getItem('settings.engine.resker.client'),
            headers: {
                'x-api-key': localStorage.getItem('settings.engine.resker.api_key'),
                resker_client: localStorage.getItem('settings.engine.resker.client')
            },
            body: {
                fen,
                status: 0
            }
        })
        await get()
    }

    /**
 * @todo there is a bug, some positions do not have a created field and it fails when
 * displaying stats. Probably from when the field didnt exist.
 */
    /**
     * Makes the vnodes to display the current positions being processed
     * @param {Array<Position>} positions
     * @returns {Mithril/vnode}
     */
    function make_vnode_in_progress(positions) {
        const log = debug.extend('make_vnode_in_progress')
        return positions.map(position => {
            log('position', position)
            return m('div', { class: 'in_progress table' }, [
                m('div.tr', [
                    m('div.td', m(Board.make_one_off({ fen: position._id }))),
                    m('div.td', m('ul.notes',
                        [
                            m('li', `Created on ${new Date(position.created || 1).toISOString().substring(0, 19).replace('T', ' ')}`)
                            , m('li', `In progress by ${position.client}`)
                            , m('li', `Running since ${new Date(position.updated).toISOString().substring(0, 19).replace('T', ' ')}`)
                            , m('li', `FEN: ${position._id}`)
                            , m('li', m('button', { onclick: () => release(position._id) }, 'Release'))
                        ]
                    ))
                ]),
                m('div.tr', m('div.td', m('th')))
            ])
        })
    }

    function make_vnode() {
        if (!stats.completed) {
            return m('div', 'No stats yet, click the button')
        }
        return m('div.scroll-vertical', [
            m('div.stat_row.completed', [
                m('span', 'Completed:', stats.completed)
                , m('span', `Processing: ${stats.processing.length}/${stats.to_do.length}`)
            ]),
            m('div.stat_row.in-progress', [ m('span', 'In progress'), make_vnode_in_progress(stats.processing) ])
        ])
    }
    return {
        // get, unnecessary
        title: 'Stats',
        id: 'stats',
        view: () => {
            return m('div.table', [
                m('div.tr', [
                    m('div.td', m('button', { onclick: get }, 'Get Stats'))
                ]),
                m('div.tr.stats', [
                    m('div.td', make_vnode())
                ])
            ])
        }
    }
}

export default new Stats()