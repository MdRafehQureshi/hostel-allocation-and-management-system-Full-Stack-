import { apiClient } from "../config/axiosConfig"

class Auth {

    async generateOtp(data){
        return await apiClient.post("/auth/get-otp",data)
    }
    async studentSignup(data){
        return await apiClient.post("/student/student-registration",data)
    }

    async login(data){
        return await apiClient.post("/auth/login",data)
    }

    async logout(){
        return await apiClient.post("/auth/logout")
    }

}

const authApiService = new Auth()

export default authApiService