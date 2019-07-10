class User{

    constructor(name, gender, birth, country, email, password, photo, admin){
        this._id;
        this._name = name;
        this._gender = gender;
        this._birth = birth;
        this._country = country;
        this._email = email;
        this._password = password;
        this._photo = photo;
        this._admin = admin;
        this._register = new Date();
    }

    get id(){
        return this._id;
    }
    set id(value){
        this._id = value;
    }
    get name(){
        return this._name;
    }
    get gender(){
        return this._gender;
    }
    get birth(){
        return this._birth;
    }
    get country(){
        return this._country;
    }
    get email(){
        return this._email;
    }
    get photo(){
        return this._photo;
    }
    set photo(value){
        this._photo = value;
    }
    get admin(){
        return this._admin;
    }
    get register(){
        return this._register;
    }
    loadFromJSON(dataJSON){
        for(let name in dataJSON){
            switch(name){
                case '_register': this[name] = new Date(dataJSON[name]);break;
                default: this[name] = dataJSON[name];
            }
        }
    }

    save(){
        let users = User.getUsersStorage();

        if(this.id >0){
            // aray map ele mapeia um array e a posicao de acordo copm os dados que passo e podes modificar
            users.map(u=>{
                if(u._id == this.id){
                    Object.assign(u,this);
                }
                //retorna o item cada um deles
                return u;
            });
        }else{
            this.id = this.getNewId();
            users.push(this);
        }
        //sessionStorage.setItem("users",JSON.stringify(users));
        localStorage.setItem("users",JSON.stringify(users));
    }

    getNewId(){
        let usersId = parseInt(localStorage.getItem("usersId"));
        if(!usersId > 0) usersId = 0;
        usersId++;
        localStorage.setItem("usersId",usersId);
        return usersId;
    }

    static getUsersStorage(){
        let users = [];
        if(localStorage.getItem("users")){
            users = JSON.parse(localStorage.getItem("users"));
        }
        return users;
    }

    remove(){
        let users = User.getUsersStorage();
        users.forEach((u, index) => {
            if(this.id == u._id){
                users.splice(index,1);
            }
        });
        localStorage.setItem("users",JSON.stringify(users));
    }

}