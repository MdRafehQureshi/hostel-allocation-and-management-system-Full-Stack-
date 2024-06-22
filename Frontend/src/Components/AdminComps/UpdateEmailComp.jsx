import Container from "../Container";
import Input from "../Input";
import Button from "../Button";
import { useForm } from "react-hook-form";
import { useEffect, useLayoutEffect, useState } from "react";
import authService from "../../api/auth/auth";
import adminService from "../../api/admin/admin";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login, logout } from "../../features/authSlice";

function UpdateEmailComp() {
  const { register, handleSubmit, watch, formState: { errors },  } = useForm();
  const [otp, setOtp] = useState({
                                    oldOtp: false,
                                    newOtp: false,
                                });
  const [otpLoading, setOtpLoading] = useState(false);
  const [oldTimer, setOldTimer] = useState(() => {
    const savedTimer = localStorage.getItem("oldOtpTimer");
    return savedTimer ? parseInt(savedTimer, 10) : 0;
  });
  const [newTimer, setNewTimer] = useState(() => {
    const savedTimer = localStorage.getItem("newOtpTimer");
    return savedTimer ? parseInt(savedTimer, 10) : 0;
  });
  const [emailError,setEmailError] = useState(null)
  const [error, setError] = useState(null);
  const [loading,setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch() 
  const oldEmail = watch("old_email")
  const newEmail = watch("new_email")

  useLayoutEffect(()=>{
    (async()=>{
        try {
          setLoading(true)
          const {data} = await adminService.getAdminData()
          dispatch(login(data))
          setLoading(false)
        } catch (error) {
          setLoading(false)
          if(error.response.status===401||error.response.status===403){
            dispatch(logout())
          }
          setError(error.response.data)
        }

    })()
  },[dispatch,navigate])

  async function handleGenerateOtp(otpType) {
    setEmailError(null);
    let email = "";
    (otpType==="oldOtp")?email=oldEmail:email = newEmail;
    if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email)
    ) {
      setEmailError(`Invalid ${(otpType==="oldOtp")?"current":"new"} email address`);
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
      setError(error);
    }
    setOtp((prev) => ({ ...prev, [otpType]: true }));
    otpType === "oldOtp" ? setOldTimer(10) : setNewTimer(10); // 2 minutes in seconds
  }

  async function onSubmit(data) {
    setError(null)
    setLoading(true)
   try {
   const res = await adminService.updateAdminEmail(data)
   if(res.data){
    navigate ("/admin/admin-profile")
   }
   } catch (error) {
    setLoading(false)
    setError(error)
   }

  }

  useEffect(() => {
    if (oldTimer > 0) {
      setOtp((prev) => ({ ...prev, oldTimer: true }));
      const countdown = setInterval(() => {
        setOldTimer((prevTimer) => {
          const timer = prevTimer - 1;
          localStorage.setItem("oldOtpTimer", timer);
          return timer;
        });
      }, 1000);
      return () => clearInterval(countdown);
    } else {
      localStorage.removeItem("oldOtpTimer");
    }
  }, [oldTimer]);

  useEffect(() => {
    if (newTimer > 0) {
      setOtp((prev) => ({ ...prev, newTimer: true }));
      const countdown = setInterval(() => {
        setNewTimer((prevTimer) => {
          const timer = prevTimer - 1;
          localStorage.setItem("newOtpTimer", timer);
          return timer;
        });
      }, 1000);
      return () => clearInterval(countdown);
    } else {
      localStorage.removeItem("newOtpTimer");
    }
  }, [newTimer]);

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }

  return (
    <Container className="flex justify-center">
      <div className="w-2/5 shadow-lg ">
        <h2 className="my-2 text-xl font-medium tracking-wide text-center text-gray-600 ">
          Update Admin Email
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-center" >
            
          <Input type={"email"} label={"Current Email"} 
           {...register("old_email", {
            required: "Current email is required",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
              message: "Invalid Current email address",
            },
          })}
          error={errors.old_email} />

          <p className="mt-4 font-medium text-center">
            {oldTimer > 0 ? `Resend OTP in ${formatTime(oldTimer)}` : ""}{" "}
          </p>
          <div className="flex w-full px-5 justify-evenly">
            {otp.oldOtp && (
              <div className="relative flex flex-col my-2 mr-2 duration-200">
                <label className="mb-1 text-base text-gray-700 capitalize" htmlFor={"otp"} >
                  OTP for Current Email
                </label>

                <input
                  id={"otp"}
                  {...register("old_email_otp", {
                    required: "OTP for current email is required",
                    pattern: {
                      value: /^\d{6}$/,
                      message: "OTP must be a 6-digit number",
                    },
                  })}
                  className={`border rounded-lg text-sm border-gray-400 bg-white h-9 text-gray-800 px-3 py-2 outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none  duration-200`}
                />
                {errors.old_email_otp && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.old_email_otp.message}
                  </p>
                )}
              </div>
            )}

            <Button
              type="button"
              onClick={()=> handleGenerateOtp("oldOtp")}
              className={`py-2 text-center text-white duration-300  rounded-md h-9 sm:py-1  active:opacity-80 disabled:bg-gray-200 sm:active:hover:scale-110 ${
                otp.oldOtp ? "mt-9 w-2/6 bg-gray-400" : "w-4/6 bg-gray-600"
              }`}
              disabled={oldTimer > 0}
            >
              {otpLoading
                ? "Sending..."
                : oldTimer > 0
                ? `Resend OTP`
                : "Generate OTP"}
            </Button>
          </div>

          <Input type={"email"} label={"New Email"} 
           {...register("new_email", {
            required: "New email is required",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
              message: "Invalid new email address",
            },
          })}
          error={errors.new_email} />

          <p className="mt-4 font-medium text-center">
            {newTimer > 0 ? `Resend OTP in ${formatTime(newTimer)}` : ""}{" "}
          </p>
          <div className="flex w-full px-5 justify-evenly">
            {otp.newOtp && (
              <div className="relative flex flex-col my-2 mr-2 duration-200">
                <label className="mb-1 text-base text-gray-700 capitalize" htmlFor={"new-otp"} >
                  OTP for New Email
                </label>

                <input
                  id={"new-otp"}
                  {...register("new_email_otp", {
                    required: "OTP for new email is required",
                    pattern: {
                      value: /^\d{6}$/,
                      message: "OTP must be a 6-digit number",
                    },
                  })}
                  className={`border rounded-lg text-sm border-gray-400 bg-white h-9 text-gray-800 px-3 py-2 outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none  duration-200`}
                />
                {errors.new_email_otp && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {errors.new_email_otp.message}
                  </p>
                )}
              </div>
            )}

            <Button
              type="button"
              onClick={()=> handleGenerateOtp("newOtp")}
              className={`py-2 text-center text-white duration-300  rounded-md h-9 sm:py-1  active:opacity-80 disabled:bg-gray-200 sm:active:hover:scale-110 ${
                otp.newOtp ? "mt-9 w-2/6 bg-gray-400" : "w-4/6 bg-gray-600"
              }`}
              disabled={newTimer > 0}
            >
              {otpLoading
                ? "Sending..."
                : newTimer > 0
                ? `Resend OTP`
                : "Generate OTP"}
            </Button>
          </div>
          <Button
            type="submit"
            disabled = {loading === true}
            className="w-5/6 py-2 mx-auto mt-5 text-center text-white duration-300 bg-gray-600 rounded-md sm:py-1 active:opacity-80 sm:active:hover:scale-110 "
          >
            S{loading?"Submitting":"Submit"}
          </Button>
          {emailError && (
            <p className="mt-1 text-xs font-medium text-center text-red-600">
              {emailError}
            </p>
          )}
          {error && (<p className="mt-1 text-xs font-medium text-center text-red-600">
              {error.response.data.message}
          </p>)}

        </form>
      </div>
    </Container>
  );
}

export default UpdateEmailComp;
