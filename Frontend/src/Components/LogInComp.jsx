import  Container from "./Container"
import Input from "./Input"
import Button from "./Button"
import { useForm } from "react-hook-form"

function LogInComp(){
    const {register, handleSubmit, formState:{errors} } = useForm();
    
    function onSubmit(data) {
      console.log(data);
    }

    return (
      <Container className="flex flex-col items-center sm:justify-center">
          <div className="w-full pb-5 bg-white shadow-md sm:w-2/5">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center justify-center" >
          <h2 className="my-2 text-xl font-medium tracking-wide text-gray-600 ">Login</h2>
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
              
                <Button type="submit" onSubmit={handleSubmit(onSubmit)} className="w-5/6 py-2 mt-5 text-center text-white duration-300 bg-gray-600 rounded-md sm:py-1 active:opacity-80 sm:active:hover:scale-110">
                  Submit
                </Button>
              </form>
          </div>
      </Container>
    )
  }
  

export default LogInComp