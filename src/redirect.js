
const { DOMAIN, BASE_URL } = require('./utils/constants')

const redirect = (req, res, next) => {
    console.log(
        `req.secure: ${req.secure}`,
        `req.hostname: ${req.hostname}`,
        `DOMAIN: ${DOMAIN}`,
        `!req.secure || req.hostname !== DOMAIN | `,
        !req.secure || req.hostname !== DOMAIN
    )
    if (!req.secure || req.hostname !== DOMAIN) {
        console.log("REDIRECTING TO '" + BASE_URL + req.originalUrl + "'")
        return res.redirect(301, BASE_URL + req.originalUrl);
    } else {
        return next();
    }
}

module.exports = redirect;