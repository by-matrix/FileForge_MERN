import { Outlet } from "react-router-dom";
import Header from "./student/Header";

const Body = () => {
  return (
      <div className="">
        <Header />
          <Outlet />
      </div>
  )
}

export default Body;