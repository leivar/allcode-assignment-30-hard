import axios from 'axios';
import { useState, useEffect } from 'react';

export default function Uploader() {
    
    const [ file, setFile ] = useState('');
    const [ title, setTitle ] = useState('');
    const [ label, setLabel ] = useState('');
    const [ success, setSuccess ] = useState('');
    const [ error, setError ] = useState('');

    const handleFileChange = (e) => {
        
        if(e.target.files){
            setFile(e.target.files[0]);
        };

    };

    const handleTitleChange = (e) => {
        
        setTitle(e.target.value);

    };

    const handleLabelChange = (e) => {

        setLabel(e.target.value);

    };

    const documentValidator = (e) => {

        if(!file){
            setError('Missing file.');
        }else if(!title){
            setError('Missing title.');
        }else if (!label){
            setError('Missing label.')
        }else{
            uploadDocument();
            setSuccess('Picture uploaded.')
        }
    }

    const uploadDocument = async () => {

            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title);
            formData.append('label', label);

            try {
                const response = await axios.post('http://localhost:4000/api/upload-picture', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'x-access-token': localStorage.getItem('token')
                    }
                });

                if(response.data.error){
                    setError(response.data.error);
                }else if(response.data.success){
                    setSuccess(response.data.success);
                }
            }catch(error){
                setError(error);
            };
        
    }

    return(
        <section id='uploader' className='m-4 mt-8 md:ml-20'>
            {error?
                <p className='bg-rose-500 rounded p-2'>{error}</p>: null    
            }
            <h1 className='text-4xl'>Uppload new picture</h1>
            <form>
                <input type='file' className='cursor-pointer' name='documentFile' onChange={handleFileChange} />
                <section id='label flex flex-row m-4'>
                    <p>Title: </p>
                    <input className='border-1' onChange={handleTitleChange}/>
                    <p>Label: </p>
                    <input className='border-1' onChange={handleLabelChange}/>
                    <button className='flex border-1 border-white m-2 p-1 rounded-xl hover:bg-white hover:text-indigo-800' type='button' onClick={() => documentValidator()}>Submit</button>
                </section>
            </form>
        </section>
    )
}