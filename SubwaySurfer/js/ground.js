export class GroundBuilder {
    constructor(textureLoader) {
        this.textureLoader = textureLoader;
        this.baseWidth = 8;
        this.sidewalkWidth = 2;
        this.barrierHeight = 0.8;
        this.barrierThickness = 0.1;

        this.railTexture = this.textureLoader.load("images/rail.jpg");
        this.grassTexture = this.textureLoader.load("images/grass.jpg");
        this.groundTexture = this.textureLoader.load("images/ground.jpg");
    }

    build(width, length) {
        let group = new THREE.Group();

        this.addBaseGround(group, width, length);

        let railMesh = this.addRails(group, width, length);
        group.userData.railMesh = railMesh;
        
        this.addSidewalks(group, width, length);
        
        this.addBarriers(group, width);

        this.addEnvironmentGround(group, 500)

        return group;
    }

    addEnvironmentGround(group, size) {
        let geometry = new THREE.PlaneGeometry(size, size);
        let material;

        if (this.grassTexture) {
            this.grassTexture.wrapS = THREE.RepeatWrapping;
            this.grassTexture.wrapT = THREE.RepeatWrapping;
            this.grassTexture.repeat.set(size/2, size/2);

            material = new THREE.MeshPhongMaterial({
                map: this.grassTexture,
                side: THREE.DoubleSide
            });
        } else {
            material = new THREE.MeshPhongMaterial({
                color: 0x228B22,
                side: THREE.DoubleSide
            });
        }

        let mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = -0.01;
        mesh.receiveShadow = true;

        group.add(mesh);
    }


    addBaseGround(group, width, length) {
        let baseWidth = width + this.baseWidth;
        let geometry = new THREE.PlaneGeometry(baseWidth, length);
        let texture = this.groundTexture.clone();

        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.needsUpdate = true;
        texture.repeat.set(1, length / 3);

        let material = new THREE.MeshPhongMaterial({ map: texture });
        let mesh = new THREE.Mesh(geometry, material);

        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = 0;
        mesh.receiveShadow = true;
        
        group.add(mesh);
    }

    addRails(group, width, length) {
        let geometry = new THREE.PlaneGeometry(width, length);
        let texture = this.railTexture.clone();

        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;        
        texture.needsUpdate = true;
        texture.repeat.set(3, length / 3);

        let material = new THREE.MeshPhongMaterial({ map: texture });
        let mesh = new THREE.Mesh(geometry, material);
        
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.y = 0.02;
        mesh.receiveShadow = true;
        
        group.add(mesh);
        return mesh;
    }

    addSidewalks(group, width, length) {
        let geometry = new THREE.PlaneGeometry(this.sidewalkWidth, length);
        let texture = this.groundTexture.clone();

        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;        
        texture.needsUpdate = true;
        texture.repeat.set(1, length / 3);

        let material = new THREE.MeshPhongMaterial({ map: texture });

        for(let x of [1,-1]){
            let acera = new THREE.Mesh(geometry, material);
            acera.rotation.x = -Math.PI / 2;
            acera.position.set(
                x*(width / 2 + this.sidewalkWidth / 2), 
                0.03, 
                0
            );
            acera.receiveShadow = true;
            group.add(acera);
        }
    }

    addBarriers(group, width) {
        let geometry = new THREE.BoxGeometry(
            this.barrierThickness, 
            this.barrierHeight, 
            group.children[0].geometry.parameters.height
        );
        let material = new THREE.MeshPhongMaterial({ color: 0xFFCC00 });

        for(let x of [1,-1]){
            let barrier = new THREE.Mesh(geometry, material);
            barrier.position.set(
            x*(width / 2 + this.sidewalkWidth - 0.2), 
            this.barrierHeight / 2, 
            0
            );
            barrier.castShadow=true;
            group.add(barrier);
        }
    }
}