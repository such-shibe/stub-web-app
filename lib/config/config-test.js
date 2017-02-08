const env    = process.env;

const config = {
    GH_CLIENT_ID:       env.GH_CLIENT_ID,
    GH_CLIENT_SECRET:   env.GH_CLIENT_SECRET,
    
    SESSION_SECRET:     "test-session-secret",

    PORT:               "3000",
    IP:                 "127.0.0.1"
};

module.exports = config;
