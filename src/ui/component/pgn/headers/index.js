import stream from 'mithril/stream'
import './index.scss'

// This will probably bug
import moves from '../moves'

// 7 Tag Roster http://www.saremba.de/chessgml/standards/pgn/pgn-complete.htm
// 'Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result'

const pgn_headers = {
    make_default_headers,
    //data: stream(),
    times: {
        white: '00:00:00',
        black: '00:00:00'
    },
    set_headers,
    headers: stream(make_default_headers()),
    view: () => {
        const current_move = moves.move_list.moves[ moves.current_move() ]
        if (current_move.is_white_move && current_move.clk) {
            pgn_headers.times.white = current_move.clk
        }

        if (!current_move.is_white_move && current_move.clk) {
            pgn_headers.times.black = current_move.clk
        }

        return [
            m('div.header-group', { 'data-group_name': 'event' }, [
                pgn_headers.headers().Event ? m('span.header.event', pgn_headers.headers().Event) : null,
                pgn_headers.headers().Site ? m('span.header.site', pgn_headers.headers().Site) : null
            ]),
            m('div.header-group', { 'data-group_name': 'game' }, [
                pgn_headers.headers().White ? m('span.header.white', pgn_headers.headers().White) : null,
                pgn_headers.headers().Result ? m('span.header.result', pgn_headers.headers().Result) : null,
                pgn_headers.headers().Black ? m('span.header.black', pgn_headers.headers().Black) : null ]),
            m('div.header-group', { 'data-group_name': 'time' }, [
                pgn_headers.headers().Round ? m('span.header.round', pgn_headers.headers().Round) : null,
                pgn_headers.headers().Date ? m('span.header.date', pgn_headers.headers().Date) : null ]),
            m('div.header-group', { 'data-group_name': 'clock' }, [
                m('span.header.white_time', pgn_headers.times.white),
                m('span.header.black_time', pgn_headers.times.black)
            ])
        ]
    }
}

function set_headers(param) {
    Object.keys(param).map(key => pgn_headers.headers()[ key ] = param[ key ])
}

function make_default_headers() {
    return {
        Event: 'Event',
        Site: 'Site',
        White: 'White, Player',
        Result: '1/2-1/2',
        Black: 'Black, Player',
        Round: 1,
        Date: '2010.10.01',
        time: {
            white: '',
            black: ''
        }
    }
}

export default pgn_headers
