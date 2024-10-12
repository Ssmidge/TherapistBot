// Makeshift caching system
export default class Cache {
    cache: Map<string, any>;
    timeStamps: Map<string, number>;

    constructor() {
        this.cache = new Map();
        this.timeStamps = new Map();
    }

    get(key: string) {
        return this.cache.get(key);
    }

    set(key: string, value: any) {
        this.cache.set(key, value);
        this.timeStamps.set(key, Date.now());
    }

    has(key: string) {
        return this.cache.has(key);
    }

    delete(key: string) {
        this.cache.delete(key);
        this.timeStamps.delete(key);
    }

    clear() {
        this.cache.clear();
        this.timeStamps.clear();
    }

    getKeys() {
        return this.cache.keys();
    }

    getValues() {
        return this.cache.values();
    }

    getEntries() {
        return this.cache.entries();
    }

    getCacheSize() {
        return this.cache.size;
    }
}