import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../features/authSlice";
import authService from "../api/auth/auth";

function Sidebar({ isOpen }) {
  const status = useSelector((state) => state.auth.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function logOut() {
    try {
      setError(null);
      setLoading(true);
      await authService.logout();
      dispatch(logout());
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error);
    }
  }
  useEffect(() => {}, [status]);

  return (
    <div
      className={`fixed top-12 bottom-0 left-0 w-full sm:w-64 sm:shadow-md z-40 transition-all duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="fixed top-0 bottom-0 flex flex-col items-center w-8/12 h-screen pt-4 text-black bg-white sm:w-64">
        {obj1.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `${
                isActive
                  ? "bg-slate-300 text-white shadow-lg"
                  : "text-black shadow-md"
              } py-2 w-9/12 text-center uppercase text-xs font-semibold tracking-wider my-2 rounded-md`
            }
          >
            <p className=" drop-shadow">{item.name}</p>
          </NavLink>
        ))}

        {status ? (
          <button
            className="fixed text-lg font-bold duration-100 bottom-3 sm:right-10 right-52 text-slate-400 active:scale-105"
            onClick={logOut}
          >
            Logout
          </button>
        ) : (
          <div className="fixed text-lg font-bold bottom-3 sm:right-10 right-52 text-slate-400">
            <button
              className="duration-100 hover:underline underline-offset-[5px] active:scale-105"
              onClick={() => navigate("/signup")}
            >
              Signup
            </button>
            <button
              className="duration-100 hover:underline underline-offset-[5px] active:scale-105"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        )}
      </div>
      <div
        className={` sm:hidden fixed top-0 bottom-0 right-0 w-4/12 h-screen bg-black opacity-25 transition-all duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } `}
      ></div>
    </div>
  );
}

export default Sidebar;

const obj1 = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "Instruction",
    path: "instruction",
  },
  {
    name: "Apply for hostel",
    path: "student/application-form",
  },
  {
    name: "Application Status",
    path: "student/application-status",
  },
];
