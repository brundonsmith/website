
const { DOMAIN, BASE_URL } = require('./utils/constants')

const redirect = (req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https' || req.hostname !== DOMAIN) {
        return res.redirect(301, BASE_URL + req.originalUrl);
    } else {
        return next();
    }
}

module.exports = redirect;