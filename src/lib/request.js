/**
 * Wrapper on top of m.request to respect caching directives
 */
const cache_manager = require('./cache')
const cache = new cache_manager({ name: 'network' })
const m = require('mithril')

module.exports = request


async function request(param) {
    const key = JSON.stringify(param)
    let result = cache.get(key)
    if (result) {
        console.log('[Cache] found and returning', result)
        result.from_cache = true
        m.redraw()
        return result
    }

    if (param.extract) {
        throw new Error('Todo: Implement parallel extract in network layer')
    }
    console.log('[Cache] Not found and requesting')
    let ttl = 60 // 1 minute
    param.extract = (xhr, options) => {
        const cache_control = xhr.getResponseHeader('cache-control')
        if (cache_control) {
            const parts = cache_control.split('=')
            if (parts[ 1 ]) {
                ttl = parts[ 1 ]
            }
        }
        try {
            return JSON.parse(xhr.response)
        } catch (error) {
            return {}
        }
    }
    result = await m.request(param)
    if (param.method.toLowerCase() == 'post') {
        const cache_key_for_get = JSON.stringify({
            headers: param.headers,
            method: 'GET',
            url: param.url
        })
        console.log('[Cache::Network] Expiring the GET version of a POST request')
        cache.expire(cache_key_for_get)
    } else if (param.method.toLowerCase() == 'get') {
        const ttl_param = Date.now() + Number(ttl)
        console.log(`[Cache::Network] Storing a GET request in cache with ttl: ${ttl_param}`)
        if (result)
            cache.set({ name: key, value: result, ttl: ttl_param })
    }

    console.log('[Cache::Network] result', result)

    return result
}
