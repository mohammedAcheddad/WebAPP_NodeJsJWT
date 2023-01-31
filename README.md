# *NodeJs JWT-secure website*

## Introduction

This report details the creation of a web application using Node.js and Express. The application serves as both the client-side and server-side and connects to a MongoDB database to manage user authentication and memo manipulation. The application uses JSON Web Tokens (JWT) for authentication, ensuring a simple and secure platform for users to create and manage their memos.

## Objectives

The main objectives of this application are:

-   To provide a secure platform for user authentication and account control.
-   To allow users to create, manage, and manipulate their memos.

## Design and Implementation

### User authentication and account control

The authentication system uses **JWT** to verify the identity of users and secure their account information. The application requires each user to provide a login and password, and generates a unique token upon successful authentication. The token is stored in the local storage of the client-side and is used for subsequent requests to the server.

In addition to authentication, the system also includes a registration process, which allows new users to create an account. The application also provides functionality for users to logout, delete their account, and modify their account information (including login, name, and password).

### ***Registration***
```javascript
//register
router.post("/register", async (req, res) => {
  const { login, pwd, pwd2, name } = req.body;
  if (!login || !pwd || !pwd2 || !name)
    return res.status(400).json({ message: "all fields are required" });
  if (pwd !== pwd2)
    return res.status(400).json({ message: "passwords don't match" });
  let searchUser = await User.findOne({ login: login });
  if (searchUser)
    return res.status(400).json({ message: "login already exists" });
  const mdpCrypted = await bcrypt.hash(pwd, 10);
  const user = new User({
    login: login,
    name: name,
    pwd: mdpCrypted,
    memos: [],
  });
  user.save()
    .then(() => res.status(201).json({ message: "success" }))
    .catch((err) => res.status(500).json({ message: err }));
});
```
>*this part is basic we just have to get data from the client (register form) ,then we should create a user with the info received and save this user in the database*      

> *the client side will be the same basic request with parameters taken from the form sent in the body of the request*

### ***Authentication***
```javascript
//login
router.post("/login", async (req, res) => {
  const { login, pwd } = req.body;
  const findUser = await User.findOne({ login: login });
  if(!findUser) return res.status(404).json({ message: "no user found" });
  const match = await bcrypt.compare(pwd, findUser.pwd);
  const hashedpass = findUser.pwd
  if (match) {
    const token = jwt.sign({ login ,hashedpass}, "SECRET", {
      expiresIn: "1h",
    });
return res.json({ message: "login success", token, name: findUser.name });
  }
  res.status(400).json({ message: "incorrect password" });
});
//logout
router.post("/logout", async (req, res) => {
  const token = req.headers.authorization;
  jwt.verify(token, "SECRET", (err, decoded) => {
    if (err) return res.status(400).json({ message: "invalid token" });
    res.json({ message: "logout success" });
  });
});
```
>*In the **login** we should check if the login provided exists in the database if **yes** we check if the password is correct if **yes** we create a **JWT**  using `jwt.sign()` and then we return the token and the user's name(to be displayed when logged)!* 
  
 >*Since you can't destroy a **token** we will just remove it from the client's local storage so we won't be doing much in the logout*  
 
 ***IMPORTANT!!!***

>*The process of using the token is as follows: 1). first we create the token(server-side login) 2). Then we send it to the client side where we store it to perform other operations using this token 3). Now we will have to send every time we need to perform an operation such as **Logout** or **add memo** (...) - the way we send it is by setting it in the authorization header -*
```javascript
export const authenticate= async (login,pwd)=>{
    const dataToSend = {login:login,pwd:pwd}
    await fetch(url+"/users/login",{method:"POST",body:JSON.stringify(dataToSend),headers:{
            'Content-Type': 'application/json'
        }
    }).then( async res=>{
        if(res.ok)
        {loginElement.classList.add("hidden")
            logoutElement.classList.remove("hidden")
            registerElement.classList.add("hidden")
            accountElement.classList.remove("hidden")
            viderLogin();
            viderAccount();
            await res.json().then(data=>{
                const {name}=data;
                const {token} = data
                logoutElement.children[0].innerText="Logout("+name+")"
                nameDisplay.innerText=name;
                emailDisplay.innerText= login;
                localStorage.setItem("token", token);
            }).catch(err=>alert(err));window.location="#application";}
        else{
            alert("echec d'authentification")}}).catch(err=>console.log(err));}
export const logout=()=>{
    const token = localStorage.getItem("token")
    fetch(url+"/users/logout",{ method:"POST",headers: {Authorization: token}}).then(res=>{
        if(res.ok)
        {
            logoutElement.children[0].innerText="Logout"
            logoutElement.classList.add("hidden")
            loginElement.classList.remove("hidden")
            registerElement.classList.remove("hidden")
            accountElement.classList.add("hidden")
            // suppression du JWT  du local Storage
            localStorage.removeItem("token");
        }
        else{
            alert("error dans le logout")
        }
    })
    .catch(err=>alert(err));
}
```
>in this section we have to functions that calls the login and logout routes the main use of authenticate when getting the response {token,name} is storing the token in the local storage for other uses, and as we mentioned earlier the logout function removes the token from the storage so we can't use it since we do not have it anymore.  

