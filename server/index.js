const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const passwordValidator = require('password-validator');
const emailValidator = require('email-validator');
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');
const fs = require('fs');

// Restrictions
const notAllowedFileExtensions = [];  // Add banned file extensions here
const maxFileSize = 0;                // Set max size of files, 0 if there is no restrictions

// Password schema
const schema = new passwordValidator();
schema
.is().min(8)
.is().max(16)
.has().uppercase()
.has().lowercase()
.has().digits()
.has().not().spaces()

// App declarations
const app = express();
app.use(express.json(), cors(), fileUpload());
app.use('/pictures', express.static(__dirname + '/pictures'));

// Set the port variable
const PORT = 4000;

// Read token to find userId to verify ownership of task
const readTokenUserId = (req, res, next) => {

  const token = req.headers['x-access-token'];
  
  jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
    if(error){
      res.send({error: error});
      return;
    }
    else {
      userId = decoded.userId;
      if(!userId){
        res.send({error: 'Something went wrong verifying your user. Please log back in and try again later.'});
        return;
      }
      next();
    }
  });
};

// Endpoint to create a new photo
app.post('/api/upload-picture', readTokenUserId, async(req, res) => {

  const authorId = userId;
  const file = req.files.file;
  const fileName = file.name;
  const fileData = req.body;
  const directoryPath = __dirname+'/pictures/'+userId.toString();
  const fileExtension = (fileName) => {       // Gets file extension
    return '.'+fileName.substring(fileName.lastIndexOf('.')+1, fileName.length) || '.'+fileName;
  }

  if (fileExtension(fileName) in notAllowedFileExtensions){
    res.send({error: 'This filetype is not supported by your provider.'});
    return;
  }

  if (file.size > maxFileSize && maxFileSize!==0){
    res.send({error: `Filesizes greater than ${maxFileSize} is not allowed by your provider.`});
    return;
  }

  const fullPath = directoryPath+'/'+fileData.title+fileExtension(fileName);

  if (!req.files){
    res.send({error: 'No file uploaded.'});
    return;
  }

  const fileExists = await prisma.picture.findFirst({
    where: {
        authorId: authorId,
        title: fileData.title
    },
});

  if (fileExists){
    res.send({error: 'Photo with that name already exists. Please choose a new title.'});
    return;
  }

  if (!fs.existsSync(directoryPath)){       // Checks if destination folder exist and creates it if not
    fs.mkdir(directoryPath, {recursive: true}, err => {
      if(err){
        res.send({error: err})
        return;
      }
    });
  }

  file.mv(fullPath, async(error) => {      // The actual transfer of the file to it's destination
    if(error){
      res.send({error: error});
      return;
    }

    await prisma.picture.create({
      data: {
        filePath: `/pictures/${userId}/${fileData.title}${fileExtension(fileName)}`,
        title: fileData.title,
        label: fileData.label,
        authorId: authorId
      }
    });

    res.send({success: "Photo uploaded successfully."})
  });
});

// Endpoint to create a new user
app.post('/register', async (req, res) => {
    
  const registerData = req.body;


// missing data validations
  if(!registerData.email){
    res.send({error: "Missing email."});
    return;
  };

  if(!registerData.password){
    res.send({error: "Missing password."});
    return;
  };

  if(!registerData.fname){
    res.send({error: "Missing first name."});
    return;
  };

  if(!registerData.lname){
    res.send({error: "Missing last name."});
    return;
  };

  if(!registerData.username){
    res.send({error: "Missing username."});
    return;
  };

// password validation
  if(!schema.validate(registerData.password)){
    res.send({error: 'Password must be at least 8 characters and must contain one number.'});
    return;
  }

// email validation
  if(!emailValidator.validate(registerData.email)){
    res.send({error: 'Invalid email.'});
    return;
  }
  
  const emailExists = await prisma.user.findUnique({
    where: {
      email: registerData.email
    },
  });

  if (emailExists ){
    res.send({error: 'Email is already taken.'});
    return;
  }
  
  // user registration
  try {
    
    await prisma.user.create({
      data: {
        email: registerData.email,
        password: registerData.password,
        fname: registerData.fname,
        lname: registerData.lname,
        username: registerData.username
      }
    });

    res.send({success: 'Your account has been created with '+ registerData.email });
  }catch(error) {
    res.send({ error: 'Something went wrong. Please try again later.'});
    return;
  };

});

// Endpoint to get pictures
app.get('/api/get-pictures', readTokenUserId, async(req,res) => {

  const authorId = userId;
  
  const pictures = await prisma.picture.findMany({
    where: {
      authorId: authorId
    }
  });

  res.send({ pictures });

});


// Endpoint for user login and token
app.post('/login', async (req, res) => {

  const loginData = req.body;

  if(!loginData.email || !loginData.password ){
      res.send({error: 'Email or password is not provided.'});
      return;
  };

  try {
      const user = await prisma.user.findUnique({
          where: {
              email: loginData.email,
              password: loginData.password
          }
      });

      if(!user){
          res.send({error: 'Email or password is not valid.'});
          return;
      }
      
      res.send({
          token: jwt.sign({ userId: user.userId }, process.env.SECRET_KEY, { expiresIn: '1h' }), user
      });
  } catch(error) {
      res.send({error: error})
      return;
  };

});

// Start the server on the specified port
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
