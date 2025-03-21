import { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate } from 'react-router';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';


export default function PictureViewer() {

    const [ error, setError ] = useState('');
    const [ pictures, setPictures ] = useState([]);
    const [ myList, setMyList ] = useState([]);
    const [ formData, setFormData ] = useState({
        title: '',
        label: '',
        pictureId: '',
        filePath: '',
        fileName: ''
    });
    const [ editMode, setEditMote ] = useState(false);
    const navigate = useNavigate();

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const sortPictures = (pictures, key) => {

        if(key === 'pictureId'){
            return pictures.sort((a,b) => {
                if(a[key] < b[key]) {
                    return -1 
                };
                if(a[key] > b[key]) {
                    return 1
                };
                return 0;
            });    
        } else {
            return pictures.sort((a,b) => {
                if(a[key].toLowerCase() < b[key].toLowerCase()) {
                    return -1 
                };
                if(a[key].toLowerCase() > b[key].toLowerCase()) {
                    return 1
                };
                return 0;
            });
        };
    };


    useLayoutEffect(() => {
        checkLogin();
        getPictures();
    });

    useEffect(() => {
        if(pictures.length !== myList.length){
            setMyList(pictures);
        }
    });

    function checkLogin() {
        if (!localStorage.getItem('token')){
            navigate('/login');
        };

        if (localStorage.getItem('token')){
            try {
                const decoded = jwtDecode(localStorage.getItem('token'));
                if (Date.now() >= decoded.exp * 1000){
                    navigate('/login');
                }
            }catch(error){
                console.log(error);
            };
        };
    }

const getPictures = async () => {

        try{
            await axios.get('http://localhost:4000/api/get-pictures', {
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': localStorage.getItem('token')
                }}
            ).then(response => {
                if(response.data.pictures){
                    setPictures(response.data.pictures);
                } else if(response.error) {
                    setError(response.error);
                } else {
                    setError('Something went wrong with getting the pictures.');
                }
            });

        }catch(error){
            setError('Something went wrong with getting the pictures.')
        };

};

    const editDocument = (myDocument) => {
        
        setFormData({
            title: myDocument.title,
            label: myDocument.label,
            id: myDocument.id,
            filePath: myDocument.filePath,
            fileName: myDocument.fileName
        });
        setEditMote(true);
    };

    const exitEditDocument = () => {
        setFormData({
            title: '',
            label: '',
            id: '',
            filePath: '',
            fileName: ''
        });
        setEditMote(false);
    };
    
    const updateDocument = async () => {

        const documentId = formData.id;

        try {

            await axios.put(`http://localhost:4000/api/update-document/${documentId}`, formData, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': localStorage.getItem('token')
                }
            }).then(response => {
                if(response.data.success){
                    window.location.reload();
                } else if(response.data.error){
                    setError(response.data.error);
                } else {
                    setError('Something went wrong. Please try again later.')
                };
            });
        }catch(error){
            setError(error);
        };
    };

    const deleteDocument = (id,path) => {

        try {

            axios.delete(`http://localhost:4000/api/delete-document/${id}`, {
                data: {
                    path: path
                },
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': localStorage.getItem('token')
                }
            }).then(response => {
                if(response.data.success){
                    window.location.reload();
                } else if(response.data.error){
                    setError(response.data.error);
                } else {
                    setError('Something went wrong. Please try again later.')
                };
            });
            
        }catch(error){
            setError(error);
        };
    };

    const displayPictures = () => {
        
        if(myList.length === 0){

            return (
                <p>No picture uploaded.</p>
            );

        }else{

            return myList.map((picture) => (

                <section className="flex gap-4 justify-between p-2" key={picture.pictureId}>
                    <img src={'http://localhost:4000' + picture.filePath} className='border-2 object-cover h-[10rem] w-[10rem]' />
                    <p className="text-white w-[8rem] text-center">{picture.title}</p>
                    <p className="text-white flex-2 w-[6rem] text-center">{picture.label}</p>
                    <section className="flex-3 flex gap-2">
                        <button className="border-1 p-1 bg-green-700 hover:bg-green-500 h-[2rem]" value={picture.id} onClick={() => editDocument(document)}>Edit</button>
                        <button className="border-1 p-1 bg-red-700 hover:bg-red-500 h-[2rem]" value={picture.id} onClick={() => deleteDocument(document.id,document.filePath)}>Delete</button>
                    </section>
                </section>

            ));
        };
    };

    function displayEditor() {  // WIP

        return (
            <form id='editor'>
                <p>Name</p>
                <textarea name='title' value={formData.title} className="border-1 border-dashed resize" onChange={handleFormChange} />
                <p>Label</p>
                <textarea name='label' value={formData.label} className="border-1 border-dashed resize" onChange={handleFormChange}/>
                <br />
                <button type='button' className="border-1 p-1 bg-green-700 hover:bg-green-500" onClick={() => updateDocument(document.id)}>Update</button>
                <button type='button' className="border-1 p-1 bg-red-700 hover:bg-red-500" onClick={exitEditDocument}>Cancel</button>
            </form>
        )

    };

    
    return(
        <>
            <section id='picture-viewer' className='m-4 mt-8 md:ml-20'>
                {editMode?
                <section>
                    <p className="text-4xl">Editor</p>
                    {displayEditor()}
                </section>:
                <section>
                    <p className="text-4xl ml-[2rem]">My Pictures</p>
                    <DropdownButton id="viewer-sort-by" title="Sort by:" className="cursor-pointer font-bold border-1 border-white w-[120px] rounded mb-20">
                        <Dropdown.Item onClick={() => setMyList(sortPictures(pictures, 'pictureId'))} className="flex cursor-pointer font-bold border-1 hover:bg-white hover:text-indigo-800 border-white w-[120px] rounded">Date</Dropdown.Item>
                        <Dropdown.Item onClick={() => setMyList(sortPictures(pictures, 'title'))} className="flex cursor-pointer font-bold border-1 hover:bg-white hover:text-indigo-800 border-white w-[120px] rounded">Title</Dropdown.Item>
                        <Dropdown.Item onClick={() => setMyList(sortPictures(pictures, 'label'))} className="flex cursor-pointer font-bold border-1 hover:bg-white hover:text-indigo-800 border-white w-[120px] rounded">Label</Dropdown.Item>
                    </DropdownButton>
                    {displayPictures()}
                </section>
                }
            </section>
        </>
    )
}