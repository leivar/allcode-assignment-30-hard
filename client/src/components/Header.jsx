import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { jwtDecode } from "jwt-decode";

export default function Header() {

  const [ loggedIn, setLoggedIn ] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    checkLogin();
  });

  const logout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };
  
  function checkLogin() {
    if (!localStorage.getItem('token')){
      navigate('/login');
    };
  
    if (localStorage.getItem('token')){
      try {
        const decoded = jwtDecode(localStorage.getItem('token'));
        if (Date.now() >= decoded.exp * 1000){
          navigate('/login');
        }else {
          setLoggedIn(true);
          console.log(loggedIn);
        }
      }catch(error){
        console.log(error);
      };
    };
  };
    
  return (
    <header>
      <nav className="p-4 flex flex-row justify-between w-full border-b-4 border-dashed rounded-b-xl">
        <section className="flex text-2xl md:text-4xl font-bold">
          <button className='' onClick={() => navigate('/')}>CloudCity</button>
        </section>
        <section className="flex flex-col items-end mr-4 md:mr-0">
          {loggedIn ?
            <button className="md:p-2 cursor-pointer font-bold border-1 hover:bg-white hover:text-indigo-800 border-white w-[120px] rounded" onClick={() => logout()}>Log Out</button>
            :<button className="md:p-2 cursor-pointer font-bold border-1 hover:bg-white hover:text-indigo-800 border-white w-[120px] rounded" onClick={() => navigate('/login')}>Log In</button>
          }
          <button className="md:p-2 cursor-pointer font-bold border-1 hover:bg-white hover:text-indigo-800 border-white w-[120px] rounded" onClick={() => navigate('/register')}>Register</button>
        </section>
      </nav>
    </header>
  )
};