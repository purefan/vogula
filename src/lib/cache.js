/**
 * @typedef CacheItem
 * @description An object that stores cached values
 * @property {Number} dies_at - Timestamp in seconds when this item is no longer valid
 * @property {String} value - The value that this item stores
 */

/**
 * Manages cache objects which m
 */
class cache_manager {
    constructor(param) {
        this.name = param.name
        this.cache_items = this.load() || {}
    }

    get(name) {
        if (!this.cache_items[ name ]) {
            console.log(`[Cache:get(${name})] Doesnt exist`)
            delete this.cache_items[ name ]
            this.save()
            return null
        }
        const is_dead = this.cache_items[ name ].dies_at - Date.now()
        if (is_dead < 0) {
            console.log(`[Cache:get(${name})] is dead`)
            delete this.cache_items[ name ]
            this.save()
            return null
        }
        console.log(`[Cache:get(${name})] Found in cache`)
        return this.cache_items[ name ].value
    }

    /**
     *
     * @param {Object} param
     * @param {String} param.name
     * @param {String} param.value
     * @param {Date|Number} param.dies_at - timestamp-able for when the value is no longer useful
     */
    set(param) {
        console.log(`[Cache:set] ${param.name}`)
        this.cache_items[ param.name ] = param
        this.save()
    }

    save() {
        const serialized = JSON.stringify(this.cache_items)
        localStorage.setItem(`vogula.cache_manager.${this.name}`, serialized)
    }

    /**
     * Loads and deserializes a localStorage key
     * @param {String} name
     * @returns {Object}
     */
    load() {
        const serialized = localStorage.getItem(`vogula.cache_manager.${this.name}`)
        return JSON.parse(serialized)
    }

}

module.exports = cache_manager