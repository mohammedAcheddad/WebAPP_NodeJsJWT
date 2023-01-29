import {addBtn, emailLogin, emailRegister, loginBtn, logoutElement, memoInput, nameRegister, passwordLogin, passwordRegister, passwordRegister2, registerBtn, resetBtn, tbody} from "./config.js"
import {authentify, logout, register} from "./auth.js"
import { addMemo, deleteMemo, load } from "./memos.js";

window.addEventListener('popstate', function (event) {
	singlePageManger(getPath())
});

loginBtn.addEventListener('click',async ()=>{
   const login = emailLogin.value
   const pwd = passwordLogin.value
   if(!login  || !pwd)
    return alert("please complete all fileds")
   await authentify(login,pwd)
   singlePageManger("#application")
})

logoutElement.addEventListener('click',()=>{
    logout();
    singlePageManger("#login");
})

resetBtn.addEventListener('click',()=>{
    memoInput.value=""
})

addBtn.addEventListener('click',()=>{
    const content=memoInput.value
    if(!content)
        return alert("please provide a content for your memo")
    
    addMemo(content)
})

registerBtn.addEventListener('click',()=>{
    // Recuperation des valeurs
    const email = emailRegister.value
    const name = nameRegister.value
    const pwd = passwordRegister.value
    const pwd2 = passwordRegister2.value

    // verification des valeurs
    if(!email || !name || !pwd || !pwd2)
        return alert("please fill all inputs")

    if(pwd!=pwd2)
        return alert("passwords didn't match")
    
   
    // appel de la methode register
    register(email,name,pwd,pwd2)

})
export const viderRegister = ()=>{
    emailRegister.value=""
    nameRegister.value=""
    passwordRegister.value=""
    passwordRegister2.value=""
}
export const viderLogin = ()=>{
    passwordLogin.value=""
    emailLogin.value=""
}


export const addMemoToTable=(memo)=>{
    const {date,content,_id} = memo

    // creation des elemments
    const tr= document.createElement("tr")
    const td1= document.createElement("td")
    const td2= document.createElement("td")
    const td3= document.createElement("td")
    const td4= document.createElement("td")
    const btn= document.createElement("button")

    // liaison parent.appendChild(fils)
    tr.appendChild(td1)
    tr.appendChild(td2)
    tr.appendChild(td3)
    tr.appendChild(td4)
    td4.appendChild(btn)

    tr.setAttribute("id",_id);
    //remplissage
    td1.innerText=_id
    td2.innerText=content
    td3.innerText=date
    btn.innerText="delete"

    btn.classList.add("delete")
    btn.addEventListener("click",()=>{
        //TODO : call fetch delete + delete row
        deleteMemo(_id)
    })

    tbody.appendChild(tr)
}

const getPath=()=>window.location.hash || '#welcome'
const singlePageManger = (path)=>{
    console.log(path)
    if(path=="#application")
    {
        tbody.innerText=""
        if(localStorage.getItem("token")){
         load();
        }
    }
    const components=document.getElementsByClassName("component")
    Array.from(components).forEach(element=>{
        element.classList.add('hidden');
    })
    const links=document.querySelectorAll('header nav li')
    Array.from(links).forEach(element=>{
        element.classList.remove('selected');
    })
    document.querySelector(path).classList.remove('hidden')
    document.querySelector('header nav li:has(a[href="'+path+'"])').classList.add('selected')
}
singlePageManger(getPath())
