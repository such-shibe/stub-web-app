const env    = process.env;

const config = {
    GH_CLIENT_ID:       env.GH_CLIENT_ID,
    GH_CLIENT_SECRET:   env.GH_CLIENT_SECRET,
    
    SESSION_SECRET:     env.OPENSHIFT_SECRET_TOKEN,

    PORT:               env.OPENSHIFT_NODEJS_PORT,
    IP:                 env.OPENSHIFT_NODEJS_IP
};

module.exports = config;
