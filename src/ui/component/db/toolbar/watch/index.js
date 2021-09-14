/**
 * Opens the dialog to add/remove players to watch.
 * Players under the watch will have their games automatically imported shortly after they are played
 * Games automatically imported have their moves added to the queue with base priority 0, meaning
 * that the first move has a priority of 0 + 37
 */


import modal from '../../../../../lib/modal.js'
import request from '../../../../../lib/request.js'
import Game from '../../../../../lib/game.js'
import debug from 'debug'

let newest_games = {
    lichess: null
    , chesscom: null
}

/**
 * @type {Array<String>}
 */
let existing_urls = JSON.parse(localStorage.getItem('vogula.db.watch.urls') || '[]')

export default {
    show_modal
    , run_check
}

/**
 * This function is triggered every minute by the cron system
 *
 */
function run_check() {
    console.log('db.watch.run_check')
    JSON.parse(localStorage.getItem('vogula.db.watch.urls') || '[]').map(process_url)
}

/**
 *
 * @param {String} url
 */
async function process_url(url) {
    const parts = new URL(url)
    if (is_lichess_url(url)) {
        const username = url
            .replace('https://', '')
            .replace('http://', '')
            .replace('lichess.org/@/', '')
        const game = await get_newest_game_in_db({ username, source: 'lichess.org' })
        const new_games = await fetch_new_games_in_lichess({ game, username })
        await import_games(new_games)
    }

    if (is_chesscom_url(url)) {
        check_for_new_games_in_chesscom(url)
    }
}

/**
 *
 */
async function import_games(param) {

}

/**
 *
 * @param {Object} param
 * @param {String} param.username
 * @param {String} param.source
 */
async function get_newest_game_in_db(param) {
    const result = await request({
        url: 'http://montglane.com/game'
        , method: 'get'
        , params: {
            source: param.source
            , white_player: param.username
            , players_relation: 'OR'
            , sort_by_newest: true
            , limit: 1
        }
    })
    debug('newest game', result)
    const newest = new Game(result)
    return newest
}

/**
 * Finds games newer than param.game played by param.username
 * @param {Object} param
 * @param {Game} param.game
 * @param {String} param.username
 */
async function fetch_new_games_in_lichess(param) {
    const lichess_params = {
        url: `https://lichess.org/api/games/user/${param.username}`
        , method: 'get'
        , params: {
            max: 1
        }
    }

    if (param.game.timestamp > 0) {
        lichess_params.params.since = param.game.timestamp
    }
    debug('Fetching from lichess with params', lichess_params)
    const result = await request(lichess_params)
    debug('fetched from lichess', result)
    return result

}

function is_lichess_url(url) {
    return (new URL(url)).host.toLowerCase().includes('lichess.org')
}

function is_chesscom_url(url) {
    return (new URL(url)).host.toLowerCase().includes('chess.com')
}

/**
 *
 * @param {Event} e
 */
function show_modal(e) {
    modal.content = m('div.db-watch-modal', [
        m('p', `Enter the url(s) to player\'s profiles in either lichess or chess.com.
                Vogula will monitor these profiles and auto-import the games played.
                Games automatically imported will have their moves automatically analyzed, although with a lower
                priority than moves entered manually.`)
        , m('div.table', [
            existing_urls.map(make_editable_list)
            , m('div.tr', [
                m('div.td', m('input', {
                    type: 'text',
                    id: 'db.watch.modal.input',
                    placeholder: 'Add another here',
                    onblur: e => {
                        console.log('----->', e)
                        store_new_url(e.target.value)
                        e.target.value = ''
                    }
                }))
            ])
        ])
    ])
    modal.state = 'visible'
}

/**
 *
 * @param {String} url
 */
function store_new_url(url) {
    url = clean_url(url)
    validate_url(url)
    existing_urls.push(url)
    localStorage.setItem('vogula.db.watch.urls', JSON.stringify(existing_urls))
    document.getElementById('db.watch.modal.input').classList.remove('error')
    show_modal()
}

function validate_url(url) {
    const a = document.createElement('a')
    a.href = url
    if (!a.protocol.includes('http')) {
        document.getElementById('db.watch.modal.input').classList.add('error')
        throw new Error('invalid url: ' + url)
    }
    if (!a.host.includes('chess.com') && !a.host.includes('lichess')) {
        document.getElementById('db.watch.modal.input').classList.add('error')
        throw new Error('Only lichess and chess.com are supported')
    }

    if (existing_urls.find(stored => stored == url)) {
        document.getElementById('db.watch.modal.input').classList.add('error')
        throw new Error('URL already exists.')
    }
}

function remove_url(e) {
    const idx = existing_urls.findIndex(val => val == e.target.attributes[ 'data-url' ].value)
    if (idx < 0) {
        throw new Error('url not found when removing')
    }

    existing_urls.splice(idx, 1)
    localStorage.setItem('vogula.db.watch.urls', JSON.stringify(existing_urls))
    show_modal()
}

/**
 * removes trailing slash for consistency
 * @param {String} url
 */
function clean_url(url) {
    return url.replace(/\/$/, '')
}

/**
 *
 * @param {String} url
 */
function make_editable_list(url) {
    console.log('Making editable', url)
    return m('div.tr', [
        m('div.td', url)
        , m('div.td.remove', m('button', {
            onclick: remove_url,
            'data-url': url
        }, 'X'))
    ])
}