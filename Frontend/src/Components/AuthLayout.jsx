import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

function AuthLayout({children ,authentication = true}) {
    const [loader,setLoader]=useState(true)
    const navigate = useNavigate()
    const authStatus = useSelector((state)=>state.auth.status)

    useEffect(()=>{
        if(authentication  && authStatus!==authentication){
            navigate("/login")
        }else if(!authentication && authStatus !== authentication){
            navigate("/")
        }
        setLoader(false)
    },[authentication,authStatus,navigate])

  return loader?<div className='flex items-center justify-center w-screen h-screen text-lg font-bold '>Loading...</div>
  :<>{children}</>
}

export default AuthLayout