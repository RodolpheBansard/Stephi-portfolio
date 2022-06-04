import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import gsap from 'gsap';
import GUI from 'lil-gui';
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {Mesh, Object3D} from "three";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit{
  @ViewChild('webgl')
  private canvasRef!: ElementRef;

  @HostListener('window:resize')
  onResize() {
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    //update camera
    this.camera.aspect = this.sizes.width/this.sizes.height;
    this.camera.updateProjectionMatrix();

    //update renderer
    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  }

  // Sizes
  sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  lilGuiAction = {
    animateCamera: () => {
      gsap.to(this.camera.position,{duration:1,x:1,z:0,y:2})

    },
    animateFrame:() => {
      gsap.to(this.frame.scale,{duration:0.3,x:0,z:0,y:0})
    }
  }

  // parameters = {
  //   spin: () => {
  //     gsap.to(this.mesh.rotation,{duration:1,x:this.mesh.rotation.x + Math.PI *2})
  //   }
  // }

  gui: GUI;
  scene : THREE.Scene;
  camera : THREE.PerspectiveCamera;
  renderer! : THREE.WebGLRenderer;
  frame!: Object3D;

  constructor() {

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('assets/images/lutin.jpg',
      (test) => {
        console.log(test.image.width)
        console.log(test.image.height)
      });
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('assets/draco/')
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.load('assets/portfolio.glb', (gltf) => {
      gltf.scene.traverse((child)=> {
        if(child.name.includes('drawing')){
          // @ts-ignore
          child.material = new THREE.MeshBasicMaterial({
            map:texture
          })
          child.rotation.set(-Math.PI/2,0,0);
        }
        if(child.name.includes('frame')){
          child.scale.z = 709/1535;
          this.frame = child;
        }
      })
      this.scene.add(gltf.scene);
    })


    // debug
    this.gui = new GUI();

    this.gui.add(this.lilGuiAction,"animateCamera");
    this.gui.add(this.lilGuiAction,"animateFrame");

    // Scene
    this.scene = new THREE.Scene();

    const directionalLight = new THREE.DirectionalLight(0xffffff,2);
    directionalLight.position.set(1,1,1);
    this.scene.add(directionalLight)


    // Camera
    this.camera = new THREE.PerspectiveCamera(50, this.sizes.width / this.sizes.height,0.1,100);
    this.camera.position.set(7,4,7);
    this.camera.lookAt(0,0,0);
    this.scene.add(this.camera);
  }


  ngAfterViewInit(): void {
    const clock = new THREE.Clock()

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      antialias:true
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);


    const tick = () => {

      this.camera.lookAt(-1,2,0)
      // Render
      this.renderer.render(this.scene, this.camera)

      // Call tick again on the next frame
      window.requestAnimationFrame(tick)
    }

    tick()
  }
}
