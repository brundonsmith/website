
const { DOMAIN, BASE_URL } = require('./utils/constants')

const redirect = (req, res, next) => {
    console.log(req.protocol, req.hostname)
    if (req.protocol !== 'https' || req.hostname !== DOMAIN) {
        res.redirect(301, BASE_URL + req.originalUrl);
    } else {
        next();
    }
}

module.exports = redirect;