class UserModel {
    name: string;
    email: string;
    verified: boolean;
    uid: string;

    constructor(name: string,email:string,verified:boolean,uid:string) {
        this.name = name;
        this.email = email;
        this.verified = verified;
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

    public isVerified() : boolean {
        return this.verified;
    }
}