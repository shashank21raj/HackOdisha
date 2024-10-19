import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <>
      <div className="bg-purple-500 text-white flex items-center px-4 py-2">
        <Link to={'/'} className="text-xl font-bold ml-2 mr-4">User Profile</Link>
        <Link to={'/test'} className="text-xl font-bold ml-2" >Testing</Link>
        <div className="ml-auto">
          <button className="text-2xl ml-4">&#x2302;</button>{" "}
          {/* Home icon */}
        </div>
      </div>
    </>
  );
};

export default Navbar;
