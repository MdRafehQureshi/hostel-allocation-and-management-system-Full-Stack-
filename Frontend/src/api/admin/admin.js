import { apiClient } from "../config/axiosConfig";

class Admin {
    async getAdminData(){
        return await apiClient.get("/api/v1/admin/get-current-admin")
    }

    async updateAdminEmail(data){
        return await apiClient.post("/api/v1/admin/update-admin-email",data)
    }
}

const adminApiService = new Admin()

export default adminApiService