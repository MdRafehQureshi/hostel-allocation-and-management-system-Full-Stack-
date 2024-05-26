import {forwardRef, useId} from 'react'

function Select({
    options,
    label,
    className,
    error,
    ...props
}, ref) {
    const id = useId()
  return (
    <div className='flex flex-col w-full px-5 my-2 '>
        {label && <label htmlFor={id} className='mb-1 text-base text-gray-700 capitalize'>{label}</label>}
        <select
        {...props}
        id={id}
        ref={ref}
        className={`border rounded-lg text-sm text-gray-700 border-gray-400 bg-white h-9  px-3 outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none duration-200  ${className}`}
        >    
        <option key={1} value=''>Select {label}</option>
            {options?.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
        {error && <p className="mt-1 text-xs font-semibold text-red-600">{error.message}</p>}
    </div>
  )
}

export default forwardRef(Select)

