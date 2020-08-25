import { Cell } from "./cell";
import { Vector3, Geometry, BufferGeometry } from "three";
import * as THREE from 'three';

export class CellMap {

    private spacing: number = 2;
    private size: number;
    private cellMap: Cell[] = [];
    private points: THREE.Points
    constructor(size: number, onIndex: number[], scene: THREE.Scene) {
        const geo = new THREE.BufferGeometry();
        const mat = new THREE.PointsMaterial({ size: 1.4, color: 0x00ff00 });

        this.points = new THREE.Points(geo, mat);
        scene.add(this.points);
        this.size = size;
        this.cellMap = this.createMap(onIndex);
    }



    public stepForward() {
        const changed = this.cellMap.filter(x => x.updateState());
        changed.forEach(x => x.upateNeighbours());
    }

    public drawMap() {
        const toShow = this.cellMap.filter(x => x.getState() === 1)
        const points = toShow.map(x => x.position);
        const pointArray = new Float32Array(points.length * 3);
        for (let i = 0; i < points.length; i++) {
            const index = 3 * i;
            pointArray[index] = points[i].x;
            pointArray[index + 1] = points[i].y;
            pointArray[index + 2] = points[i].z;
        }
        const buffer = new THREE.BufferAttribute(pointArray, 3);
        (this.points.geometry as BufferGeometry).setAttribute('position', buffer);
    }


    private createMap(onIndex: number[]): Cell[] {
        const halfsize = this.size * 0.5;
        const twoDMap: Cell[][] = [];
        for (let y = 0; y < this.size; y++) {
            const row: Cell[] = [];
            for (let x = 0; x < this.size; x++) {
                const on = (onIndex.includes((y * this.size) + x))
                row.push(new Cell(on ? 1 : 0, new Vector3((x-halfsize) * this.spacing, (y-halfsize) * this.spacing, 0)));
            }
            twoDMap.push(row);
        }


        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const currentCell = twoDMap[y][x];
                for (let i = Math.max(0, y - 1); i <= Math.min(this.size - 1, y + 1); i++) {
                    for (let j = Math.max(0, x - 1); j <= Math.min(this.size -1 , x + 1); j++) {
                        if (!(j === x && i === y)) {
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