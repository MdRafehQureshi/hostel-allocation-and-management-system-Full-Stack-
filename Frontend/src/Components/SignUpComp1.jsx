import Container from "./Container";
import Input from "./Input";
import Button from "./Button";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import authService from "../api/auth/auth";
import { login } from "../features/authSlice";

function SignUpComp1() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const [emailError, setEmailError] = useState(null);
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timer, setTimer] = useState(() => {
    const savedTimer = localStorage.getItem("otpTimer");
    return savedTimer ? parseInt(savedTimer, 10) : 0;
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const email = watch("email"); // Watch the email field

  async function onSubmit(data) {
    console.log(data);
    const { confirm_password, ...signUpData } = data; //to filter out confirm password from signup data
    try {
      setError(null);
      setLoading(true);
      const userData = await authService.studentSignup(signUpData);
      if (userData.data) {
        dispatch(login(userData.data));
        navigate("/student/application-form");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("ERROR : " + error);
      setError(error);
    }
  }

  async function handleGenerateOtp() {
    setEmailError(null);
    if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email) ||
      errors.email
    ) {
      setEmailError("Invalid email address");
      // Scroll to the email field if there are errors
      document.getElementById("email").scrollIntoView({ behavior: "smooth" });
      return;
    }
    try {
      // Call the API to send the OTP here, passing the email
      setOtpLoading(true);
      await authService.generateOtp({ email });
      setOtpLoading(false);
    } catch (error) {
      setOtpLoading(false);
      console.error("ERROR : " + error);
      setOtpError(error);
    }
    setOtpGenerated(true);
    setTimer(10); // 2 minutes in seconds
    // Scroll to the bottom of the page
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  useEffect(() => {
    if (timer > 0) {
      setOtpGenerated(true);
      const countdown = setInterval(() => {
        setTimer((prevTimer) => {
          const newTimer = prevTimer - 1;
          localStorage.setItem("otpTimer", newTimer);
          return newTimer;
        });
      }, 1000);
      return () => clearInterval(countdown);
    } else {
      localStorage.removeItem("otpTimer");
    }
  }, [timer]);

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }

  return (
    <Container className="flex flex-col items-center sm:justify-center">
      <div className="w-full pb-5 bg-white shadow-md sm:w-2/5">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-center justify-center"
        >
          <h2 className="my-2 text-xl font-medium tracking-wide text-gray-600 ">
            Register As Student
          </h2>
          <Input label={"First name"} {...register("first_name")} />
          <Input label={"Last name"} {...register("last_name")} />
          <Input label={"Student Unique Id"} {...register("student_id")} />
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
          {emailError && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {emailError.response.data.message}
            </p>
          )}

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

          <Input
            type="password"
            label={"Confirm Password"}
            {...register("confirm_password", {
              required: "Confirm Password is required",
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            })}
            error={errors.confirm_password}
          />

          <p className="mt-4 font-medium">
            {timer > 0 ? `Resend OTP in ${formatTime(timer)}` : ""}{" "}
          </p>

          <div className="flex w-full px-5 justify-evenly">
            {otpGenerated && (
              <div className="relative flex flex-col my-2 mr-2 duration-200">
                <label
                  className="mb-1 text-base text-gray-700 capitalize"
                  htmlFor={"otp"}
                >
                  OTP
                </label>

                <input
                  id={"otp"}
                  {...register("otp", {
                    required: "OTP is required",
                    pattern: {
                      value: /^\d{6}$/,
                      message: "OTP must be a 6-digit number",
                    },
                  })}
                  className={`border rounded-lg text-sm border-gray-400 bg-white h-9 text-gray-800 px-3 py-2 outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none  duration-200`}
                />
                {errors.otp && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.otp.message}
                  </p>
                )}

                {/* <Input
                    className="w-4/5 "
                      label="OTP"
                      {...register('otp', { required: "OTP is required",
                      pattern: {
                        value: /^\d{6}$/,
                        message: "OTP must be a 6-digit number"
                      }
                      })}
                      error={errors.otp}
                    /> */}
              </div>
            )}

            <Button
              type="button"
              onClick={handleGenerateOtp}
              className={`py-2 text-center text-white duration-300  rounded-md h-9 sm:py-1  active:opacity-80 disabled:bg-gray-200 sm:active:hover:scale-110 ${
                otpGenerated ? "mt-9 w-2/6 bg-gray-400" : "w-4/6 bg-gray-600"
              }`}
              disabled={timer > 0}
            >
              {otpLoading
                ? "Sending..."
                : timer > 0
                ? `Resend OTP`
                : "Generate OTP"}
            </Button>
          </div>

          {otpError && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {otpError.response.data.message}
            </p>
          )}
          {error && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {error.response.data.message}
            </p>
          )}

          {otpGenerated && (
            <Button
              type="submit"
              onSubmit={handleSubmit(onSubmit)}
              className="w-5/6 py-2 mt-5 text-center text-white duration-300 bg-gray-600 rounded-md sm:py-1 active:opacity-80 sm:active:hover:scale-110"
            >
              {loading ? "Submitting..." : "Sign Up"}
            </Button>
          )}
        </form>
      </div>
    </Container>
  );
}

export default SignUpComp1;
