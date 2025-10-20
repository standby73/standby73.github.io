import { EnvironmentFactory } from "./environment_factory.js";
import { GroundBuilder } from "./ground.js";

export class EnvironmentManager {
    constructor(scene, world, renderer, groundMaterial) {
        this.scene = scene;
        this.world = world;
        this.renderer = renderer;
        this.groundMaterial = groundMaterial;
        this.environments = [];
        this.groundBody = null;
        
        this.textureLoader = new THREE.TextureLoader();
        this.gltfLoader = new THREE.GLTFLoader();
        
        this.textures = {};
        this.models = {};

        this.environmentFactory = null;
        this.groundBuilder = null;
        
        this.initialize();
    }

    initialize() {
        this.scene.fog = new THREE.FogExp2(0xddddff, 0.0015);
        this.renderer.setClearColor(0x87CEEB);
        this.renderer.sortObjects = true;

        const groundShape = new CANNON.Plane();
        this.groundBody = new CANNON.Body({ mass: 0, material: this.groundMaterial });
        this.groundBody.addShape(groundShape);
        this.groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI/2);
        this.world.addBody(this.groundBody);

        this.loadTextures();
    }

    loadTextures() {
        this.textures.building1 = this.textureLoader.load('images/building1.jpg');
        this.textures.building2 = this.textureLoader.load('images/building2.jpg');
        this.textures.building3 = this.textureLoader.load('images/building3.jpg');
        
        Object.values(this.textures).forEach(texture => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
        });

        this.factory = new EnvironmentFactory(
            this.textureLoader, 
            this.gltfLoader, 
            this.textures, 
            this.models
        );
        this.groundBuilder = new GroundBuilder(this.textureLoader);
    }

    loadModels(callback) {
        let count = 0;
        let models = {
            tree: 'models/tree/scene.gltf',
            tree1:'models/tree1/scene.gltf'
        };
        
        let total = Object.keys(models).length;
        
        Object.entries(models).forEach(([name, path]) => {
            this.gltfLoader.load(
                path,
                (gltf) => {
                    this.models[name] = gltf.scene;
                    count++;
                    if (count === total && callback) {
                        callback();
                    }
                },
                undefined,
                (error) => {
                    console.warn(`No se pudo cargar el modelo ${name}: ${error}`);
                    count++;
                    if (count === total && callback) {
                        callback();
                    }
                }
            );
        });
        
        if (total === 0 && callback) callback();
    }

    init(count, width, length) {
        for (let i = 0; i < count; i++) {
            this.createEnvironment((-i * length) + length, width, length);
        }
    }

    createEnvironment(z, width, length) {
        let type = EnvironmentFactory.getRandomType();
        let environment_chunk = this.factory.createEnvironment(type, width, length);
        
        let group = new THREE.Group();
        group.position.z = z - length / 2;
        
        let ground = this.groundBuilder.build(width, length);
        group.add(ground);
        
        // Crear las decoraciones del entorno
        let decorations = environment_chunk.createDecorations();
        decorations.forEach(decoration => group.add(decoration));
        
        // Añadir a la escena
        this.scene.add(group);
        
        let environment = {
            type,
            z,
            length,
            width,
            group,
            ground,
            decorations
        };

        this.environments.push(environment);
        return environment;
    }

    update(delta, speed, playerZ) {
        this.environments.forEach(env => {
            env.group.position.z += speed * delta;
            
            if (env.ground && env.ground.userData.railMesh) {
                let railMesh = env.ground.userData.railMesh;
                if (railMesh.material && railMesh.material.map) {
                    railMesh.material.map.offset.y += speed * delta * 0.01;
                }
            }
        });

        if (this.environments.length > 0 && this.environments[0].group.position.z > playerZ + this.environments[0].length * 3/2) {    
            let old = this.environments.shift();
            this.removeEnvironment(old);
        }
    }

    removeEnvironment(env) {
        env.group.traverse(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (obj.material.map) obj.material.map.dispose();
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(mat => mat.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });
        
        this.scene.remove(env.group);
    }

    getLastEnvironmentZ() {
        if (this.environments.length === 0) return 0;
        return this.environments[this.environments.length - 1].group.position.z;
    }

    clear() {
        this.environments.forEach(env => this.removeEnvironment(env));
        this.environments = [];
        
        if (this.groundBody) {
            this.world.removeBody(this.groundBody);
            this.groundBody = null;
        }
    }
}