import { Values } from "./values";
import { Vector3 } from "three";

export class Cell{


    private neighbours : Cell[] = [];
    private previousState : number = 0;
    private state : number = 0;
    private neighbourCount : number = 0;
    public readonly position : Vector3;

    constructor(startState : number,position : Vector3){
        this.state = startState;
        this.position = position;
    }

    

    public addNeighbour(neighbour : Cell){
        this.neighbours.push(neighbour);
        this.neighbourCount += neighbour.state;
    }

    public getState(){
        return this.state;
    }

    public getNeighbourCount() : number{
        return this.neighbourCount;
    }

    public setStateFromNeighbours(){
        this.neighbours.reduce((prev,curr) => curr.getState() + prev,0);
    }

    public increaseNeighbourCount(){
        this.neighbourCount++;
    }

    public decreaseNeighbourCount(){
        this.neighbourCount--;
    }

    public updateState() : boolean {
        this.previousState = this.state;
        if(this.state === 0 && this.neighbourCount >= Values.bornMin && this.neighbourCount <= Values.bornMax){
            this.state = 1;
            return true;
        }else if(this.state === 1 && this.neighbourCount < Values.surviveMin || this.neighbourCount > Values.surviveMax){
            this.state = 0;
            return true;
        }
        return false;
    }

    public upateNeighbours(){
        switch(this.state - this.previousState){
            case 1:
                this.neighbours.forEach(x => x.increaseNeighbourCount());
            break;
            case -1:
                this.neighbours.forEach(x => x.decreaseNeighbourCount());
                break;
        }
    }

}