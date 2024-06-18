import { apiClient } from "../config/axiosConfig";

class Auth {
  async generateOtp(data) {
    return await apiClient.post("/api/v1/auth/get-otp", data);
  }
  async studentSignup(data) {
    try {
      const result = await apiClient.post("/api/v1/student/student-registration", data);
      if (result) {
        return await this.login({ email: data.email, password: data.password });
      }
    } catch (error) {
      throw error;
    }
  }

  async login(data) {
    return await apiClient.post("/api/v1/auth/login", data);
  }

  async logout() {
    return await apiClient.post("/api/v1/auth/logout");
  }

  async refreshAccessToken(){
    return await apiClient.post("api/v1/auth/access-token");
  } 

}

const authApiService = new Auth();

export default authApiService;
