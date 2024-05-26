
function Button({className="",type="button",children,...props }) {
  return (
    <button 
    {...props}
    className={`${className}`} 
    type={type}>
      {children}
    </button>
  )
}

export default Button