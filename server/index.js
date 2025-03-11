const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const passwordValidator = require('password-validator');
const emailValidator = require('email-validator');
const jwt = require('jsonwebtoken');
const fileUpload = require('express-fileupload');
const fs = require('fs');

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
app.use('/pictures', express.static(__dirname+'/pictures'));

// Set the port variable
const PORT = 4000;

// Read token to find userId to verify ownership of task
const readTokenUserId = (req, res, next) => {

  const token = req.headers['x-access-token'];
  
  jwt.verify(token, process.env.SECRET_KEY, (error, decoded) => {
    if(error){
      res.send({error: error.message});
      return;
    }
    else {
      userId = decoded.userId;
      next();
    }
  });
};

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
          token: jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: '1h' }), user
      });
  } catch(error) {
      res.send({error: error})
      return;
  };

});

// Endpoint to upload a new document WIP
app.post('/api/upload-picture', readTokenUserId, async(req, res) => {

  const authorId = userId;
  const file = req.files.file;
  const fileData = req.body;
  const directoryPath = __dirname+'/pictures/'+userId.toString();

  const fullPath = directoryPath+'/'+fileData.title;

  const fileExists = await prisma.document.findFirst({
    where: {
        authorId: authorId,
        title: fileData.title
    },
});

  if (fileExists){
    res.send({error: 'File with that name already exists. Please choose a new title.'});
    return;
  }

  if (!req.files){
    res.send({error: 'No file uploaded.'});
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

    await prisma.document.create({
      data: {
        fileName: fileData.title+pdfExtension,
        filePath: fullPath,
        title: fileData.title,
        label: fileData.label,
        authorId: authorId
      }
    });

    res.send({success: "PDF uploaded successfully."})
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

// Start the server on the specified port
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
