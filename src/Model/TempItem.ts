class TempItem {
    bodyTemp : number;
    bodyPulse : number;

    constructor(bodyTemp : number, bodyPulse : number) {
        this.bodyTemp = bodyTemp;
        this.bodyPulse = bodyPulse;
    }


    public getBodyTemp() : number {
        return this.bodyTemp;
    }

    public getBodyPulse() : number {
        return this.bodyPulse;
    }

}