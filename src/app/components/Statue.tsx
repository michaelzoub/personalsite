'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { AsciiEffect } from 'three/examples/jsm/effects/AsciiEffect';
import { useAtom } from 'jotai';
import { darkMode } from '../atoms/darkMode';

export default function AsciiSTLViewer() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const effectRef = useRef<AsciiEffect | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

    const [dark] = useAtom(darkMode);

  useEffect(() => {
    if (!containerRef.current) return;

    const sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      sizes.width / sizes.height,
      0.1,
      2000
    );

    // Renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(sizes.width, sizes.height);

    // ASCII Effect
    const characters = ' .:-+*=%@#';
    const effect = new AsciiEffect(renderer, characters, { 
      invert: true, 
      resolution: 0.25 
    });
    effect.setSize(sizes.width, sizes.height);
    effect.domElement.style.color = dark ? '#414146ff' : '#e9e9e9ff';
    effect.domElement.style.backgroundColor = 'transparent';

    rendererRef.current = renderer;
    effectRef.current = effect;
    
    containerRef.current.appendChild(effect.domElement);
    effect.domElement.style.width = '100%';
    effect.domElement.style.position = 'absolute';
    effect.domElement.style.top = '0';
    effect.domElement.style.left = '0';
    margin: '0';
    padding: '0';

    // Lights
    const pointLight1 = new THREE.PointLight(0xffffff, 1, 0, 0);
    pointLight1.position.set(100, 100, 400);
    scene.add(pointLight1);

    // Material
    const material = new THREE.MeshStandardMaterial({
      flatShading: true,
      side: THREE.DoubleSide
    });

    // Mesh container
    const myMesh = new THREE.Mesh();
    myMesh.material = material;

    myMesh.position.set(0, 0, 0);

    

    // STL Loader
    const stlLoader = new STLLoader();

    // Load STL from public folder
    stlLoader.load(
      '/model.stl', // Place your model.stl in the public folder
      (geometry) => {
        handleGeometryLoaded(geometry);
      },
      undefined,
      (error) => {
        console.error('Error loading STL:', error);
        setError('Failed to load STL file. Make sure model.stl is in the public folder.');
        setIsLoading(false);
      }
    );

    function handleGeometryLoaded(geometry: THREE.BufferGeometry) {
      myMesh.geometry = geometry;
      geometry.computeVertexNormals();
      geometry.center();
      geometry.computeBoundingBox();

      const bbox = geometry.boundingBox!;
      myMesh.position.y = (bbox.max.z - bbox.min.z) / 5;

      // Position camera based on model size
      const size = new THREE.Vector3();
      bbox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);

        const fov = camera.fov * (Math.PI / 180);
        const cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;

        // Rotate camera 90 degrees (phi = π/2) around Y axis
        const phi = Math.PI / 2; // 90 degrees
        const radius = cameraZ;

        camera.position.set(
        Math.sin(phi) * radius,  // X
        0,                       // Y
        Math.cos(phi) * radius   // Z
        );
        camera.lookAt(0, 0, 0);

      scene.add(myMesh);
      setIsLoading(false);
      animate();
    }

    let animationId: number;

    function animate() {
      animationId = requestAnimationFrame(animate);
      
      // Rotate model
      
      myMesh.rotation.z += 0.005;
      
      effect.render(scene, camera);
    }

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      effect.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && effect.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(effect.domElement);
      }
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    effectRef.current.domElement.style.color = dark ? '#414146ff' : '#e9e9e9ff';
  }, [dark]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 overflow-hidden z-[0]"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-white font-mono z-10 pointer-events-none">
          <div className="text-center">
            <div className="text-2xl mb-4">Loading STL...</div>
            <div className="text-sm">Place model.stl in the public folder</div>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-red-500 font-mono z-10">
          <div className="text-center">
            <div className="text-xl mb-4">{error}</div>
            <div className="text-sm">Check console for details</div>
          </div>
        </div>
      )}
    </div>
  );
}