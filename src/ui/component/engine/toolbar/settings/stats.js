import Debug from 'debug'
const debug = Debug('engine:toolbar:settings:stats')

function Stats() {
    let vnode = m('p', 'not loaded yet')
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

    function make_vnode(stats) {
        if (!stats.completed) {
            return m('div', 'No stats yet, click the button')
        }
        return vnode = m('div.scroll-vertical', [
            m('div.stat_row.completed', [ m('span', 'Completed'), stats.completed ]),
            m('div.stat_row.in-progress', [ m('span', 'In progress'), make_vnode_in_progress(stats.processing) ]),
            m('div.stat_row.to-do', [ m('span', 'To do'), make_vnode_to_do(stats.to_do) ])
        ])
    }
    return {
        get,
        title: 'Stats',
        id: 'stats',
        view: () => {
            return m('div.table', [
                m('div.tr.stats', [
                    m('div.td', m('button', { onclick: get }, 'Get Stats')),
                    m('div.td', make_vnode(stats))
                ])
            ])
        }
    }
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
        return m('div', { class: 'in_progress' }, [
            m('img', {
                src: `https://chessboardimage.com/${position._id}.png`
            }),
            m('div.notes', `Created on ${new Date(position.created || 1).toISOString().substring(0, 19).replace('T', ' ')}, in progress by ${position.client} since ${new Date(position.updated).toISOString().substring(0, 19).replace('T', ' ')}`)
        ])
    })
}

/**
 *
 * @param {*} positions
 */
function make_vnode_to_do(positions) {
    const next = positions.reduce((acc, curr) => {
        if (acc.priority < curr.priority) {
            acc = curr
        }
        return acc
    }, { priority: 0 })
    const top_3 = positions.sort((a, b) => Number(a) - Number(b)).slice(0, 3)
    return m('div', { class: 'to_do' }, [
        m('img', { src: `https://chessboardimage.com/${next._id}.png` }),
        m('div', `Total left: ${positions.length}`)
    ])
}

export default new Stats()