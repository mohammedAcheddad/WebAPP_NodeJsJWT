import {addBtn, changeLoginBtn, changeNameBtn, changePasswordBtn, deleteBtn, emailDisplay, emailLogin, emailRegister, loginBtn, logoutElement, memoInput, nameDisplay, nameRegister, passwordLogin, passwordRegister, passwordRegister2, registerBtn, resetBtn, tbody} from "./config.js"
import {authentify, deleteUser, logout, register, Update} from "./auth.js"
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
deleteBtn.addEventListener('click',async ()=>{
    alert("Are you sure you want to delete this account?")
    deleteUser();
    singlePageManger("#login");
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
export const viderAccount = ()=>{
    nameDisplay.innerText="name";
    emailDisplay.innerText="login";
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
    if(path=="#application")
    {
        tbody.innerText=""
        console.log(localStorage.getItem("token"))
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

        // Initialize the dialog
$("#dialog-form").dialog({
    autoOpen: false,
    modal: true,
    buttons: {
        "Change Password": function() {
        const newPassword = $("#new-password").val();
        Update("a",newPassword,"a")
        $(this).dialog("close");
        },
        Cancel: function() {
        $(this).dialog("close");
        }
    }
    });

$("#dialog-form-name").dialog({
    autoOpen: false,
    modal: true,
    buttons: {
    "Save": function() {
        const newName = $("#new-name").val();
        Update("a","a",newName)
        $(this).dialog("close");
    },
    Cancel: function() {
        $(this).dialog("close");
    }
    }
});

$("#dialog-form-login").dialog({
    autoOpen: false,
    modal: true,
    buttons: {
    "Save": function() {
        const newLogin = $("#new-login").val();
        Update(newLogin);
        $(this).dialog("close");
    },
    Cancel: function() {
        $(this).dialog("close");
    }
    }
});

// Show the dialog when the change name button is clicked
changeNameBtn.addEventListener("click", function() {
    $("#dialog-form-name").dialog("open");
    });

    // Show the dialog when the change login button is clicked
changeLoginBtn.addEventListener("click", function() {
        $("#dialog-form-login").dialog("open");
        });

    // Show the dialog when the change password button is clicked
changePasswordBtn.addEventListener("click", function() {
    $("#dialog-form").dialog("open");
    });

