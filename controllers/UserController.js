class UserController{

    constructor(formId, formUpdateId, tableBodyId){
        this.formEl = document.getElementById(formId);
        this.formUpdateEl = document.getElementById(formUpdateId);
        this.tableBody = document.getElementById(tableBodyId);
        this.onSubmit();
        this.onEditCancel();
        this.selectAll();
    }

    onEditCancel(){
        this.formUpdateEl.querySelector(".btn-cancel").addEventListener("click",e=>{
            e.preventDefault();
            this.formUpdateEl.reset(); 
            this.showOrHidePanel(false);
        });
        this.formUpdateEl.addEventListener("submit", e=>{
            e.preventDefault();
            let btn = this.formUpdateEl.querySelector("[type=submit]");
            btn.disabled = true;
            let values = this.getValues(this.formUpdateEl);
            let index = this.formUpdateEl.dataset.trIndex;
            let tr = this.tableBody.rows[index];

            let userOld = JSON.parse( tr.dataset.user);
            //unir os objectos criando um novo o metodo subescreve os objectos a esquerda
            let result = Object.assign({}, userOld, values);

            this.getPhoto(this.formUpdateEl).then(
                (content)=>{
                    if(!values.photo) {
                        result._photo = userOld._photo;
                    }
                        
                    else{
                        result._photo = content;
                    }
                    let user = new User();
                    user.loadFromJSON(result);
                    user.save();
                    this.getTr(user,tr);
                    this.updateCount();
                    this.showOrHidePanel(false);

                    this.formUpdateEl.reset();
                    btn.disabled = false;
                },
                (e)=>{
                    console.error(e);
                }
            );
        });
    }

    onSubmit(){
        //se a arrow function recebe um parametro n precisa colocar parenteses
        this.formEl.addEventListener("submit",event=>{
            //volte o formulario n modo padrao e nao dispara accoes padrao
            event.preventDefault();
            let btn = this.formEl.querySelector("[type=submit]");
            btn.disabled = true;
            let values = this.getValues(this.formEl);
            
            if(values !== false){
                this.getPhoto(this.formEl).then(
                    (content)=>{
                        values.photo = content;
                        values.save();
                        this.addUser(values);
                        this.formEl.reset();
                        btn.disabled = false;
                    },
                    (e)=>{
                        console.error(e);
                    }
                );
            }
        });
    }

    getPhoto(formEl){
        return new Promise((resolve, reject)=>{
            let fileReader = new FileReader();

            let elements = [...formEl.elements].filter(item=>{
                if(item.name === "photo")
                    return item;
            });
            let file = elements[0].files[0]

            fileReader.onload = ()=>{
                resolve(fileReader.result);
            }

            fileReader.onerror = (e)=>{
                reject(e);
            }
            if(file)
                fileReader.readAsDataURL(file);
            else
                resolve("dist/img/boxed-bg.jpg");
        });
        
    }

    getValues(formEl){
        let user = {};
        //spreed novo operador para usar o foeach em objectos [...object]
        let isValid = true;
        [...formEl.elements].forEach(function(field, index){

            if(['name','email','password'].indexOf(field.name)>-1 && !field.value){
                field.parentElement.classList.add('has-error');
                isValid = false;
            }
            if(field.type === "radio"){
        
                if(field.checked){
        
                    user[field.name] = field.value;
                }
            }
            else if(field.type === "checkbox"){
                if(field.checked)
                    user[field.name] = field.checked;
            }
            else{
                user[field.name] = field.value;
            }
        });
        if(!isValid)
            return false;
        return new User(user.name,user.gender, user.birth, user.country, user.email, user.password, user.photo, user.admin);
    }

    

    selectAll(){
        let users = User.getUsersStorage();
        users.forEach(dataUser=>{
            let user = new User();
            user.loadFromJSON(dataUser);
            this.addUser(user);
        });
    }

    addUser(dataUser){
        let tr = this.getTr(dataUser);
        
        this.tableBody.appendChild(tr);
        this.updateCount();
    }

    getTr(dataUser, tr=null){
        if(tr === null) tr = document.createElement("tr");
        tr.dataset.user = JSON.stringify(dataUser);
        tr.innerHTML = `
        <tr>
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin)? "sim":"nao"}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
            <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
            <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        </tr>
        `;
        this.addEventsTr(tr);
        return tr;
    }

    showOrHidePanel(operation = true){
        if(operation){
            document.getElementById("box-user-create").style.display = "none";
            document.getElementById("box-user-update").style.display = "block";
        }else{
            document.getElementById("box-user-update").style.display = "none";
            document.getElementById("box-user-create").style.display = "block";
        }
    }

    updateCount(){
        let numberUsers = 0;
        let numberAdmin = 0;
        [...this.tableBody.children].forEach(tr=>{
            let user = JSON.parse(tr.dataset.user);
            numberUsers++;
            if(user._admin)
                numberAdmin++;
        });
        document.getElementById("number-user").innerHTML = numberUsers;
        document.getElementById("number-admin").innerHTML = numberAdmin;
    }

    addEventsTr(tr){
        tr.querySelector(".btn-delete").addEventListener("click", e=>{
            if(confirm("deseja excluir?")){
                let user = new User();
                user.loadFromJSON(JSON.parse(tr.dataset.user));
                user.remove();
                tr.remove();
                this.updateCount();
            }
        });
        tr.querySelector(".btn-edit").addEventListener("click", e=>{
            let json = JSON.parse(tr.dataset.user);
            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;
            for(let name in json){
                let field = this.formUpdateEl.querySelector("[name="+name.replace("_","")+"]");
                if(field){
                    switch(field.type){
                        case "file":
                            continue; 
                            break;
                        case "radio":
                            field = this.formUpdateEl.querySelector("[name="+name.replace("_","")+"][value="+json[name]+"]");
                            field.checked = true;
                            break;
                        case "checkbox":
                            field.checked = json[name];
                            break;
                        default:
                            field.value = json[name];
                    }
                }
            }
            this.formUpdateEl.querySelector(".photo").src = json._photo;
            this.showOrHidePanel();
        });
    }
}