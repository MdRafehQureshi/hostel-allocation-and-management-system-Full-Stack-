import { apiClient } from "../config/axiosConfig";

class Admin {
    async getAdminData(){
        return await apiClient.get("/api/v1/admin/get-current-admin")
    }
}

const adminApiService = new Admin()

export default adminApiService