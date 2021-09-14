import('./index.css')

function make_tooltip(message) {
    return m('a', { 'data-tooltip': message }, m('img.tooltip', { src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' }))
}


export default make_tooltip