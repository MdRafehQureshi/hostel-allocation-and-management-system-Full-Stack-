import { apiClient } from "../config/axiosConfig";
import axios from "axios";
class Admin {
    
    async getAdminData(){
        return await apiClient.get("/api/v1/admin/get-current-admin")
    }

    async updateAdminEmail(data){
        return await apiClient.post("/api/v1/admin/update-admin-email",data)
    }

    async runAllocation(){
        return await apiClient.post("/api/v1/admin/allot")
    }

    async addHostel(data){
        return await apiClient.post("/api/v1/admin/hostel",data)
    }

    async addRooms(data){
        return await apiClient.post("/api/v1/admin/rooms",data)
    }

    async getAllHostels(){
        return await apiClient.get("/api/v1/admin/hostels")
    }

    async getAllRooms(){
        return await apiClient.get("/api/v1/admin/all-rooms")
    }
    
    async getAllActiveResidents(){
        return await apiClient.get("/api/v1/admin/all-active-residents")
    }

    async getAllActiveApplicants(){
        return await apiClient.get("/api/v1/admin/all-active-applicants")
    }


}

const adminApiService = new Admin()

export default adminApiService