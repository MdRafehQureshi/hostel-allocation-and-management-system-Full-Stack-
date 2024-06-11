import { apiClient } from "../config/axiosConfig";
import axios from "axios" 

class Student{
    async getStudentData(){
        return await apiClient.get("/student/get-current-student")
    }
    async applyForHostel(data){
        return await axios.post("/student/application-form",data,{
            headers: {
             "Content-type":"multipart/form-data"    
            }
        })
    }
}

const studentApiService = new Student()

export default studentApiService