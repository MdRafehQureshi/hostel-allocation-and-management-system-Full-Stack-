import { Controller, useForm } from "react-hook-form";
import Container from "./Container";
import Input from "./Input";
import Button from "./Button";
import File from "./File";
import Select from "./Select";
import { useEffect, useLayoutEffect, useState } from "react";
import studentService from "../api/student/student";
import authService from "../api/auth/auth"; 
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../features/authSlice";
import { useNavigate } from "react-router-dom";

function ApplicationFormComp() {
  const { control,register, handleSubmit, watch, setValue,formState:{errors} } = useForm();
  const [ loading ,setLoading ] = useState(false)
  const [ error,setError ] = useState(null)
  const [ addressLoading, setAddressLoading ] = useState(false)
  const [pAddressErr,setPAddressErr] = useState(null)
  const [cAddressErr,setCAddressErr] = useState(null)
  const studentData = useSelector(state => state.auth.userData)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isDisabilityYes = watch('is_disabled') === 'Yes';    //  Check if disability is 'Yes'
  const selectedDegree = watch('degree');                   //  Get selected degree value
  const permanentAddress = {
                              address1: watch("address1"),
                              city1 : watch("city1"),
                              district1: watch("district1"),
                              state1: watch("state1"),
                              pin_code1: watch("pin_code1"),
                              country1: watch("country1"),
                              police_station1: watch("police_station1"),
                              post_office1: watch("post_office1"),                                                                   
                             } 
  const correspondenceAddress = {
                              country2: watch("country2"),
                              state2: watch("state2"),
                              city2 : watch("city2"),
                              district2: watch("district2"),
                              address2: watch("address2"),
                              pin_code2: watch("pin_code2"),
                              police_station2: watch("police_station2"),
                              post_office2: watch("post_office2"),                                                                   
                            }  
  useLayoutEffect(()=>{
    (async()=>{
      try {
      setError(null)
      setLoading(true) 
      const studentData = await studentService.getStudentData()
      console.log(studentData);
      dispatch(login(studentData.data))
      setLoading(false)
    } catch (error) {
      console.log(error);
      setLoading(false)
      if(error.response.status===401){
        dispatch(logout())
        navigate("/login")
      }
      setError(error)
    } 
   })()
    
  },[dispatch,navigate])

  useEffect(()=>{
    if(studentData){
      setValue("first_name",studentData.first_name)
      setValue("last_name",studentData.last_name)
      setValue("email",studentData.email)
    }
  },[studentData,setValue])

  function validateFileSize(file){
    const maxFileSize = 300 *1024 // 300 KB
    if (file[0].size > maxFileSize) {
      return "File size should not exceed 300 KB";
    }
    return true;
  }
  
    // Set values to empty strings if disability is 'No'
    
  useEffect(() => {
      if (!isDisabilityYes) {
        setValue('disability_type', ''); // Reset disability type
        setValue('degree_of_disability', ''); // Reset degree of disability
        setValue('student_disability_certificate', ''); // Reset disability certificate
      }
  }, [isDisabilityYes, setValue]);

  useEffect(() => {
      const selectedCourse = degreeCourses.find(degree => degree.degree === selectedDegree);
      setValue('course_duration', selectedCourse ? selectedCourse.duration : '');
  }, [selectedDegree, setValue]);

    async function calculateDistance(addressType){
      setPAddressErr(null)
      setCAddressErr(null)
      let addressData=null
      if(addressType===1){
       addressData = permanentAddress
      }else if(addressType===2){
       addressData = correspondenceAddress
      }
      for(let [key,value] of Object.entries(addressData)){
        if(value===""|| value===undefined){
          addressType===1?setPAddressErr(`Permanent ${key.slice(0,-1)} is required.`):setCAddressErr(`Correspondeence ${key.slice(0,-1)} is required`)
          return
        }
      }
     try {
        setAddressLoading(true)
        console.log(addressData);
        const res = await studentService.getDistance(addressData)
        const distance = res.data.data.distance.toFixed(2)
        console.log(distance);
        setValue("distance"+addressType , distance)
        setAddressLoading(false)
     } catch (error) {
        setAddressLoading(false)
        addressType===1?setPAddressErr(error):setCAddressErr(error)
     }
    }
    
    async function onSubmit(data) {
      try {
        setError(null);
        setLoading(true);
        console.log('before Form data:', data);
        const formData = new FormData();
        for (const key in data) {
          if (data[key] instanceof FileList) {
            if (data[key].length > 0) {
              formData.append(key, data[key][0]); // Append the first file
            }
          } else {
            formData.append(key, data[key]);
          }
        }
        for (let [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`);
        }
        const hasSubmit = await studentService.applyForHostel(formData);
        if (hasSubmit) {
          setLoading(false);
          navigate("/student/application-status");
        }
      } catch (error) {
        setLoading(false);
        setError(error);
        console.log('Form submission error:', error);
      }
    }  

    if(loading || !studentData) {
      return <Container className="flex items-center justify-center ">Loading..</Container>
    }
  
   if(studentData && studentData.applicant_id){
    return(<Container className="flex justify-center text-2xl text-center text-gray-500 sm:items-center">
      <div className="px-4 font-semibold bg-gray-100 shadow-xl py-28 rounded-2xl">
      Form Already Submitted !!
      </div>
    </Container>)
   }else{
  return (
    <Container className="flex flex-col items-center justify-center">
      <div className="w-full pb-5 shadow-md sm:w-2/5">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center justify-center" >
          <h1 className="my-3 text-3xl font-medium tracking-wide text-gray-600 ">Application Form</h1>

                       {/*Student's Details*/}
          
          <h2 className="my-2 text-xl font-medium tracking-wide text-gray-600 "> Student Details</h2>
          
          <Input type={"text"} label={"fisst name"} {...register("first_name")} readOnly/>
          <Input type={"text"} label={"last Name"} {...register("last_name")} readOnly />
          <Input type={"email"} label={"Email"} {...register("email")} readOnly/>
          <Input type={"text"} label={"Student Phone Number"} {...register("student_phone_number")} />
          <Select label={"Gender"} options={['Male','Female','Others']} {...register("gender")} />
          <Input type={"date"} label={"Date of Birth"} {...register("date_of_birth")} />
                       

                      {/*Student's Education Details */}
                      
          <h2 className="mt-5 mb-3 text-xl font-medium tracking-wide text-gray-600 ">Student Education Details</h2>
          <Controller name="degree" control={control} defaultValue=""
            render={({ field }) => (
              <Select
                label="Degree"
                options={degreeCourses.map((degree) => degree.degree)}
                {...field}
                onChange={(e) => {
                  field.onChange(e); // Update React Hook Form state
                  // Reset course_name field when degree changes
                  setValue('course_name', '');
                }}
              />
            )}
          />
          <Controller
            name="course_name"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <Select
                label="Course Name"
                options={degreeCourses.find((degree) => degree.degree === selectedDegree)?.courseNames || []}
                {...field}
              />
            )}
          />
          <Input type={"text"} label={"Course Duration"} {...register("course_duration")} readOnly />
          <Input type={"text"} label={"Admission Year"} {...register("admission_year")} />
          <Input type={"text"} label={"Current Semester"} {...register("current_semester")} />


                      {/* Student Medical Details */}
          <h2 className="mt-5 mb-3 text-xl font-medium tracking-wide text-gray-600 ">Student Medical Details </h2>
          
          <Select label={"Disability"} options={['Yes','No']} {...register("is_disabled")} />
          <Select label={"Disability Type"} options={disabilityList} {...register("disability_type")} disabled={!isDisabilityYes} />
          <Input type={"text"} label={"Degree of Disability"} {...register("degree_of_disability")} disabled={!isDisabilityYes} />
          <Select label={"Blood Group"} options={["A+", "A-", "B+", "B-","AB+","AB-","O+","O-"]} {...register("blood_group")} />

                       {/* //Guardian's Details */}
          <h2 className="mt-5 mb-3 text-xl font-medium tracking-wide text-gray-600 ">Guardian Details</h2>

          <Input type={"text"} label={"Guardian Full Name"} {...register("guardian_full_name")} />
          <Input type={"text"} label={"Guardian Contact Nummber"} {...register("guardian_contact_number")} />
          <Input type={"text"} label={"Relation With Guardian"} {...register("relation_with_guardian")} />
          <Input type={"text"} label={"Guardian Occupation"} {...register("guardian_occupation")} />
          <Input type={"text"} label={"Annual Family Income"} {...register("annual_family_income")} />

                  
                      {/*Permanent Address*/}
          <h2 className="mt-5 mb-3 text-xl font-medium tracking-wide text-gray-600 ">Permanent Address</h2>

          <Input type={"text"} label={"Permanent Country"} {...register("country1")} />
          <Input type={"text"} label={"Permanent State"} {...register("state1")} />
          <Input type={"text"} label={"Permanent City"} {...register("city1")} />
          <Input type={"text"} label={"Permanent District"} {...register("district1")} />
          <Input type={"text"} label={"Permanent Address"} {...register("address1")} />
          <Input type={"text"} label={"Permanent Pin Code"} {...register("pin_code1")} />
          <Input type={"text"} label={"Permanent Police Station"} {...register("police_station1")} />
          <Input type={"text"} label={"Permanent Post Office"} {...register("post_office1")} />
          {/* <input type={"text"} label={"Permanent Distance"} /> */}
          <div className="flex w-full pl-5 ">
            <div className="flex flex-col pr-3">
                <label className="mb-1 text-base text-gray-700 capitalize" htmlFor={"distance1"}>
                  Permanent Distance
                </label>
                <input
                  id={"distance1"}
                  {...register("distance1")} 
                  className={`border rounded-lg text-sm border-gray-400 bg-white h-9 text-gray-800 px-3 py-2 outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none  duration-200 `}
                  readOnly
              / >
            </div>
            <Button onClick={async ()=> await calculateDistance(1)} className="w-3/6 py-2 mt-5 mr-3 text-center text-white duration-300 bg-gray-600 rounded-md sm:mr-0 sm:py-1 active:opacity-80 sm:active:hover:scale-110 ">
            {addressLoading?"Calculating..":"Calculate Distance"}
            </Button>
          </div>
          {pAddressErr && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {pAddressErr?.response?.data?.message||pAddressErr}
            </p>
          )}
                     {/*Correspondence Address*/}
          <h2 className="mt-5 mb-3 text-xl font-medium tracking-wide text-gray-600 ">Correspondence Address</h2>

          <Input type={"text"} label={"Correspondence Country"} {...register("country2")} />
          <Input type={"text"} label={"Correspondence State"} {...register("state2")} />
          <Input type={"text"} label={"Correspondence City"} {...register("city2")} />
          <Input type={"text"} label={"Correspondence District"} {...register("district2")} />
          <Input type={"text"} label={"Correspondence Address"} {...register("address2")} />
          <Input type={"text"} label={"Correspondence Pin Code"} {...register("pin_code2")} />
          <Input type={"text"} label={"Correspondence Police Station"} {...register("police_station2")} />
          <Input type={"text"} label={"Correspondence Post Office"} {...register("post_office2")} />
          {/* <Input type={"text"} label={"Correspondence Distance"} {...register("distance2")} /> */}
          <div className="flex w-full pl-5 ">
            <div className="flex flex-col pr-3">
                <label className="mb-1 text-base text-gray-700 capitalize" htmlFor={"distance2"}>
                  Correspondence Distance
                </label>
                <input
                  id={"distance2"}
                  {...register("distance2")} 
                  className={`border rounded-lg text-sm border-gray-400 bg-white h-9 text-gray-800 px-3 py-2 outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none  duration-200 `}
                  readOnly
              / >
            </div>
            <Button onClick={async ()=> await calculateDistance(2)} className="w-3/6 py-2 mt-5 mr-3 text-center text-white duration-300 bg-gray-600 rounded-md sm:mr-0 sm:py-1 active:opacity-80 sm:active:hover:scale-110 ">
            {addressLoading?"Calculating..":"Calculate Distance"}
            </Button>
          </div>
          {cAddressErr && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {cAddressErr?.response?.data?.message||cAddressErr}
            </p>
          )}

                      {/*Documents Upload*/} 
          <h2 className="mt-5 mb-3 text-xl font-medium tracking-wide text-gray-600 ">Documents Upload</h2>

        <div  className="w-full mx-auto">
          <File label={"Upload Student Photo"} {...register("student_photo")} />
          <File label={"Upload Disability Certificate"} {...register("student_disability_certificate")} disabled={!isDisabilityYes} />
          <File label={'Upload Admission Proof'} 
            {...register('admission_proof', {
              required: "Admission Proof is required",
              validate: validateFileSize
            })}
            error={errors.admission_proof}/>
          <File label={"Upload Income Proof"} {...register("income_proof")} />
          <File label={"Upload Permanent Address Proof"} {...register("permanent_address_proof")}/>
          <File label={"Upload Correspondence Address Proof"}{...register("correspondence_address_proof")} />
          </div>
          

          <Button  type="submit" className="w-5/6 py-2 mt-5 text-center text-white duration-300 bg-gray-600 rounded-md sm:py-1 active:opacity-80 sm:active:hover:scale-110 ">Submit</Button>
        </form>
      </div>
    </Container>
  );}
}

export default ApplicationFormComp;

const disabilityList = [
  "Blindness",
  "Low-vision",
  " Leprosy Cured persons",
  "Hearing Impairment (deaf and hard of hearing)",
  " Locomotor Disability",
  " Dwarfism",
  "Intellectual Disability",
  " Mental Illness",
  "Autism Spectrum Disorder",
  " Cerebral Palsy",
  "Muscular Dystrophy",
  " Chronic Neurological conditions",
  "Specific Learning Disabilities",
  " Multiple Sclerosis",
  "Speech and Language disability",
  " Thalassemia",
  "Hemophilia",
  "Sickle Cell disease",
  " Multiple Disabilities including deafblindness",
  " Acid Attack victim",
  "Parkinson's disease",
];

const degreeCourses = [
  { degree: "B.Sc", 
    duration: 3,
    courseNames: [
      "Animation & Film Making",
      "Animation, Multimedia & Graphics",
      "Bioinformatics",
      "Biotechnology",
      "Environmental Science",
      "Food Science & Technology",
      "Forensic Science",
      "Gaming and Mobile Application Development",
      "Hospitality Administration",
      "Hospitality Studies and Catering Services",
      "Hospitality, Tourism and Events Management",
      "Hotel, Catering and Aviation Studies",
      "Interior Design",
      "International Hotel and Tourism Administration",
      "IT (Artificial Intelligence)",
      "IT (Big Data Analytics)",
      "IT (Blockchain Technology)",
      "IT (Cryptography & Network Security)",
      "IT (Cyber Security)",
      "IT (Data Science)",
      "IT (Internet of Things)",
      "Material Science",
      "Mathematics and Computing",
      "Multimedia Science, Augmented & Virtual Reality",
      "Multimedia, Animation & Graphic Design",
      "Robotics & 3D Printing"
  ] },
  { degree: "BBA",
    duration: 3,
    courseNames: [
      "Hospital Management",
      "Risk Management",
      "Tourism and Travel Management"
  ] },
  { 
    degree: "M.Sc",
    duration: 2,
    courseNames: [
      "Applied Chemistry",
      "Bioinformatics",
      "Biotechnology",
      "Clinical Genetics",
      "Environmental Science",
      "Film and Television Production",
      "Food Science & Technology",
      "Forensic Science",
      "Genetics",
      "Material Science",
      "Microbiology",
      "Molecular Biology",
      "Multimedia, Animation & Graphic Design",
      "Pharmaceutical Analysis"
  ] },
  { 
    degree: "MBA", 
    duration: 2,   
    courseNames: [
      "General MBA",
      "MBA in Hospital Administration",
      "MBA in Innovation, Entrepreneurship and Venture Development",
      "MBA in Waste Management and Social Entrepreneurship"
  ] },
  { 
    degree: "B.Tech",
    duration: 4,
    courseNames: [
      "Computer Science and Engineering",
      "Information Technology"
  ] },
  { 
    degree: "M.Tech",
    duration: 2,
    courseNames: [
      "Bioinformatics",
      "Biotechnology",
      "Computer Science and Engineering",
      "Geoinformatics",
      "Industrial Engineering and Management",
      "Information Technology (Artificial Intelligence)",
      "Information Technology (Data Science)",
      "Information Technology (Information Security)",
      "Information Technology (Internet of Things)",
      "Material Science and Technology",
      "Microelectronics and VLSI Technology",
      "Renewable Energy",
      "Software Engineering"
  ] }
];
