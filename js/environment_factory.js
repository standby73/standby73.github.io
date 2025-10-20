export class EnvironmentFactory {
    constructor(textureLoader, gltfLoader, textures, models) {
        this.textureLoader = textureLoader;
        this.gltfLoader = gltfLoader;
        this.textures = textures;
        this.models = models;
    }

    createEnvironment(type, width, length) {
        switch(type) {
            case 'park':
                return new ParkEnvironment(width, length, this.models);
            case 'city':
                return new CityEnvironment(width, length, this.textures);
            default:
                return new ParkEnvironment(width, length, this.models);
        }
    }

    static getRandomType() {
        const types = ['park', 'city'];
        return types[Math.floor(Math.random() * types.length)];
    }
}

class BaseEnvironment {
    constructor(width, length) {
        this.width = width;
        this.length = length;
        this.decorations = [];
    }

    createDecorations() {
        return [];
    }
}

class ParkEnvironment extends BaseEnvironment {
    constructor(width, length, models) {
        super(width, length);
        this.models = models;
        this.treeSpacing = 20;
        this.grassWidth = 20;
        this.minHeight = 5;
        this.maxHeight = 5;
        this.minWidth = 3;
        this.maxWidth = 2;
    }

    createDecorations() {
        let decorations = [];
        let trees = Math.floor(this.length / this.treeSpacing);

        for (let side of [-1, 1]) {
            for (let i = 0; i < trees; i++) {
                let height = this.minHeight + Math.random() * this.maxHeight;
                let build_wd = this.minWidth + Math.random() * this.maxWidth;
                let tree = this.createTree(height, build_wd);
                
                let offset = Math.random() * (this.grassWidth - 1);
                let x = side * (this.width / 2 + 4 + offset);
                let z = -this.length / 2 + (i + Math.random()) * (this.length / trees);
                
                tree.position.set(x, 0, z);
                decorations.push(tree);
            }
        }

        return decorations;
    }

    createTree(height, wd) {
        if (this.models) {
        let keys = Object.keys(this.models);
        let type = keys[Math.floor(Math.random() * keys.length)];
        let tree = this.models[type].clone();

        let box = new THREE.Box3().setFromObject(tree);
        let actualSize = new THREE.Vector3();
        box.getSize(actualSize);

        let desiredSize = new THREE.Vector3(wd, height,wd);
        let scaleX = desiredSize.x / actualSize.x;
        let scaleY = desiredSize.y / actualSize.y;
        let scaleZ = desiredSize.z / actualSize.z;

        tree.scale.set(scaleX, scaleY, scaleZ);

        tree.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        return tree;
    }

    let geometry = new THREE.BoxGeometry(wd, height,wd);
    let material = new THREE.MeshPhongMaterial({ 
        color: 0x228B22
    });
    let tree = new THREE.Mesh(geometry, material);
    tree.position.y = 1.5;
    tree.castShadow = true;
    tree.receiveShadow = true;
    
    return tree;
    }
}

class CityEnvironment extends BaseEnvironment {
    constructor(width, length, textures) {
        super(width, length);
        this.textures = textures;
        this.buildingSpacing = 20;
        this.minHeight = 8;
        this.maxHeight = 5;
        this.minWidth = 8;
        this.maxWidth = 5;
    }

    createDecorations() {
        let decorations = [];
        let count = Math.floor(this.length / this.buildingSpacing);

        for (let i = 0; i < count; i++) {
            let height = this.minHeight + Math.random() * this.maxHeight;
            let build_width = this.minWidth + Math.random() * this.maxWidth;
            let build_depth = 8 + Math.random() * 8;
            
            let geometry = new THREE.BoxGeometry(build_width, height, build_depth);
            let material = this.getBuildingMaterial(i);
            
            let building = new THREE.Mesh(geometry, material);
            building.castShadow = true;
            building.receiveShadow = true;

            let side = i % 2 === 0 ? -1 : 1;
            let x = side * (this.width / 2 + 5 + build_width / 2);
            let z = -this.length / 2 + i * this.buildingSpacing + this.buildingSpacing / 2;
                
            building.position.set(x, height / 2, z);
            
            decorations.push(building);
        }

        return decorations;
    }

    getBuildingMaterial(index) {
        const textureKeys = ['building1', 'building2','building3'];
        const textureKey = textureKeys[index % textureKeys.length];
        if (this.textures && this.textures[textureKey]) {
            return new THREE.MeshPhongMaterial({ 
                map: this.textures[textureKey],
                shininess: 10
            });
        }
        return new THREE.MeshPhongMaterial({ 
            color: new THREE.Color().setHSL(0, 0, 0.2 + Math.random() * 0.3),
            shininess: 30
        });
    }

    calculateBuildingX(side, buildingWidth) {
        return side * (this.width / 2 + 2 + buildingWidth / 2);
    }

    calculateBuildingZ(index, totalCount) {
        return -this.length / 2 + (index + 0.5) * (this.length / totalCount);
    }
}

