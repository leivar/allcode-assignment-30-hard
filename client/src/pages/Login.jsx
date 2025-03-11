import { useState } from 'react';
import { useNavigate } from 'react-router';
import Header from '../components/Header';

export default function Login() {

    const navigate = useNavigate();
    const [email, setEmail ] = useState();
    const [password, setPassword ] = useState();
    const [error, setError ] = useState();

    const login = async () => {

        await fetch('http://localhost:4000/login', {
            method: 'POST',
            body: JSON.stringify({ email: email.toLowerCase(), password: password }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(async (data) => {
            const response = await data.json();

            if (response.token) {
                localStorage.setItem('token', response.token);
                navigate('/');
            } else if (response.data.error) {
                setError(response.data.error);
            } else {
                setError('Something went wrong. Please try again later.')
            }

        });
    }

    return (
        <section className='Login'>
            <Header />
            <main className='flex flex-col gap-6 px-24 py-8'>
                <h2 className='text-2xl font-semibold'>Log in to your account</h2>
                {error ?
                <p className='bg-red-500 text-white p-4 rounded-xl'>{error}</p> : null
                }
                <section className='grid grid-rows-2'>
                    <input value={email} onChange={(e) => (setEmail(e.target.value))} placeholder='Email' type='text' className='placeholder-white border p-2 m-2 rounded-xl' />
                    <input value={password} onChange={(e) => (setPassword(e.target.value))} placeholder='Password' type='password' className='placeholder-white border p-2 m-2 rounded-xl' />
                </section>
                <section className='flex login-button'>
                    <button onClick={() => login()} className='font-bold w-40 ml-4 border-2 border-white p-4 rounded-2xl hover:bg-white hover:text-indigo-800'>Log in</button> 
                </section>
            </main>
        </section>
    );
};