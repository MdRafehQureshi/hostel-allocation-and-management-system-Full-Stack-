import { useDispatch } from "react-redux"
import Container from "../Container"
import { useEffect, useLayoutEffect, useState } from "react"
import { login,logout } from "../../features/authSlice"
import adminService from "../../api/admin/admin"
import { useNavigate } from "react-router-dom"

function AllotmentComp() {
    const [ loading ,setLoading ] = useState(false)
    const [ error,setError ] = useState(null)
    const [data,setData] = useState(null)
    const [count,setCount] = useState(null)
    const [dataError,setDataError] = useState(null)
    const [allotmentLoading,setAllotmentLoading]= useState(false)
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
        fetchActiveApplicants()
        
      },[])

      async function fetchActiveApplicants(){
        try {
          setDataError(null)
          setLoading(true)
          const {data} = await adminService.getAllActiveApplicants()
          console.log(data.data);
          setData(data.data.applicants)
          setCount(data.data.activeCount)
          setLoading(false)
        } catch (error) {
         setLoading(false)
         setDataError(error)
         console.log(error);
        }
      }

      async function startAllotment(){
        try {
          setAllotmentLoading(true)
          await adminService.runAllocation()
          setAllotmentLoading(false)
          fetchActiveApplicants()
        } catch (error) {
          setAllotmentLoading(false)
        }
      }

  return (
    <Container className="flex justify-center">
      <div className="flex flex-col w-9/12 shadow-lg ">
        <div className="flex items-center justify-around w-full ">
          <button onClick={startAllotment} disabled={allotmentLoading===true} className="w-40 h-10 mt-5 text-center text-white duration-300 bg-gray-600 rounded-md sm:py-1 active:opacity-80 sm:active:hover:scale-110">{allotmentLoading?"Alloting":"Start Allotment"}</button>

          <div className="py-2 font-medium text-center shadow-lg mt-9 w-28 rounded-xl">
              <h1>Total Active Applicants:</h1>
            <h2>{count|| 0}</h2>
          </div>
        </div>
       <table className="border-separate rounded-md shadow-md border-spacing-x-20 mt-9">
        <thead>
            <tr className="text-center ">
            <th>Sl. no</th>   
            <th>Application Status</th>
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
                      <td colSpan="4">{dataError.response.data.message}</td>
                    </tr>
                  ) : data && data.length > 0 ? (
                    data.map((applicant, index) => (
                      <tr key={index} className="text-center " >
                        <td>{index+1}</td>
                        <td>{applicant?.application_status || ""}</td>
                        <td>{applicant?.student_id || ""}</td>
                        <td>{applicant?.first_name || ""}</td>
                        <td>{applicant?.last_name || ""}</td>
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
export default AllotmentComp;