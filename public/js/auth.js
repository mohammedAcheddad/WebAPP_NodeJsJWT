import { loginElement, logoutElement, url } from "./config.js"
import { viderLogin, viderRegister } from "./main.js";

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
            window.location="#application"
            loginElement.classList.add("hidden")
            logoutElement.classList.remove("hidden")
            viderLogin();
            await res.json().then(data=>{
                const {name}=data;
                const {token} = data
                logoutElement.children[0].innerText="Logout("+name+")"
                localStorage.setItem("token", token);
            }).catch(err=>alert(err))
        }
        else{
            alert("echec d'authentification")
        }
    })
    .catch(err=>console.log(err));

    let a = localStorage.getItem("token")
    console.log(a)
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