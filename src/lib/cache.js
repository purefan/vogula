import Debug from 'debug'
const debug = Debug('vogula:lib:cache')

/**
 * @description An object that stores cached values
 * @property {Number} ttl - Timestamp in seconds when this item is no longer valid
 * @property {String} value - The value that this item stores
 */
class cache_manager {
    constructor(param) {
        this.name = param.name
        this.cache_items = this.load() || {}
        this.max_items = 1000 // premature optimization?
        this.log = debug.extend('manager')
    }

    get(name) {
        const log = this.log.extend(`get(${name})`)
        if (!this.cache_items[ name ] ||
            !this.cache_items[ name ].value || this.cache_items[ name ] == null ||
            !this.cache_items[ name ].ttl || this.cache_items[ name ].ttl == null) {
            log(`[cache:get] Doesnt exist`)
            this.expire(name)
            return null
        }
        const is_dead = this.cache_items[ name ].ttl - Date.now()
        if (is_dead < 0) {
            log(`[cache:get] is dead ( ${this.cache_items[ name ].ttl} - ${Date.now()} = ${is_dead})`)
            this.expire(name)
            return null
        }
        const value = this.cache_items[ name ].value
        // Check that value has more than just "from_cache"
        if (Object.keys(value).filter(key => key != 'from_cache').length < 1) {
            log('[cache:get] is useless')
            this.expire(name)
            return null
        }

        log(`[cache:get] Found in cache`, this.cache_items[ name ])
        return this.cache_items[ name ].value
    }

    /**
     * Removes an entry from cache
     * @param {String} name
     */
    expire(name) {
        const log = this.log.extend('expire')
        log(`Expiring ${name}`)
        delete this.cache_items[ name ]
        this.save()
        log('Done')
    }

    /**
     * Sets and saves a new key in cache. It only saves if there's more than "from_cache" to save
     * @param {Object} param
     * @param {String} param.name
     * @param {String} param.value
     * @param {Date|Number} param.ttl - timestamp-able for when the value is no longer useful
     */
    set(param) {
        this.log(`[Cache:set] ${param.name}`)
        if (!param.ttl) {
            throw new Error('Must have ttl for cache')
        }
        this.cache_items[ param.name ] = new cache_item(param)
        this.save()
    }

    save() {
        const serialized = JSON.stringify(this.cache_items)
        localStorage.setItem(`vogula.cache_manager.${this.name}`, serialized)
    }

    /**
     * Loads and deserializes a localStorage key
     * @returns {Object}
     */
    load() {
        const serialized = localStorage.getItem(`vogula.cache_manager.${this.name}`) || '{}'
        return JSON.parse(serialized)
    }

}

function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds.toFixed(0);
}

class cache_item {
    constructor(param) {
        this.created_at = Date.now()
        this.value = param.value
        this.ttl = param.ttl
        this.valid_for = millisToMinutesAndSeconds(param.ttl - this.created_at)
    }

    get() {
        return this.value
    }
}

export default cache_manager
