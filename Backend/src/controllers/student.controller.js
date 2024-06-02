import asyncHandler from "../utils/asyncHandler.js";

const submitApplication = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "OK",
    });
});

export { submitApplication };
