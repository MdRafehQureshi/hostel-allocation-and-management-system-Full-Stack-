import { forwardRef, useId, useState } from "react";
import { FaEye,FaEyeSlash } from "react-icons/fa";

function Input(
  {
    type = "text",
    placeholder = "",
    className = "",
    label,
    error,
    ...props
  },
  ref
){
  const id = useId();
  const [inputType,setInputType] = useState(type)

  function togglePasswordVisibility() {
    setInputType((prevType)=> prevType==="password"?"type":"password")
  }

  return (
    <div className="relative flex flex-col w-full px-5 my-2 ">
      {label && (
        <label className="mb-1 text-base text-gray-700 capitalize" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        type={inputType}
        placeholder={placeholder}
        ref={ref}
        {...props}
        className={`border rounded-lg text-sm border-gray-400 bg-white h-9 text-gray-800 px-3 py-2 outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none  duration-200  ${className}`}
     / >
         {type === "password" && (
          <div
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute text-gray-600 right-9 top-9"
          >
            {inputType === "password" ? <FaEye /> : <FaEyeSlash />}
          </div>
        )} 
        {error && <p className="mt-1 text-xs font-medium text-red-600">{error.message}</p>}
    </div>
  );
};

export default forwardRef(Input);

