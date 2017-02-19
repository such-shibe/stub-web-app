console.warn("Using in memory cache -\t\tdo not use in production!")

const cache = {};

function get(name) {
    let value = cache[name];
    return value ? Promise.resolve(cache[name]) : 
                   Promise.reject(name + "not defined");
}

function set(name, value) {
    cache[name] = value;

    return Promise.resolve(value);
}

module.exports = {
    get: get,
    set: set
};
