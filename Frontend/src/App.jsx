import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Layout from "./Components/Layout";
import AuthLayout from "./Components/AuthLayout"
import { ApplicationForm, SignUp, LogIn, ApplicationStatus, Home, Instruction, AdminProfile, Admins, Residents, Allotment, UpdateEmail, Hostels, Rooms, } from "./Pages";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
      <Route element={<Layout/>}>
        <Route element={<Home/>} path="/"/>
        <Route element={<SignUp/>} path="signup"/>
        <Route element={<LogIn/>} path="login"/>
        <Route element={<Instruction/>} path="instruction"/>
        <Route path="student">
          <Route element={(<AuthLayout authentication={true}><ApplicationForm/></AuthLayout>)} path="application-form"/> 
          <Route element={(<AuthLayout authentication={true}><ApplicationStatus/></AuthLayout>)} path="application-status"/> 
        </Route>
        <Route path="admin">
          <Route index element={(<AuthLayout authentication={true}><AdminProfile/></AuthLayout>)} path="admin-profile"/> 
          <Route element={(<AuthLayout authentication={true}><Admins/></AuthLayout>)} path="admins"/>
          <Route element={(<AuthLayout authentication={true}><Residents/></AuthLayout>)} path="residents"/>
          <Route element={(<AuthLayout authentication={true}><Allotment/></AuthLayout>)} path="allotment"/>
          <Route element={(<AuthLayout authentication={true}><UpdateEmail/></AuthLayout>)} path="update-email"/>
          <Route element={(<AuthLayout authentication={true}><Hostels/></AuthLayout>)} path="hostels"/>
          <Route element={(<AuthLayout authentication={true}><Rooms/></AuthLayout>)} path="rooms"/>
        </Route>
      </Route>
    </>
    )
  );

  return (
    <>
      <div className="w-full min-h-screen m-0 font-sans bg-gray-100">
        <RouterProvider router={router} />
      </div>
    </>
  );
}

export default App;
