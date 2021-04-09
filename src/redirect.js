
const { DOMAIN, BASE_URL } = require('./utils/constants')

const redirect = (req, res, next) => {
    console.log(
        `req.protocol !== 'https' || req.hostname !== DOMAIN | `,
        req.protocol !== 'https' || req.hostname !== DOMAIN
    )
    if (req.protocol !== 'https' || req.hostname !== DOMAIN) {
        console.log("REDIRECTING TO '" + BASE_URL + req.originalUrl + "'")
        return res.redirect(301, BASE_URL + req.originalUrl);
    } else {
        return next();
    }
}

module.exports = redirect;