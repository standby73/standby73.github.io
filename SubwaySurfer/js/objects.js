class GameObject{
    constructor(x, z, loader, material){
        this.x = x;
        this.z = z;
        this.height = 0;
        this.loader = loader;
        this.material = material;
    }

    createMesh(){
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(1, this.height, 1),
            new THREE.MeshNormalMaterial()
        );
        this.mesh.position.set(this.x, this.height/2, this.z);
    }
    createMeshFBX(callback){
        this.loader.load(this.model, (object) => {
            this.mesh.fbx = object.scene;
            if(callback) callback();
        }, undefined, (error) => {
            console.error(error);
        });
    }
    createFBX(group){
        this.createMeshFBX(() => {
            let box = new THREE.Box3().setFromObject(this.mesh.fbx);
            let actualSize = new THREE.Vector3();
            box.getSize(actualSize);
            
            let collisionBox = new THREE.Box3().setFromObject(this.mesh);
            let desiredSize = new THREE.Vector3();
            collisionBox.getSize(desiredSize);
            
            let scaleX = desiredSize.x / actualSize.x;
            let scaleY = desiredSize.y / actualSize.y;
            let scaleZ = desiredSize.z / actualSize.z;

            this.mesh.fbx.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            let scale = this.getScale();

            this.mesh.fbx.scale.set(scaleX*scale.x, scaleY*scale.y, scaleZ*scale.z);
            
            let position = this.getPosition();
            this.mesh.fbx.position.set(
                this.mesh.position.x+position.x,this.mesh.position.y+position.y,this.mesh.position.z + position.z
            );
            if(group) group.add(this.mesh.fbx);
        });
    }
    getScale(){
        return new THREE.Vector3(1, 1, -1);
    }
    getPosition(){
        return new THREE.Vector3(0, -this.height/2, 0);
    }

    init(){
        this.createMesh();

        let box = new THREE.Box3().setFromObject(this.mesh);
        let size = new THREE.Vector3();
        box.getSize(size);

        let shape = new CANNON.Box(new CANNON.Vec3(size.x/2,size.y/2,size.z/2));
        let body = new CANNON.Body({ mass: 0, material: this.material});
        body.addShape(shape);
        body.position.copy(this.mesh.position);
        body.obstacle = true;

        this.mesh.body = body;
    }
}


export class Train extends GameObject{
    constructor(x, z, loader,material){
        super(x,z,loader,material);
        this.length = 10;
        this.height = 2;

        this.code = 1;
        
        this.model = "models/train/scene.gltf"
    }
    createMesh(){
        this.mesh =  new THREE.Mesh(new THREE.BoxGeometry(1.5, this.height, this.length),  
                new THREE.MeshPhongMaterial({ color: 0x0000ff, opacity: 0, transparent: true }));
        this.mesh.position.set(this.x, this.height/2, this.z);
    }
}

export class JumpObstacle extends GameObject{
    constructor(x, z, loader,material){
        super(x,z,loader,material);
        this.length = 0.3;
        this.height = 1;

        this.code = 2;
        
        this.model = "models/fence/scene.gltf"
    }
    createMesh(){
        this.mesh =  new THREE.Mesh(new THREE.BoxGeometry(1.5, this.height, this.length),  
                new THREE.MeshPhongMaterial({ color: 0x0000ff, opacity: 0, transparent: true }));
        this.mesh.position.set(this.x, this.height/2, this.z);
    }
}

export class RollObstacle extends GameObject{
    constructor(x, z, loader,material){
        super(x, z, loader,material);
        this.length = 0.3;
        this.height = 1;

        this.code = 2;

        this.model = "models/subway/barrier.fbx"
        this.isFBX = 1;
    }
    createMesh(){
        this.mesh =  new THREE.Mesh(new THREE.BoxGeometry(1.5, this.height, this.length),  
                new THREE.MeshPhongMaterial({ color: 0x0000ff, opacity: 0, transparent: true }));
        this.mesh.position.set(this.x, 3/2*this.height, this.z);
    }

    createMeshFBX(callback){
        this.loader.load(this.model, (object) => {
            this.mesh.fbx = object;
            if(callback) callback();
        }, undefined, (error) => {
            console.error(error);
        });
    }

    getScale(){
        return new THREE.Vector3(1, 2, -1);
    }
    getPosition(){
        return new THREE.Vector3(0, -3/2*this.height, 0);
    }
}