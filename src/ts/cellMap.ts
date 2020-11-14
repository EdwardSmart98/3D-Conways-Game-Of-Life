import { Cell } from "./cell";
import { Vector3, Geometry, BufferGeometry } from "three";
import * as THREE from 'three';
import { Values } from "./values";

const n = 0.01

export class CellMap {

    private spacing: number = 2;
    private size: number;
    private cellMap: Cell[] = [];
    private points: THREE.Points
    constructor(size: number, onIndex: number[], scene: THREE.Scene) {
        console.time('create');
        const geo = new THREE.BufferGeometry();
        const mat = new THREE.PointsMaterial({ size: 0.3,vertexColors : true});

        this.points = new THREE.Points(geo, mat);
        scene.add(this.points);
        this.size = size;
        this.cellMap = (Values.threeD ? this.createMapThree(onIndex) : this.createMap(onIndex))//this.createMap(onIndex);
        //console.log(this.createMapThree(onIndex));
        console.timeEnd('create');

    }



    public stepForward() {
        const changed = this.cellMap.filter(x => x.updateState());
        changed.forEach(x => x.upateNeighbours());
    }

    public drawMap() {
        const toShow = this.cellMap.filter(x => x.getState() === 1)
        const points = toShow.map(x => x.position);
        const pointArray = new Float32Array(points.length * 3);
        const color = new Float32Array(points.length * 3);

        for (let i = 0; i < points.length; i++) {
            const index = 3 * i;
            pointArray[index] = points[i].x;
            pointArray[index + 1] = points[i].y;
            pointArray[index + 2] = points[i].z;

            color[index] = (points[i].x * n) + 0.5;
            color[index + 1] = (points[i].y * n) + 0.5;
            color[index + 2] = (points[i].z * n) + 0.5;
        }
        const buffer = new THREE.Float32BufferAttribute(pointArray, 3);
        const colorBuffer = new THREE.Float32BufferAttribute(color,3);
        (this.points.geometry as BufferGeometry).setAttribute('position', buffer);
        (this.points.geometry as BufferGeometry).setAttribute('color', colorBuffer);
    }

    private createMapThree(onIndex: number[]): Cell[] {
        let next = onIndex.shift();
        const halfsize = this.size * 0.5;
        const threedMap: Cell[][][] = [];
        for (let z = 0; z < this.size; z++) {
            const square: Cell[][] = [];
            for (let y = 0; y < this.size; y++) {
                const row: Cell[] = [];
                for (let x = 0; x < this.size; x++) {
                    let on = next === ((this.size * this.size * z) + (this.size * y) + x);
                    if (on) {
                        next = onIndex.length > 0 ? onIndex.shift() : -1;
                    }
                    row.push(new Cell(on ? 1 : 0, new Vector3((x - halfsize) * this.spacing, (y - halfsize) * this.spacing, (z-halfsize) * this.spacing)));
                }
                square.push(row);
            }
            threedMap.push(square);
        }

        for (let z = 0; z < this.size; z++) {
            for (let y = 0; y < this.size; y++) {
                for (let x = 0; x < this.size; x++) {
                    const currentCell = threedMap[z][y][x];
                    for (let h = Math.max(0, z-1); h <= Math.min(this.size - 1, z + 1); h++) {
                        for (let i = Math.max(0, y-1); i <= Math.min(this.size - 1, y + 1); i++) {
                            for (let j = Math.max(0, x-1); j <= Math.min(this.size - 1, x + 1); j++) {
                                if ((j !== x || i !== y || h !== z)) {
                                    currentCell.addNeighbour(threedMap[h][i][j]);
                                }
                            }
                        }
                    }
                }
            }
        }
        const flatMap: Cell[] = [].concat(...[].concat(...threedMap));
        return flatMap;
    }


    private createMap(onIndex: number[]): Cell[] {
        let next = onIndex.shift();
        const halfsize = this.size * 0.5;
        const twoDMap: Cell[][] = [];
        for (let y = 0; y < this.size; y++) {
            const row: Cell[] = [];
            for (let x = 0; x < this.size; x++) {
                //console.log(((this.size *y) + x));
                let on = next === ((this.size * y) + x);
                if (on) {
                    next = onIndex.length > 0 ? onIndex.shift() : -1;
                }
                row.push(new Cell(Math.random() < 0.2 ? 1 : 0, new Vector3((x - halfsize) * this.spacing, (y - halfsize) * this.spacing, 0)));
            }
            twoDMap.push(row);
        }


        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const currentCell = twoDMap[y][x];
                for (let i = Math.max(0, y); i <= Math.min(this.size - 1, y + 1); i++) {
                    for (let j = Math.max(0, x); j <= Math.min(this.size - 1, x + 1); j++) {
                        if (!(j === x && i === y)) {
                            twoDMap[i][j].addNeighbour(currentCell);
                            currentCell.addNeighbour(twoDMap[i][j]);
                        }
                    }
                }
            }
        }
        const flatMap = [].concat(...twoDMap);
        return flatMap;
    }
}