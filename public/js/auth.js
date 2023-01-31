import { accountElement, emailDisplay, loginElement, logoutElement, nameDisplay, registerElement, url } from "./config.js"
import { viderAccount, viderLogin, viderRegister } from "./main.js";

export const authentify= async (login,pwd)=>{
    const dataToSend = {login:login,pwd:pwd}
    await fetch(url+"/users/login",{
        method:"POST",
        body:JSON.stringify(dataToSend),
        headers:{
            'Content-Type': 'application/json'
        }
    }).then( async res=>{
        if(res.ok)
        {
            loginElement.classList.add("hidden")
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
            }).catch(err=>alert(err))
            window.location="#application"
        }
        else{
            alert("echec d'authentification")
        }
    })
    .catch(err=>console.log(err));
}

export const logout=()=>{
    const token = localStorage.getItem("token")
    fetch(url+"/users/logout",{ 
        method:"POST",
        headers: {
            Authorization: token
        }
    }).then(res=>{
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

export const register =(email,name,pwd,pwd2)=>{

    const dataToSend={
        login:email,
        name:name,
        pwd:pwd,
        pwd2:pwd2
    }
    fetch(url+"/users/register",{
        method:"POST",
        body:JSON.stringify(dataToSend),
        headers:{
            'Content-Type': 'application/json'
        }
    }).then(res=>{
        if(res.ok)
        {
            alert("success");
            window.location="#login"
            viderRegister();
            //vider
        }
        else{
            res.json()
            .then(data=>{
                const {message}=data;
                alert(message)
            })
            .catch(err=>{ alert("erreur");
                        console.log(err);
                    })
        }
    })
    .catch(err=>{
        alert("erreur");
        console.log(err);
    });

}

export const deleteUser=()=>{
    const token = localStorage.getItem("token")
    fetch(url+"/users",{ 
        method:"DELETE",
        headers: {
            Authorization: token
        }
    }).then(res=>{
        if(res.ok)
        {
            //after deleting the user we need to logout
            logout();
        }
        else{
            alert("error while deleting the user")
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