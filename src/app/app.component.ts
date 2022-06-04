import {AfterViewInit, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import * as THREE from 'three'
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import gsap from 'gsap';
import GUI from 'lil-gui';

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

  parameters = {
    spin: () => {
      gsap.to(this.mesh.rotation,{duration:1,x:this.mesh.rotation.x + Math.PI *2})
    }
  }

  gui: GUI;
  scene : THREE.Scene;
  mesh: THREE.Mesh;
  camera : THREE.PerspectiveCamera;
  renderer! : THREE.WebGLRenderer;

  constructor() {
    // debug
    this.gui = new GUI();
    this.gui.close();

    // Scene
    this.scene = new THREE.Scene();

    // Object
    this.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1, 5, 5, 5),
      new THREE.MeshBasicMaterial({color: 0xff0000})
    )
    this.gui.add(this.mesh.position,'y')
      .min(-3)
      .max(3)
      .step(0.01)
      .name('elevation');
    this.gui.add(this.mesh,'visible');
    this.gui.add(this.mesh.material,'wireframe');
    this.gui.addColor(this.mesh.material,'color');
    this.gui.add(this.parameters,'spin');

    this.scene.add(this.mesh);

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height,0.1,100);
    this.camera.position.z = 3;
    this.scene.add(this.camera);
  }


  ngAfterViewInit(): void {
    const clock = new THREE.Clock()

    const controls  = new OrbitControls(this.camera, this.canvasRef.nativeElement);
    controls.target = this.mesh.position;
    controls.enableDamping = true;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);


    const tick = () => {

      // update controls
      controls.update();

      // Render
      this.renderer.render(this.scene, this.camera)

      // Call tick again on the next frame
      window.requestAnimationFrame(tick)
    }

    tick()
  }
}
