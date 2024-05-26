import  { useState } from "react";
import { NavLink } from "react-router-dom";

function Sidebar({ isOpen }) {


  return (
    <div
      className={`fixed top-12 bottom-0 left-0 w-full sm:w-64 sm:shadow-md  z-40 transition-all duration-500 ${isOpen ? "translate-x-0" : "-translate-x-full"} `}
    >
      <div className="fixed top-0 bottom-0 flex flex-col items-center w-8/12 h-screen pt-4 text-black bg-white h- sm:w-64">
        {
          obj1.map((item,index)=>
            <NavLink key={index} to={item.path} className={({isActive})=>`${isActive?"bg-slate-300 text-white shadow-lg ":"text-black shadow-md"} py-2 w-9/12 text-center uppercase text-xs font-semibold tracking-wider   my-2 rounded-md`}><p className=" drop-shadow">{item.name}</p></NavLink>
          )
        }
      </div>
      <div
        className={` sm:hidden fixed top-0 bottom-0 right-0 w-4/12 h-screen bg-black opacity-25 transition-all duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"} `}
      ></div>
    </div>
  );
}

export default Sidebar;

const obj1=[
  {
    name:"Home",
    path:"/",
  },
  {
    name:"Instruction",
    path:"instruction",
  },
  {
    name:"Apply for hostel",
    path:"student/application-form",
  },
  {
    name:"Application Status",
    path:"student/application-status",
  },
]

