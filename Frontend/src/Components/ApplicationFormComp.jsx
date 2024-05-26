import { Controller, useForm } from "react-hook-form";
import Container from "./Container";
import Input from "./Input";
import Button from "./Button";
import File from "./File";
import Select from "./Select";
import { useEffect } from "react";

function ApplicationFormComp() {
  const { control,register, handleSubmit, watch, setValue,formState:{errors} } = useForm();
 
  function onSubmit(data) {
    console.log(data);
  }
  
  const isDisabilityYes = watch('disability') === 'Yes';    //  Check if disability is 'Yes'
  const selectedDegree = watch('degree');                   //  Get selected degree value
  
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

  return (
    <Container className="flex flex-col items-center justify-center">
      <div className="w-full pb-5 shadow-md sm:w-2/5">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center justify-center" >
          <h1 className="my-3 text-3xl font-medium tracking-wide text-gray-600 ">Application Form</h1>

                       {/*Student's Details*/}
          
          <h2 className="my-2 text-xl font-medium tracking-wide text-gray-600 "> Student Details</h2>
          
          <Input type={"text"} label={"fisst name"} {...register("first_name")} />
          <Input type={"text"} label={"last Name"} {...register("last_name")} />
          <Input type={"email"} label={"Email"} {...register("email")} />
          <Input type={"text"} label={"Student Phone Number"} {...register("student_pohne_number")} />
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
          
          <Select label={"Disability"} options={['Yes','No']} {...register("disability")} />
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

          <Input type={"text"} label={"Country1"} {...register("country1")} />
          <Input type={"text"} label={"State1"} {...register("state1")} />
          <Input type={"text"} label={"City1"} {...register("city1")} />
          <Input type={"text"} label={"District1"} {...register("district1")} />
          <Input type={"text"} label={"Address1"} {...register("address1")} />
          <Input type={"text"} label={"Pin Code1"} {...register("pin_code1")} />
          <Input type={"text"} label={"Police Station1"} {...register("police_station1")} />
          <Input type={"text"} label={"Post Office1"} {...register("post_office1")} />
          <Input type={"text"} label={"Distance1"} {...register("distance1")} />
          
                     {/*Correspondence Address*/}
          <h2 className="mt-5 mb-3 text-xl font-medium tracking-wide text-gray-600 ">Correspondence Address</h2>

          <Input type={"text"} label={"Country2"} {...register("country2")} />
          <Input type={"text"} label={"State2"} {...register("state2")} />
          <Input type={"text"} label={"City2"} {...register("city2")} />
          <Input type={"text"} label={"District2"} {...register("district2")} />
          <Input type={"text"} label={"Address2"} {...register("address2")} />
          <Input type={"text"} label={"Pin Code2"} {...register("pin_code2")} />
          <Input type={"text"} label={"Police Station2"} {...register("police_station2")} />
          <Input type={"text"} label={"Post Office2"} {...register("post_office2")} />
          <Input type={"text"} label={"Distance2"} {...register("distance2")} />
          

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
  );
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


