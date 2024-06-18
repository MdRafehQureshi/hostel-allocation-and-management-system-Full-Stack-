import { useEffect, useLayoutEffect, useState } from "react";
import Container from "./Container";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import studentService from "../api/student/student";
import { login,logout } from "../features/authSlice"

function ApplicationStatusComp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const studentData = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        setLoading(true);
        const student = await studentService.getStudentData();
        console.log("Get current student from application status",student);
        dispatch(login(student.data));
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log("Error from Get current student from application status",error);
        setError(error);
        if(error.response.status === 401||error.response.status===404){
            dispatch(logout())
            navigate("/login")
        }
      }
    })();
  }, [dispatch,navigate,]);

  if (!studentData) {
    return <Container><div>No data available</div></Container>;
  }

  const isFormSubmitted = studentData.application_status !== null &&
    studentData.application_status !== undefined &&
    studentData.application_status !== 0;

  return (
    <Container className="flex flex-col items-center sm:justify-center">
      <div className="w-full pt-2 bg-white shadow-md rounded-xl sm:w-1/4 sm:py-9">
        <h1 className="my-3 text-3xl font-medium tracking-wide text-center text-gray-600">
          Application Status
        </h1>
        <div className="flex flex-col items-start px-10 pt-6 text-sm pb-9">
          <div className="flex pb-1">
            <h4 className="font-semibold ">Student name : &nbsp;</h4>
            <p>{studentData.first_name +" "+ studentData.last_name}</p>
          </div>
          <div className="flex pb-1">
            <h4 className="font-semibold ">Form submitted :&nbsp;</h4>
            <p>{isFormSubmitted ? "Yes" : "No"}</p>
          </div>
          <div className="flex">
            <h4 className="font-semibold ">Application status :&nbsp;</h4>
            {isFormSubmitted ? (
              studentData.application_status === 1 ? (
                <p>Under process</p>
              ) : studentData.application_status === 2 ? (
                <p>Alotted</p>
              ) : studentData.application_status === 3 ? (
                <p>Rejected</p>
              ) : (
                <p>Not submitted</p>
              )
            ) : (
              <p>Not submitted</p>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}

export default ApplicationStatusComp;
