import { Train, JumpObstacle, RollObstacle } from "./objects.js";

const choices = [
    null, Train, JumpObstacle, RollObstacle
]

export class ChunkManager{
    constructor(scene, world, player, chunk_length, visible_chunks, speed, material){
        this.scene = scene;
        this.world = world;
        this.player = player;
        this.chunk_length = chunk_length;
        this.visible_chunks = visible_chunks;

        this.base_speed = speed;
        this.speed = speed;
        this.max_speed = 25;
        this.acceleration = 5;

        this.GLTFloader = new THREE.GLTFLoader();
        this.FBXloader = new THREE.FBXLoader();
 
        this.chunk = [];
        this.number_chunks = 1;

        this.material = material;
    }

    generateChunk(){
        const group = new THREE.Group();

        const matrix_ocuppied = []; 
        for(let i = 0; i < this.chunk_length; i++){
            matrix_ocuppied[i] = [];
            for(let j = 0; j < 3; j++){
                matrix_ocuppied[i][j] = 0;
            }
        }

        let camino = new Set([0,1,2])
        for(let i = 0; i < this.chunk_length; i++){
            let total_ocuppied = Math.min(matrix_ocuppied[i][0],1) + Math.min(matrix_ocuppied[i][1],1) + Math.min(matrix_ocuppied[i][2],1);
            for(let j = 0; j < 3 ; j++){
                if(total_ocuppied < 2 && !matrix_ocuppied[i][j]){
                    if(!((camino.size == 1 && camino.has(j)) || (camino.size==2 && camino.has(j) && (camino.has(j+2) || camino.has(j-2))))){
                        let create = Math.floor(Math.random() * choices.length);
                        if (create){
                            let obj = new choices[create](2*(j-1), -i, null, this.material);
                            if (obj.isFBX)
                                obj.loader = this.FBXloader;
                            else
                                obj.loader = this.GLTFloader;

                            if ((obj.length + i - 1)<this.chunk_length){
                                obj.init();
                                this.world.addBody(obj.mesh.body);
                                
                                group.add(obj.mesh);
                                
                                obj.createFBX(group)

                                let needs = 3;
                                if(obj.code==2) needs = 10;
                                for(let o = 0; o < obj.length+needs; o++){
                                    if (i+o < this.chunk_length){
                                        matrix_ocuppied[i+o][j] = obj.code;
                                        
                                    }
                                }
                                total_ocuppied++;
                            }
                        }
                    }
                }
            }
            for (let j = 0; j< 3; j++){
                if(matrix_ocuppied[i][j] == 1)
                    camino.delete(j)
                else{
                    if(camino.has(j-1) || camino.has(j+1))
                        camino.add(j)
                }
            }
        }
        let position = -100;
        if(this.chunk.length)
            position = this.chunk[this.chunk.length - 1].position.z - this.chunk_length;
        group.position.z =  position - 5; 

        this.scene.add(group); 
        
        group.traverse(obj => {
                if (obj.body) {
                    obj.body.position.set(obj.position.x,obj.position.y,obj.position.z+group.position.z);
                }
            });
        this.chunk.push(group);

    }

    init(){
        for(let i = 0; i < this.visible_chunks; i++){
            this.generateChunk();
        }
    }

    update(delta) {
        if (this.speed < this.max_speed) {
        this.speed += this.acceleration * delta * (0.01);
    }

        for (let chunk of this.chunk) {
            chunk.position.z += this.speed * delta;
            chunk.children.forEach(obj => {
                if (obj.body) {
                    obj.body.position.z += this.speed * delta;
                }
            });
        }
        if (this.chunk[0].position.z > this.player.mesh.body.position.z + 3/2 * this.chunk_length) {
            let old = this.chunk.shift();

            old.traverse(obj => {
                if (obj.body) this.world.removeBody(obj.body);
                if (obj.fbx) this.scene.remove(obj.fbx);
                this.scene.remove(obj);
            });

            this.scene.remove(old);
            this.generateChunk();

            this.number_chunks++;
        }
    }
}