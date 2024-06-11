import { apiClient } from "../config/axiosConfig";
import axios from "axios" 

class Student{
    async getStudentData(){
        return await apiClient.get("/api/v1/student/get-current-student")
    }
    async applyForHostel(data){
        return await axios.post("/api/v1/student/application-form",data,{
            headers: {
             "Content-type":"multipart/form-data"    
            }
        })
    }
}

const studentApiService = new Student()

export default studentApiService