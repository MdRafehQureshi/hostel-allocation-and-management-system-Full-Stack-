import  { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import { Outlet, ScrollRestoration } from 'react-router-dom'

function Layout() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
      setIsOpen(!isOpen);
    };
  return (
    <div>
        <Header toggleSidebar={toggleSidebar} />
        <Sidebar isOpen={isOpen} />
        <ScrollRestoration/>
        <Outlet/>
    </div>
  )
}

export default Layout