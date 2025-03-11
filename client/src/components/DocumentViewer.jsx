import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";


export default function DocumentViewer() {

    const [ error, setError ] = useState('');
    const [ documents, setDocuments ] = useState([]);
    const [ formData, setFormData ] = useState({
        title: '',
        label: '',
        id: '',
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

    useLayoutEffect(() => {
        checkLogin();
    });

    useEffect(() => {
        getDocuments();
    },[documents]);

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

    const getDocuments = async () => {

            try{
                await axios.get('http://localhost:4000/api/get-documents', {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-access-token': localStorage.getItem('token')
                    }}
                ).then(response => {
                    if(response.data.documents){
                        setDocuments(response.data.documents);
                    } else if(response.error) {
                        setError(response.error);
                    } else {
                        setError('Something went wrong with getting the documents.');
                    }
                });

            }catch(error){
                setError('Something went wrong with getting the documents.')
            };

    };

    const displayDocuments = useMemo(() => {    // *** FEEDBACK WANTED *** I don't know if I'm using this hook correctly here
        
        if(documents.length === 0){

            return (
                <p>No documents uploaded.</p>
            );

        }else{

            return <section>test</section>,documents.map((document) => (

                <section className="flex gap-4 justify-between p-2" key={document.id}>
                    <p className="text-white w-[8rem] overflow-auto">{document.title}</p>
                    <p className="text-white flex-2 w-[6rem] overflow-auto">{document.label}</p>
                    <section className="flex-3 flex gap-2">
                        <button className="border-1 p-1 bg-green-700 hover:bg-green-500" value={document.id} onClick={() => editDocument(document)}>Edit</button>
                        <button className="border-1 p-1 bg-red-700 hover:bg-red-500" value={document.id} onClick={() => deleteDocument(document.id,document.filePath)}>Delete</button>
                    </section>
                </section>

            ));
        };
    });

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

    const displayEditor = useMemo(() => {

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

    });

    
    return(
        <>
            <section id='document-viewer' className='m-4 mt-8 md:ml-20'>
                {editMode?
                <section>
                    <p className="text-4xl">Editor</p>
                    {displayEditor}
                </section>:
                <section>
                    <p className="text-4xl">My Documents</p>
                    {displayDocuments}
                </section>
                }
            </section>
        </>
    )
}