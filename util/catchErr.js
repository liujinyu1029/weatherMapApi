const _resBody = err => {
    return {
        ret: 0,
        error: {
            message: err.message,
            stack: err.stack
        }
    }
}

module.exports = {
    _resBody,
    
}
