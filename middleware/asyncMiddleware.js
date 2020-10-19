function asyncMiddleware (handler) {
    return (req, res, next) => {
        try {
            await handler(req, res);
        }
        catch (ex) {
            next(ex);
        }
    }
}

module.exports = asyncMiddleware;