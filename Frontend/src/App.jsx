import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Layout from "./Components/Layout";
import AuthLayout from "./Components/AuthLayout"
import { ApplicationForm,SignUp,LogIn, ApplicationStatus,Home, Instruction, } from "./Pages";

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
