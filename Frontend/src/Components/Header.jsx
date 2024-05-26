import { FiMenu } from "react-icons/fi";
import { IconContext } from "react-icons";

function Header({toggleSidebar} ) {
  return (
    <div className="fixed top-0 z-50 flex items-center justify-center w-screen h-12 shadow-lg bg-sky-400">
        <div className="absolute left-5 top-2"> 
        <IconContext.Provider value={{size:"2em",className:""} }>
            <button className="text-white" onClick={()=>toggleSidebar()}>
                 <FiMenu />
            </button>
        </IconContext.Provider>
        </div>
        
        <div className="flex ">
        <img className="w-7 h-7" src="./src/assets/MAKAUT_Logo.png"/>
        <h1 className="text-xl font-bold text-white drop-shadow">MAKAUT,WB</h1>
        </div>
      
        
    </div>
  )
}

export default Header