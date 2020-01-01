const m = require('mithril')
const stream = require('mithril/stream')
require('./index.scss')

const pgn_headers = {
    valid_tags: [
        'Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result' // 7 Tag Roster http://www.saremba.de/chessgml/standards/pgn/pgn-complete.htm
    ],
    data: stream({
        Event: 'Event',
        Site: 'Site',
        White: 'White, Player',
        Result: '1/2-1/2',
        Black: 'Black, Player',
        Round: 2,
        Date: '2010.10.01'
    }),
    view: () => [
        m('div.header-group', { 'data-group_name': 'event' }, [
            pgn_headers.data().Event ? m('span.header.event', pgn_headers.data().Event) : null,
            pgn_headers.data().Site ? m('span.header.site', pgn_headers.data().Site) : null
        ]),
        m('div.header-group', { 'data-group_name': 'game' }, [
            pgn_headers.data().White ? m('span.header.white', pgn_headers.data().White) : null,
            pgn_headers.data().Result ? m('span.header.result', pgn_headers.data().Result) : null,
            pgn_headers.data().Black ? m('span.header.black', pgn_headers.data().Black) : null ]),
        m('div.header-group', { 'data-group_name': 'time' }, [
            pgn_headers.data().Round ? m('span.header.round', pgn_headers.data().Round) : null,
            pgn_headers.data().Date ? m('span.header.date', pgn_headers.data().Date) : null ])
    ]
}

module.exports = pgn_headers