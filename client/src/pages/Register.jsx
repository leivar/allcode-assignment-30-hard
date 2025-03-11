import Header from '../components/Header';
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router';


export default function Register() {
    
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        fname: '',
        lname: ''
    });
    const [error, setError] = useState('');

    const register = async () => {

        await axios.post('http://localhost:4000/register',formData, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if(response.data.success){
                    navigate('/login');
                } else if (response.data.error){
                    setError(response.data.error);
                } else {
                    setError('Something went wrong. Please try again later.')
                };
        });
    };
        

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    };

    return (
        <>
        <Header />
        <main className='flex flex-col gap-6 px-24 py-8'>
            <h2 className='text-2xl font-semibold'>Register a new account</h2>
            {error ?
                <p className='bg-red-500 text-white p-4 rounded-xl'>
                    {error}
                </p> : null
            }
            <section className='grid grid-rows-3'>
                <input name='email' value={formData.email} onChange={handleFormChange} placeholder='Email' type='email' className='placeholder-white border p-2 m-2 rounded-xl' />
                <input name='password' value={formData.password} onChange={handleFormChange} placeholder='Password' type='password' className='placeholder-white border p-2 m-2 rounded-xl' />
                <input name='username' value={formData.username} onChange={handleFormChange} placeholder='Username' type='text' className='placeholder-white border p-2 m-2 rounded-xl' />
                <input name='fname' value={formData.fname} onChange={handleFormChange} placeholder='First name' type='text' className='placeholder-white border p-2 m-2 rounded-xl' />
                <input name='lname' value={formData.lname} onChange={handleFormChange} placeholder='Last name' type='text' className='placeholder-white border p-2 m-2 rounded-xl' />
            </section>
            <button onClick={register} className='font-bold w-40 ml-4 border-white border-2 p-4 rounded-2xl hover:bg-white hover:text-indigo-800'>Submit</button>
        </main>
        </>
    );
};