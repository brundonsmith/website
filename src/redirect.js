
const { DOMAIN, BASE_URL } = require('./utils/constants')

const redirect = (req, res, next) => {
    if (req.protocol !== 'https' || req.hostname !== DOMAIN) {
        res.redirect(301, BASE_URL + req.path);
    }

    next();
}

module.exports = redirect;