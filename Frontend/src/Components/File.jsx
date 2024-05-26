import { forwardRef, useId } from "react";
import Button from "./Button";

const File = forwardRef(function File(
  { 
    placeholder = "",
    className = "", 
    label, 
    error,
    children,
     ...props
     },ref
) {
  const id = useId();

  return (
    <div className="flex flex-col items-center w-full px-5 mb-5 ">
     {(label && <label
        htmlFor={id}
        className={` bg-stone-300 cursor-pointer text-center flex items-center justify-center text-white shadow-md   h-9 w-5/6 sm:w-3/5 rounded-lg ${className}`}
      >
        {label}
      </label>)}
      <input
        id={id}
        type={"file"}
        placeholder={placeholder}
        ref={ref}
        {...props}
        className={`hidden`}
      />
      {error && <p className="mt-1 text-xs font-semibold text-red-600">{error.message}</p>}
    </div>
  );
});

export default File;
