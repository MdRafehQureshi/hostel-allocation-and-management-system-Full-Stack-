import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import Layout from "./Components/Layout";
import { ApplicationForm,SignUp,LogIn, ApplicationStatus } from "./Pages";

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route element={<Layout/>}>
          <Route element={<SignUp/>} path="/"/>
          <Route element={<LogIn/>} path="instruction"/>
          <Route path="student">
          <Route element={<ApplicationForm/>} path="application-form"/> 
          <Route element={<ApplicationStatus/>} path="application-status"/> 
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
