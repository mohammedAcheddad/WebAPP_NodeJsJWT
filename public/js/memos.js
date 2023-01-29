import { loading, url } from "./config.js";
import { addMemoToTable } from "./main.js";



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
            console.log(Headers.Authorization)
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
    });
}


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