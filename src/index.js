import Base from './ui/base/index.js'
import './index.scss'

const routes = {
    '/': Base
}

m.route(document.body, '/', routes)
