import { useDispatch } from "react-redux"
import Container from "../Container"
import Select from "../Select"
import Input from "../Input"
import { useEffect, useLayoutEffect, useState } from "react"
import { login,logout } from "../../features/authSlice"
import adminService from "../../api/admin/admin"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"

function HostelsComp() {
    const [ loading ,setLoading ] = useState(false)
    const [ error,setError ] = useState(null)
    const [data,setData] = useState(null)
    const [count,setCount] = useState(null)
    const [dataError,setDataError] = useState(null)
    const [hostelLoading,setHostelLoading]= useState(false)
    const [hostelError,setHostelError] = useState(null)
    const dispatch = useDispatch()
    const navigate = useNavigate() 
    const { register, handleSubmit, formState:{errors} } = useForm();

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

      useEffect(()=>{
        fetchHostels()
      },[])

      const fetchHostels = async () => {
        try {
          setDataError(null);
          setLoading(true);
          const { data } = await adminService.getAllHostels();
          console.log(data.data);
          setData(data.data.hostels);
          setCount(data.data.count);
          setLoading(false);
        } catch (error) {
          setLoading(false);
          setDataError(error);
          console.log(error);
        }
      };

      async function onSubmit(data){
        try {
          setHostelError(null)
          setHostelLoading(true)
          await adminService.addHostel(data)
          setHostelLoading(false)
          fetchHostels()
        } catch (error) {
          setHostelLoading(false)
          setHostelError(error)
        }
      }

  return (
    <Container className="flex justify-center">
      <div className="flex flex-col w-9/12 shadow-lg ">
        <div className="flex items-center w-full justify-evenly ">
            <form onSubmit={handleSubmit(onSubmit)} className="flex " >
            <Select label={"Gender"} options={['Male','Female']} {...register("gender",{
                required:"Gender is required"
            })} error={errors.gender} />
            <Input type={"text"} label={"Floor Capacity"} {...register("floor_capacity", {
                    required: "Floor Capacity is required",
                    pattern: {
                      value: /^\d{1,2}$/,
                      message: "Floor Capacity cannot have more than two-digit",
                    },
                  })}
                  error={errors.floor_capacity} />
            <button type="submit" disabled={hostelLoading===true} className="h-10 text-center text-white duration-300 bg-gray-600 rounded-md w-80 mt-9 active:opacity-80 sm:active:hover:scale-110">{hostelLoading?"Adding":"Add Hostel"}</button>
            </form>
          <div className="py-2 font-medium text-center shadow-lg mt-9 w-28 rounded-xl">
              <h1>Total Hostels:</h1>
            <h2>{count|| 0}</h2>
          </div>
        </div>
        {hostelError && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {hostelError.response.data.message}
            </p>
          )}
       <table className="border-separate rounded-md border-spacing-x-20 mt-9">
        <thead>
            <tr className="text-center ">
            <th className="underline underline-offset-6 border-[0.5px]">Sl. no</th>   
            <th className="underline underline-offset-6 border-[0.5px]">Hostel Id</th>
            <th className="underline underline-offset-6 border-[0.5px]">Admin Id</th>
            <th className="underline underline-offset-6 border-[0.5px]">Floor Capacity</th>
            </tr>
            <div ></div>
        </thead>
  
        <tbody>
            {
                loading ? (
                    <tr>
                      <td colSpan="4">Loading...</td>
                    </tr>
                  ) : dataError ? (
                    <tr>
                      <td colSpan="4">{dataError.response.data.message}</td>
                    </tr>
                  ) : data && data.length > 0 ? (
                    data.map((hostels, index) => (
                      <tr key={index} className="text-center " >
                        <td>{index+1}</td>
                        <td>{hostels?.hostel_id || ""}</td>
                        <td>{hostels?.admin_id || ""}</td>
                        <td>{hostels?.floor_capacity || ""}</td>
                      </tr>
                    ))
                  ): (
                    <tr>
                      <td colSpan="4">No Applicants found</td>
                    </tr>
                  )
            }
        </tbody>
       </table>
      </div>
    </Container>
  )
}


export default HostelsComp