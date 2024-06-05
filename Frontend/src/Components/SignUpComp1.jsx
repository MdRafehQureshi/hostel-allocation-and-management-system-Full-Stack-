import  Container from "./Container"
import Input from "./Input"
import Button from "./Button"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"

function SignUpComp1() {
  const {register, handleSubmit,watch, formState:{errors} } = useForm();
  const [otpGenerated, setOtpGenerated] = useState(false);
  const [timer, setTimer] = useState(0);
  
  function onSubmit(data) {
    console.log(data);
  }


  function handleGenerateOtp() {
    setOtpGenerated(true);
    setTimer(120); // 2 minutes in seconds
     // Scroll to the bottom of the page
     window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
     // You would also typically call an API to send the OTP here.
  }

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  function formatTime(seconds){
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }
  
  return (
    <Container className="flex flex-col items-center sm:justify-center">
        <div className="w-full pb-5 bg-white shadow-md sm:w-2/5">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center justify-center" >
        <h2 className="my-2 text-xl font-medium tracking-wide text-gray-600 ">Register As Student</h2>
            <Input label={'First name'} {...register('first_name')}/>
            <Input label={'Last name'} {...register('last_name')}/>
            <Input label={'Student Unique Id'} {...register('student_id')}/>
            <Input label={'Email'} {...register('email', {
              required: "Email is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Invalid email address"
              }
            })}
            error={errors.email}/>
            
            <Input type="password" label={'Password'} {...register('password', {
              required: "Password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters long" },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/,
                message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
              }
            })}
            error={errors.password}/>

            <Input type="password" label={'Confirm Password'}  {...register('confirm_password', {
              required: "Confirm Password is required",
              validate: value => value === watch('password') || "Passwords do not match"
            })}
            error={errors.confirm_password}/>
            
            <Button
            type="button"
            onClick={handleGenerateOtp}
            className="w-5/6 py-2 mt-5 text-center text-white duration-300 bg-gray-600 rounded-md sm:py-1 active:opacity-80 sm:active:hover:scale-110"
            disabled={timer > 0}
          >
            {timer > 0 ? `Resend OTP in ${formatTime(timer)}` : "Generate OTP"}
          </Button>
          
          {otpGenerated && (
            <>
              <Input
                label="OTP"
                {...register('otp', { required: "OTP is required",
                pattern: {
                  value: /^\d{6}$/,
                  message: "OTP must be a 6-digit number"
                }
                 })}
                error={errors.otp}
              />
              <Button type="submit" onSubmit={handleSubmit(onSubmit)} className="w-5/6 py-2 mt-5 text-center text-white duration-300 bg-gray-600 rounded-md sm:py-1 active:opacity-80 sm:active:hover:scale-110">
                Submit
              </Button>
            </>
          )}
            </form>
        </div>
    </Container>
  )
}

export default SignUpComp1