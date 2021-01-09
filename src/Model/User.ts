class User {
    name: string;
    email: string;
    uid: string;

    constructor(name: string,email:string,uid:string) {
        this.name = name;
        this.email = email;
        this.uid = uid;
    }

    public getName() : string {
        return this.name;
    }

    public getEmail() : string {
        return this.email;
    }

    public getUid() : string {
        return this.uid;
    }
}