### ***User's deletion and account modifications(Improvements):***  
* ***Server-side:***
  
```javascript
//deleting a user 
router.delete("",async (req,res)=>{
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, "SECRET");
  try{
  const user= await User.findOne({login:decoded.login})
  if(!user)
      throw ("not allowed sorry") 
  // Deleting user from databse
  await User.findOneAndDelete({login:decoded.login})
  res.json({message:'delete with success'})
  }
  catch(err){res.status(500).send({message:err})}})
  
//update user's informations login/password/name
router.post("/update",async (req,res)=>{
  const {login, pwd , name} = req.body
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, "SECRET");
  const user= await User.findOne({login:decoded.login})
  if(login =="a" && pwd == "a")
    user.name = name;
  //we need to check in this case if there is another user with the same login
  if(name =="a" && pwd == "a"){
    user.login = login
    let searchUser = await User.findOne({ login: login });
    if (searchUser)
      return res.status(400).json({ message: "login already exists" });
  }
  if(login =="a" && name == "a")
    user.pwd = await bcrypt.hash(pwd, 10);
  //we need to create a new token since the data has been changed
  const newtoken = jwt.sign({ login:user.login ,pwd:user.pwd}, "SECRET", {
      expiresIn: "1h",
    });
  // saving the new user
  user.save()
  .then(() => res.status(201).json({ message: "saving succesful" ,token:newtoken,user:user}))
  .catch((err) => res.status(500).json({ message: err }));
})
```
>*This part is also very simple in deletion after recovering the token we decode it, then we delete the specific user.*
>*As for the update part we just need to alter the user's params and then save the user again in the database*  

* ***Client-side:***
  >*here's the Client-side*
```javascript
export const deleteUser=()=>{
    const token = localStorage.getItem("token")
    fetch(url+"/users",{ method:"DELETE",headers: {Authorization: token}
    }).then(res=>{
        if(res.ok)
        {//after deleting the user we need to logout
            logout();
        }
        else{alert("error while deleting the user")
        }
    })
    .catch(err=>alert(err));
}
export const Update= async (login = "a",pwd = "a",name="a")=>{
    const token = localStorage.getItem("token")
    const dataToSend = {login:login,pwd:pwd,name:name}
    await fetch(url+"/users/update",{
        method:"POST",
        body:JSON.stringify(dataToSend),
        headers:{
            'Content-Type': 'application/json',
            Authorization: token
        }
    }).then( async res=>{
        if(res.ok)
        {   alert("user info has been updated")
            await res.json().then(data=>{
                const {user}=data;
                const {token} = data;
                logoutElement.children[0].innerText="Logout("+user.name+")"
                nameDisplay.innerText=user.name;
                emailDisplay.innerText= user.login;
                localStorage.setItem("token", token);
            }).catch(err=>alert(err))
        }
        else{
            alert("cannot update informations")
        }
    })
    .catch(err=>console.log(err));
}
```
### Memos manipulation

The application allows users to create, delete, and show their memos. Each memo contains a date and content and is stored in the MongoDB database. Users can add new memos, delete existing memos, and retrieve a list of their memos.  

*We have 3 main functions list,add and delete a memo:*
>***They all use the same technique we send the token from the client in the request we verify the user/token and then we perform the operation:***
* ***Client-side:***    
```javascript
export const load = () => {
    loading.classList.remove("hidden");
    const token = localStorage.getItem("token");
    fetch(url + "/memos", {
        headers: {
        Authorization: token
    }
    })
    .then(res => {
        if (!res.ok) {
        throw new Error("Unauthorized");
        }
    return res.json();
    })
    .then(data => {
        data.forEach(element => {
            addMemoToTable(element);
         });
    })
    .catch(err => {
        alert("error");
        console.log(err);
    })
    .finally(() => {
        loading.classList.add("hidden");
    });}
export const addMemo=(content)=>{
    const token = localStorage.getItem("token");
    const dataToSend = {
        content:content,
        date:new Date()
    }
    fetch(url+"/memos",{
        method:"POST",
        body:JSON.stringify(dataToSend),
        headers:{
            'Content-Type': 'application/json',
            Authorization: token
        }
    }).then(res=>{
        if(res.ok)
        {
            res.json().then(data=>{
                addMemoToTable(data)
            })
        }
        else{
            alert("erreur")
        }
    })
    .catch(err=>{
        alert("erreur")
        console.log(err)
    })
}

export const deleteMemo=(id)=>{
    const token = localStorage.getItem("token");
    fetch(url+"/memos/"+id,{
        method:"DELETE",
        headers:{
            'Content-Type': 'application/json',
            Authorization: token
        }
    }).then(res=>{
        if(res.ok)
        {
            document.getElementById(id).remove();
        }
        else
            alert("error")
    })
    .catch(err=>{
        alert("erreur")
        console.log(err)
    })
}
```
* ***Server-side:***
  
