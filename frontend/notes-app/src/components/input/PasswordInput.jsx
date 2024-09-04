import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const PasswordInput = ({value, onChange, placeholder}) => {

    const [isShowPassword, setisShowPassword] = useState(false);
    const toggleShowPassword =()=>{
        setisShowPassword(! isShowPassword);
    }

  return (
    <div className='flex items-center bg-transparent border-[1.5px]p-5 mb-3x'>
        <input
        value={value}
        onChange={onChange}
        type={isShowPassword ? "test":"password"}
        placeholder={placeholder || "Password"}
        className='w-full text-sm bg-transparent py-3 mr-3 rounded outline-none'
        />

       {isShowPassword ? (
  <FaRegEye
    size={22}
    className="text-primary cursor-pointer"
    onClick={() => toggleShowPassword()}
  />
) : (
  <FaRegEyeSlash
    size={22}
    className="text-slate-400 cursor-pointer"
    onClick={() => toggleShowPassword()}
  />
)}


    </div>
  )
}

export default PasswordInput