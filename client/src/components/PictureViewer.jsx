import { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate } from 'react-router';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";


export default function PictureViewer() {

  const [ error, setError ] = useState('');
  const [ pictures, setPictures ] = useState([]);
  const [ myList, setMyList ] = useState([]);
  const [ myFilteredList, setMyFilteredList ] = useState([]);
  const [ formData, setFormData ] = useState({
    title: '',
    label: '',
    pictureId: '',
    filePath: ''
  });
  const [ filterFormData, setFilterFormData ] = useState({
    input: ''
  });
  const [ editMode, setEditMode ] = useState(false);
  const navigate = useNavigate();

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
    setMyFilteredList(pictures);
  };

  const handleFilterFormChange = (e) => {
    const { name, value } = e.target;
    setFilterFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
  };

  const sortPicturesAscending = (pictures, key) => {

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

  const sortPicturesDescending = (pictures, key) => {

    if(key === 'pictureId'){
      return pictures.sort((a,b) => {
        if(a[key] < b[key]) {
          return 1 
        };
        if(a[key] > b[key]) {
          return -1
        };
        return 0;
      });    
    } else {
      return pictures.sort((a,b) => {
        if(a[key].toLowerCase() < b[key].toLowerCase()) {
          return 1 
        };
        if(a[key].toLowerCase() > b[key].toLowerCase()) {
          return -1
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
    };
  });

  useEffect(() => {
    if(filterFormData.input !== ' '){
      setMyFilteredList(pictures.filter((picture) => picture.title.toLowerCase().includes(filterFormData.input.toLowerCase()) || picture.label.toLowerCase().includes(filterFormData.input.toLowerCase())));
    };
  },[filterFormData.input]);
  

  function checkLogin() {
    if (!localStorage.getItem('token')){
      navigate('/login');
    };

    if (localStorage.getItem('token')){
      try {
        const decoded = jwtDecode(localStorage.getItem('token'));
        if (Date.now() >= decoded.exp * 1000){
          navigate('/login');
        };
      }catch(error){
        console.log(error);
      };
    };
  };

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
        };
      });

    }catch(error){
      setError('Something went wrong with getting the pictures.')
    };

  };

  const editPicture = (myPicture) => {
    
    setFormData({
      title: myPicture.title,
      label: myPicture.label,
      pictureId: myPicture.pictureId,
      filePath: myPicture.filePath,
    });
  
    setEditMode(true);
  
  };

  const exiteditPicture = () => {
    setFormData({
      title: '',
      label: '',
      pictureId: '',
      filePath: '',
    });
    setEditMode(false);
  };
    
  const updatePicture = async () => {

    try {

      await axios.put(`http://localhost:4000/api/update-picture/${formData.pictureId}`, formData, {
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

  const deletePicture = (picture) => {

    try {
      axios.delete(`http://localhost:4000/api/delete-picture/${picture.pictureId}`, {
        data: {
          filePath: picture.filePath
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

      if(!filterFormData.input){

        return myList.map((picture) => (
                    
          <section className="md:flex gap-4 justify-between p-2" key={picture.pictureId}>
            <img src={'http://localhost:4000' + picture.filePath} className='border-2 object-cover h-[10rem] w-[10rem]' />
            <p className="text-white md:flex-1 md:w-[8rem] md:text-center">{picture.title}</p>
            <p className="text-white md:flex-2 md:w-[6rem] md:text-center">{picture.label}</p>
            <section className="flex md:flex-3 gap-2">
              <button className="border-1 p-1 bg-green-700 hover:bg-green-500 h-[2rem]" value={picture.id} onClick={() => editPicture(picture)}>Edit</button>
              <button className="border-1 p-1 bg-red-700 hover:bg-red-500 h-[2rem]" value={picture.id} onClick={() => deletePicture(picture)}>Delete</button>
            </section>
          </section>

        ));
      }else {
        
        return myFilteredList.map((picture) => (
                  
          <section className="md:flex gap-4 justify-between p-2" key={picture.pictureId}>
            <img src={'http://localhost:4000' + picture.filePath} className='border-2 object-cover h-[10rem] w-[10rem]' />
            <p className="text-white md:flex-1 md:w-[8rem] md:text-center">{picture.title}</p>
            <p className="text-white md:flex-2 md:w-[6rem] md:text-center">{picture.label}</p>
            <section className="flex md:flex-3 gap-2">
              <button className="border-1 p-1 bg-green-700 hover:bg-green-500 h-[2rem]" value={picture.id} onClick={() => editPicture(picture)}>Edit</button>
              <button className="border-1 p-1 bg-red-700 hover:bg-red-500 h-[2rem]" value={picture.id} onClick={() => deletePicture(picture)}>Delete</button>
            </section>
          </section>
        ));
      };
    };
  };

  function displayEditor() {

    return (
      <form id='editor'>
        <img src={'http://localhost:4000' + formData.filePath} className='border-2 object-cover h-[10rem] w-[10rem]' />
        <p>Name</p>
        <textarea name='title' value={formData.title} className="border-1 border-dashed resize" onChange={handleFormChange} />
        <p>Label</p>
        <textarea name='label' value={formData.label} className="border-1 border-dashed resize" onChange={handleFormChange}/>
        <br />
        <button type='button' className="border-1 p-1 bg-green-700 hover:bg-green-500" onClick={() => updatePicture(formData)}>Update</button>
        <button type='button' className="border-1 p-1 bg-red-700 hover:bg-red-500" onClick={exiteditPicture}>Cancel</button>
      </form>
    );
  };

    
    return(
      <section id='picture-viewer' className='m-4 mt-8 md:ml-20'>
        {editMode?
          <section>
            <p className="text-4xl">Editor</p>
            {displayEditor()}
          </section>:
          <section>
            <p className="text-4xl ml-[2rem]">My Pictures</p>
            <section id='sort-by' className="flex">
              <section id='sort-by-date' className="flex">
                <p className="flex pt-2">Date</p>
                <button onClick={() => setMyList(sortPicturesAscending(pictures, 'pictureId'))} className="flex p-1 pt-2 cursor-pointer font-bold hover:bg-white hover:text-indigo-800">&darr;</button>
                <button onClick={() => setMyList(sortPicturesDescending(pictures, 'pictureId'))} className="flex p-1 pt-2 cursor-pointer font-bold hover:bg-white hover:text-indigo-800">&uarr;</button>
              </section>
              <section id='sort-by-title' className="flex">
                <p className="flex pt-2">Title</p>
                <button onClick={() => setMyList(sortPicturesAscending(pictures, 'title'))} className="flex p-1 pt-2 cursor-pointer font-bold hover:bg-white hover:text-indigo-800">&darr;</button>
                <button onClick={() => setMyList(sortPicturesDescending(pictures, 'title'))} className="flex p-1 pt-2 cursor-pointer font-bold hover:bg-white hover:text-indigo-800">&uarr;</button> 
              </section>
              <section id='sort-by-label' className="flex">
                <p className="flex pt-2">Label</p>
                <button onClick={() => setMyList(sortPicturesAscending(pictures, 'label'))} className="flex p-1 pt-2 cursor-pointer font-bold hover:bg-white hover:text-indigo-800">&darr;</button>
                <button onClick={() => setMyList(sortPicturesDescending(pictures, 'label'))} className="flex p-1 pt-2 cursor-pointer font-bold hover:bg-white hover:text-indigo-800">&uarr;</button>
              </section>
              <section id='filter-by' className="flex">
                <input name='input' className="flex rounded-xl p-2 border-1 border-white h-8" onChange={handleFilterFormChange} placeholder='filter by label or title'></input>
              </section>
            </section>
            {displayPictures()}
          </section>
        }
      </section>
    )
  }