import { apiClient } from "../config/axiosConfig";
import axios from "axios";

class Student {
  async getStudentData() {
    return await apiClient.get("/api/v1/student/get-current-student");
  }

  async getDistance(data){
    console.log("From get distance",data);
    return await apiClient.post("/api/v1/student/get-distance",data)
  }

  async applyForHostel(data) {
    console.log('Sending data to backend:', data);
    try {
      const response = await axios.post("/api/v1/student/application-form", data, {
        withCredentials: true,
      });
      console.log('Response from backend:', response);
      return response;
    } catch (error) {
      console.error('Error sending data to backend:', error);
      throw error;
    }
  }
}

const studentApiService = new Student();

export default studentApiService;
