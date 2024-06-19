import Container from "./Container";
import Input from "./Input";
import Button from "./Button";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import authService from "../api/auth/auth";
import studentService from "../api/student/student";
import { login, logout } from "../features/authSlice";
import adminService from "../api/admin/admin";

function LogInComp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function onSubmit(data) {
    try {
      setLoading(true);
      setError(null);
      const res = await authService.login(data);
      console.log("Login response", res);
      if (res.data) {
        if (res.data.data.user.role === "student") {
          const userData = await studentService.getStudentData();
          dispatch(login(userData.data));
          if(!res.data.data.user.resident_id){
          navigate("/student/application-form");
        }
      }else if(res.data.data.user.role === "admin1"){
        const userData = await adminService.getAdminData()
        dispatch(login(userData.data))
        navigate("/admin/admin-profile")
      }
        else{
          dispatch(logout())
          navigate("/")
        }
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      setError(error);
    }
  }

  return (
    <Container className="flex flex-col items-center sm:justify-center">
      <div className="w-full pb-5 bg-white shadow-md sm:w-2/6 sm:rounded-2xl">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-center justify-center"
        >
          <h2 className="my-2 text-xl font-medium tracking-wide text-gray-600 sm:pt-2 ">
            Login
          </h2>
          <Input
            label={"Email"}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Invalid email address",
              },
            })}
            error={errors.email}
          />

          <Input
            type="password"
            label={"Password"}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long",
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/,
                message:
                  "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
              },
            })}
            error={errors.password}
          />
          <Button
            type="submit"
            disabled={loading === true}
            onSubmit={handleSubmit(onSubmit)}
            className={`w-[90%] py-2 mt-5 text-center text-white duration-300 bg-gray-600 rounded-md sm:py-1 active:opacity-80 sm:active:hover:scale-110 disabled:bg-gray-400 `}
          >
            {loading ? "Logging in.." : "Login"}
          </Button>
          {error && (
            <p className="my-1 text-xs font-medium text-red-600">
              {error.response.data.message}
            </p>
          )}
          <div className="w-full pt-1 pl-7 ">
            <button
              type="button"
              className="text-xs font-semibold text-gray-400"
            >
              Forgot password?
            </button>
          </div>
        </form>
      </div>
    </Container>
  );
}

export default LogInComp;
