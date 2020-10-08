/**
 * Wrapper on top of m.request to respect caching directives
 */
const cache_manager = require('./cache')
const cache = new cache_manager({ name: 'network' })
const m = require('mithril')
const debug = require('debug')('vogula:lib:request')
module.exports = request

/**
 *
 * @param {Object} param
 * @param {String} param.method
 * @param {Object} param.headers
 * @param {String} param.url
 * @param {Object} [param.body]
 * @param {Object} [param.config]
 */
async function request(param) {
    const log = debug.extend('request')
    const cache_key = JSON.stringify(param)
    let result = null
    if (localStorage.getItem('settings.engine.resker.cache.enabled') === 'true') {
        result = cache.get(cache_key)
        if (result) {
            log('Found and returning', result)
            result.from_cache = true
            m.redraw()
            return result
        }
    }

    result = await m.request(Object.assign({}, param, {extract}))
    expire_cache_if_needed(param)
    store_in_cache({param: Object.assign({}, param, {cache_key}), result})


    log('result', result)

    return result
}

function extract (xhr, options) {
    const log = debug.extend('extract')
    let ttl = 60 // 1 minute
    const cache_control = xhr.getResponseHeader('cache-control')
    if (cache_control) {
        const parts = cache_control.split('=')
        if (parts[ 1 ]) {
            ttl = parts[ 1 ]
            xhr.vogula_ttl = ttl
            log('Overriding default cache-control with response cache-control', ttl)
        }
    }
    try {
        return JSON.parse(xhr.response)
    } catch (error) {
        return {}
    }
}


function expire_cache_if_needed(param) {
    const log = debug.extend('expire_cache_if_needed')
    if (param.method.toLowerCase() == 'post') {
        const cache_key_for_get = JSON.stringify({
            headers: param.headers,
            method: 'GET',
            url: param.url
        })
        log('Expiring the GET version of a POST request')
        cache.expire(cache_key_for_get)
    }
}

function store_in_cache({param, result}) {
    const log = debug.extend('store_in_cache')
    if (localStorage.getItem('settings.engine.resker.cache.enabled') !== 'true') {
        log('Cache is disabled, not storing in cache')
        return false
    }
    const ttl = result.vogula_ttl || 60
    log('param', param)
    if (param.method.toLowerCase() == 'get') {
        const ttl_param = Date.now() + Number(ttl)
        log(`Storing a GET request in cache with ttl: ${ttl_param}`)
        if (result)
            cache.set({ name: param.cache_key, value: result, ttl: ttl_param })
    }
}