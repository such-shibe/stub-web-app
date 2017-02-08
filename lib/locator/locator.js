const assert = require("assert");
const container = {};

function register(name, service) {
    assert(typeof name !== "undefined", "service name is undefined");
    assert(typeof service !== "undefined", "service is undefined");
    assert(typeof container[name] === "undefined",
            name + " is already a registered service");

    container[name] = service;
}

function get(name) {
    assert(typeof container[name] !== "undefined",
            name + " is not a registered service");

    return container[name]
}

module.exports = {
    register: register,
    get: get
};