```javascript
// POST route for adding a memo
router.post("", async (req, res) => {
    // Retrieve the date and content from the request body
    const { date, content } = req.body;
    // Validate date and content fields
    if (!date || !content) {
        return res.status(400).json({ message: "date and content are required" });
    }
    // Create a new memo
    const memo = new Memo({
        date: date,
        content: content
    });
    // Get the authorization token from the headers
    const token = req.headers.authorization;
    // Decode the token and get the user login
    const decoded = jwt.verify(token, "SECRET");
    try {
        // Save the memo
        const dataMemo = await memo.save();
        // Find the user by login
        const user = await User.findOne({ login: decoded.login });
        // Add the memo to the user's memos array
        user.memos.push(dataMemo);
        // Save the user
        const data = await user.save();
        // Return the latest memo added
        res.json(data.memos[data.memos.length - 1]);
    } catch (err) {
        // Return an error message
        res.status(500).send({ message: err });
    }
});

// GET route for listing memos
router.get("", async (req, res) => {
    // Get the authorization token from the headers
    const token = req.headers.authorization;
    try {
        // Decode the token and get the user login
        const decoded = jwt.verify(token, "SECRET");
        // Find the user by login
        const user = await User.findOne({ login: decoded.login });
        // Get the number of memos to return, or all if not specified
        const nbr = req.query.nbr || user.memos.length;
        // Filter the user's memos array to the specified number
        const dataToSend = user.memos.filter((elem, index) => index < nbr);
        // Return the filtered memo data
        res.json(dataToSend);
    } catch (err) {
        // Return an error message
        res.status(401).json({ message: "unauthorized" });
    }
});

// DELETE route for deleting a memo
router.delete("/:idMemo", async (req, res) => {
    // Get the authorization token from the headers
    const token = req.headers.authorization;
    // Decode the token and get the user login
    const decoded = jwt.verify(token, "SECRET");
    // Get the memo id from the request params
    const idMemo = req.params.idMemo;
    try {
        // Find the user by login
        const user = await User.findOne({ login: decoded.login });
		//if the memo doesnt exist throw exception
    if(!user.memos.find(memo=>memo._id==idMemo))
        throw ("not allowed sorry")
    // deleting from memos collection
      await Memo.findByIdAndDelete(idMemo)
	// deleting from user's memos
     user.memos.remove({_id:idMemo})
     await user.save();
    res.json({message:'delete with success'})    
    }
    catch(err){
        res.status(500).send({message:err})
    }
})
```
>*the code is well commented I guess it's clear
### Database integration

The MongoDB database stores all user information and memos. To manage this information, two schemas were created:

-   User schema: Contains information about each user, including their login, password, name, and list of memos.
-   Memo schema: Contains information about each memo, including its date and content.
```javascript
const schema= new mongoose.Schema({
    login:{
        type:String,
        required:true
    },
    pwd:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    memos:[schemaMemo]
})
const User=mongoose.model("users",schema)


const schema= new mongoose.Schema({
    date:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    }
})
const Memo=mongoose.model("memos",schema)
```

## Testing and Debugging

The application was manually tested and debugged by performing various actions and verifying the results. A video recording of the testing process is provided along with this report. The video demonstrates the functionality of the authentication system, memo manipulation, and database integration.

## Future Improvements

There is room for further improvement in this application. Some possible areas of improvement include:

-   Implementing a role-based authentication system.
-   Allowing users to share their memos with other users.
-  Use other types of databases other than MongoDB(I am aiming for oracle)

## Conclusion  

In summary, this web app offers a straightforward and secure method for users to create and manage their memos. It utilizes ***Node.js***, ***Express***, and ***MongoDB*** to create a system that is scalable and efficient. The utilization of ***JWT*** for authentication ensures the security of user information and the token is stored in the client-side local storage. The database integration involves two schemas for managing user information and memos. This report covers the design and implementation of the authentication system, memo management, database integration, and manual testing procedures, along with future improvements. The accompanying video demonstrates the app's features and functionality.
