import { apiClient } from "../config/axiosConfig";

class Admin {
    async getAdminData(){
        return await apiClient.get("/api/v1/admin/get-current-admin")
    }

    async updateAdminEmail(data){
        return await apiClient.post("/api/v1/admin/update-admin-email",data)
    }

    async runAllocation(){
        return await apiClient.post("/api/v1/allot")
    }

    async addHostel(data){
        return await apiClient.post("api/v1/hostel",data)
    }

    async addRooms(data){
        return await apiClient.post("api/v1/rooms",data)
    }

    async getAllhostels(){
        return await apiClient.get("api/v1/hostels")
    }

    async getAllrooms(){
        return await apiClient.get("api/v1/all-rooms")
    }
}

const adminApiService = new Admin()

export default adminApiService