import React, { useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/input/PasswordInput';
import { validateEmail } from '../../utils/helper'; // fixed typo here
import axiosInstance from '../../utils/axiosinstance';


const Login = () => {

    const [email, setemail] = useState("");
    const [password, setpassword] = useState("");
    const [error, seterror] = useState(null);
    const navigate = useNavigate()
    const handleLogin = async (e) => {
        e.preventDefault();

        // Email validation
        if (!validateEmail(email)) {  // fixed typo here
            seterror("Please enter a valid email address");
            return;  // exit if the email is not valid
        }
        if(!password)
        {
            seterror('please enter a password')
            return ;
        }

        // Clear error message on successful validation
        seterror("");

        // Perform login logic here (e.g., API call)
        console.log("Email:", email, "Password:", password);

        // API CALL 
        // Login API Call
try {
    const response = await axiosInstance.post("/login", {
      email: email,
      password: password,
    });
  
    // Handle successful login response
    if (response.data && response.data.accessToken) {
      localStorage.setItem("token", response.data.accessToken);
      navigate("/dashboard");
    }
  } catch (error) {
    if(error.response && error.response.data && error.response.data.message)
    {
        seterror(error.response.data.message)
    }
    else{
        seterror("An un expected error occured , try again ")
    }
  }
    }

    return (
        <>
            <Navbar />

            <div className='flex justify-center mt-28'>
               <div className='w-96 border rounded bg-white px-7 py-10'> 
                <form onSubmit={handleLogin}>  {/* fixed onSubmit */}
                    <h4 className="text-2xl mb-7">Login</h4>

                    {/* email entry input */}
                    <input
                        type='text'
                        placeholder='Email'
                        className='input-box'
                        value={email}
                        onChange={(e) => { setemail(e.target.value) }}
                    />

                    <PasswordInput
                        value={password}
                        onChange={(e) => setpassword(e.target.value)}
                    />

                    {/* message to print to validate email */}
                    {error && <p className='text-red-500 text-xs pb-1'>{error}</p>}  {/* uncommented error */}

                    {/* button to submit */}
                    <button
                        type="submit"
                        className="btn-primary">Login</button>

                    <p className="text-sm text-center mt-4">
                        Not registered yet?{" "}
                        <Link to="/signup" className="text-blue-500 hover:underline">
                            Create an Account
                        </Link>
                    </p>
                </form>
                </div>
            </div>
        </>
    )
}

export default Login;
