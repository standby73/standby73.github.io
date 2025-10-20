export class Player{
    constructor(width, height, depth, scene, world, material){
        this.width = width;
        this.height = height;
        this.depth = depth;

        this.x = 0;
        this.z = 0;

        this.scene = scene;
        this.world = world;
        this.material = material;

        this.mesh = null;
        this.currentLane = 1;
        this.isChangingLane = false;
        this.lanePositions = [-2,0,2];
        this.velocity = 15;
    }

    init(){
        // Jugador - Visual
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(this.width, this.height, this.depth),
            new THREE.MeshPhongMaterial({ color: 0x0000ff, opacity: 0, transparent: true })
        );
        this.mesh.position.set(this.x, this.height/2, this.z);
        
        this.scene.add(this.mesh);
    
        // Jugador - Física
        let halfExtents = new CANNON.Vec3(this.width/2, this.height/2, this.depth/2);
        let playerShape = new CANNON.Box(halfExtents);
        let playerBody = new CANNON.Body({
            mass: 1,  
            material: this.material,
            fixedRotation: true
        });
        playerBody.addShape(playerShape);
        playerBody.position.copy(this.mesh.position);
        
        this.world.addBody(playerBody);
    
        // Relación física-visual
        this.mesh.body = playerBody;

        
    }

    setModel(fbx) {
        this.mesh.fbx = fbx;
        this.scene.add(this.mesh.fbx);

        fbx.position.set(this.mesh.position.x,this.mesh.position.y-3*this.height/5,this.mesh.position.z);

        let box = new THREE.Box3().setFromObject(fbx);
        let size = new THREE.Vector3();
        box.getSize(size);
        let scale = this.height / size.y;
        fbx.scale.set(scale, scale, -scale);
           
        fbx.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.transparent = false;
                child.material.opacity = 1.0;
                
            }
        });
    }

    update(){
        if (this.mesh && this.mesh.body) {
            this.mesh.position.copy(this.mesh.body.position);
            this.mesh.quaternion.copy(this.mesh.body.quaternion);
        }

        if (this.mesh && this.mesh.body) {
            let targetX = this.lanePositions[this.currentLane];
            let currentX = this.mesh.body.position.x;
            if (Math.abs(currentX - targetX) > 0.05) {
                this.isChangingLane = true;
                // Movimiento suave hacia el carril objetivo
                let direction = targetX > currentX ? 1 : -1;
                this.mesh.body.velocity.x = direction*this.velocity;
            } else {
                this.isChangingLane = false;
                this.mesh.body.velocity.x = 0;
                this.mesh.body.position.x = targetX; // Ajuste final para precisión
            }
        }
        
        if (this.mesh.fbx){
            this.mesh.fbx.position.set(
                this.mesh.body.position.x, 
                this.mesh.body.position.y - 3*this.height/5, 
                this.mesh.body.position.z
            );
            this.mesh.fbx.quaternion.copy(this.mesh.body.quaternion);
        }
    }

    isGround(){
        return Math.abs(this.mesh.body.velocity.y) < 0.1 && (this.mesh.body.position.y -this.height/2)<= this.height/4;
    }

    setBoxSize(width, height, depth) {
        let currentPos = this.mesh.body.position.clone();
        
        this.mesh.body.shapes = [];
        this.mesh.body.addShape(new CANNON.Box(new CANNON.Vec3(width/2, height/2, depth/2)));

        this.mesh.body.updateBoundingRadius();
        this.mesh.body.aabbNeedsUpdate = true;
        
        this.mesh.body.position.copy(currentPos);
        this.mesh.body.velocity.y -=8;
        this.mesh.body.position.y = this.height/2 + 0.05;    

        if (this.mesh.geometry) {
            this.mesh.geometry.dispose();
            this.mesh.geometry = new THREE.BoxGeometry(width, height, depth);
        }
    }

    roll() {
        this.setBoxSize(this.width, this.height/2, this.depth);
    }

    standUp() {
        this.setBoxSize(this.width, this.height, this.depth);
    }

    moveLeft() {
        if (this.currentLane > 0 && !this.isChangingLane) {
            this.currentLane--;
        }
    }
    
    moveRight() {
        if (this.currentLane < 2 && !this.isChangingLane) {
            this.currentLane++;
        }
    }
}