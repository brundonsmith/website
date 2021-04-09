
const { DOMAIN, BASE_URL } = require('./utils/constants')

const redirect = (req, res, next) => {
    if (req.protocol !== 'https' || req.hostname !== DOMAIN) {
        console.log("REDIRECTING TO '" + BASE_URL + req.originalUrl + "'")
        res.redirect(301, BASE_URL + req.originalUrl);
    } else {
        next();
    }
}

module.exports = redirect;