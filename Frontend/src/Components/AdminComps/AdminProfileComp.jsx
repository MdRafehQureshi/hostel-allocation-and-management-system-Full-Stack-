import { useEffect, useLayoutEffect, useState } from "react";
import Container from "../Container";
import adminService from "../../api/admin/admin";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, logout } from "../../features/authSlice";
import Button from "../Button";

function AdminProfileComp() {
  const [ loading ,setLoading ] = useState(false)
  const [ error,setError ] = useState(null)
  const admin = useSelector(state=>state.auth.userData)
  const dispatch = useDispatch()
  const navigate = useNavigate()

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

  if(loading){
    return <Container className="flex items-center justify-center">
      Loading...
    </Container>
  }

  if (!admin) {
    return (
      <Container className="flex items-center justify-center">
        <p className="text-red-500">No admin data available</p>
      </Container>
    );
  }

  return (
  <Container className="flex sm:justify-center sm:items-start sm:mt-2 ">
    <div className="flex flex-col px-2 sm:py-4 sm:shadow-lg sm:rounded-lg sm:justify-center sm:items-center ">
      <h1 className="w-full py-1 mt-2 mb-5 text-2xl text-center text-white rounded-lg bg-slate-400">Admin Profile</h1>
      <div className="pl-20 text-lg font-semibold sm:text-base">
        <h4 className="my-1 ">Level : {admin.level===1?"Super Admin":"Admin"}</h4>
        <h4 className="my-1 ">Name : {`${admin.first_name} ${admin.last_name}`}</h4>
        <h4 className="my-1 ">Email : {admin.email}</h4>
      </div>
      <button onClick={()=>{navigate("/admin/update-email")}}  className="w-1/2 py-2 mx-auto mt-5 text-center text-white duration-300 bg-gray-600 rounded-md sm:py-1 active:opacity-80 sm:active:hover:scale-110 ">Change Email</button>
      <Button className="w-1/2 py-2 mx-auto mt-5 text-center text-white duration-300 bg-gray-600 rounded-md sm:py-1 active:opacity-80 sm:active:hover:scale-110 ">Change Password</Button>
    </div>
  </Container>
  );
}

export default AdminProfileComp;
