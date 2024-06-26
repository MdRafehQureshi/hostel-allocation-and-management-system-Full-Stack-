import { useDispatch } from "react-redux"
import Container from "../Container"
import { useEffect, useLayoutEffect, useState } from "react"
import { login,logout } from "../../features/authSlice"
import adminService from "../../api/admin/admin"
import { useNavigate } from "react-router-dom"

function ResidentsComp() {
    const [ loading ,setLoading ] = useState(false)
    const [ error,setError ] = useState(null)
    const [data,setData] = useState(null)
    const [count,setCount] = useState(null)
    const [dataError,setDataError] = useState(null)
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

      useEffect(()=>{
        ;(async()=>{
           try {
             setDataError(null)
             setLoading(true)
             const {data} = await adminService.getAllActiveResidents()
             console.log(data.data);
             setData(data.data.residents)
             setCount(data.data.count)
             setLoading(false)
           } catch (error) {
            setLoading(false)
            setDataError(error)
            console.log(error);
           }
        })()
        
      },[])

  return (
    <Container className="flex justify-center">
      <div className="flex flex-col w-9/12 shadow-lg" >
        <div className="py-2 mx-auto font-medium text-center shadow-lg mt-9 w-28 rounded-xl">
            <h1>Total Active Residents:</h1>
           <h2>{count||"Some error occured"}</h2>
        </div>
       <table className="border-separate rounded-md shadow-md border-spacing-x-20 mt-9">
        <thead>
            <tr className="text-center ">
            <th>Sl. no</th>   
            <th>Hostel Id</th>
            <th>Room Number</th>
            <th>Student Id</th>
            <th>Student First Name</th>
            <th>Student Last Name</th>
            </tr>
        </thead>
        <tbody>
            {
                loading ? (
                    <tr>
                      <td colSpan="4">Loading...</td>
                    </tr>
                  ) : dataError ? (
                    <tr>
                      <td colSpan="4">{dataError.response.message.data}</td>
                    </tr>
                  ) : data && data.length > 0 ? (
                    data.map((resident, index) => (
                      <tr key={index} className="text-center " >
                        <td>{index+1}</td>
                        <td>{resident.hostel_id}</td>
                        <td>{resident.room_no}</td>
                        <td>{resident.student_id}</td>
                        <td>{resident.first_name}</td>
                        <td>{resident.last_name}</td>
                      </tr>
                    ))
                  ): (
                    <tr>
                      <td colSpan="4">No residents found</td>
                    </tr>
                  )
            }
        </tbody>
       </table>
      </div>
    </Container>
  )
}

export default ResidentsComp