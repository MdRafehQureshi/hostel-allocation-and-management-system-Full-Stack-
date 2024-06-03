function asyncHandler(requestHandler) {
    return async (req, res, next) => {
        try {
            await requestHandler(req, res);
        } catch (error) {
            next(error);
        }
    };
}

export { asyncHandler };
