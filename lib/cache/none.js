console.warn("Session cache disabled -\t\tdo not use in production!")

const cache = {};

function get(name) {
    return Promise.reject(name + "not defined");
}

function set(name, value) {}

module.exports = {
    get: get,
    set: set
};
