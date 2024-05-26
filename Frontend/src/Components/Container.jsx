

function Container({children,className=""}) {
  return (
    <div className={`w-full  min-h-svh pt-14 ${className}`}>
        {children}
    </div>
  )
}

export default Container