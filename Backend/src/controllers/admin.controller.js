import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getCurrentAdmin = asyncHandler(async (req, res) => {
    //if admin1 fetch all data from all hostel
    //if admin2 fetch for the assigned hostel

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { user: { ...req.user } },
                "Admin data fetched successfully"
            )
        );
});

export {getCurrentAdmin}