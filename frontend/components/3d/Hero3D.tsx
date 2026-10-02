'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup Scene, Camera, Renderer
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // 2. Add Waving Silk Mesh
    // Using a large plane with high vertex count for smooth waves
    const geometry = new THREE.PlaneGeometry(16, 12, 64, 48);
    
    // Luxurious Silk Ribbon material settings
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xf5f3f0, // Soft warm white / cream
      roughness: 0.18,
      metalness: 0.05,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
      transmission: 0.25, // Light transmission
      thickness: 0.8,
      side: THREE.DoubleSide,
      flatShading: false,
    });

    const fabricMesh = new THREE.Mesh(geometry, material);
    fabricMesh.rotation.x = -Math.PI / 6; // Angle it slightly
    fabricMesh.rotation.y = -Math.PI / 12;
    scene.add(fabricMesh);

    // 3. Add Premium Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Key Light
    const dirLight = new THREE.DirectionalLight(0xfffaee, 1.5);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    // Dynamic mouse-following Point Light
    const pointLight = new THREE.PointLight(0xffdfcb, 2.5, 25);
    pointLight.position.set(0, 0, 4);
    scene.add(pointLight);

    // Soft rim light
    const rimLight = new THREE.DirectionalLight(0xdbeafe, 0.8);
    rimLight.position.set(-6, -6, -2);
    scene.add(rimLight);

    // 4. Mouse Move Event Listener
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse coordinates from -1 to 1
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 5. Window Resize Event Listener
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 6. Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      // Dynamic Procedural Wave Calculations (Sine & Cosine waves)
      const posAttr = geometry.attributes.position;
      if (posAttr) {
        for (let i = 0; i < posAttr.count; i++) {
          const x = posAttr.getX(i);
          const y = posAttr.getY(i);
          
          // Form mathematical curves representing zero-gravity floating fabric waves
          const wave1 = Math.sin(x * 0.4 + time * 0.9) * 0.35;
          const wave2 = Math.cos(y * 0.3 - time * 0.7) * 0.25;
          const wave3 = Math.sin((x + y) * 0.25 + time * 1.1) * 0.15;
          
          posAttr.setZ(i, wave1 + wave2 + wave3);
        }
        posAttr.needsUpdate = true;
        geometry.computeVertexNormals();
      }

      // Smooth mouse-following light movement (lerp)
      const targetLightX = mouseRef.current.x * 6;
      const targetLightY = mouseRef.current.y * 4;
      pointLight.position.x += (targetLightX - pointLight.position.x) * 0.08;
      pointLight.position.y += (targetLightY - pointLight.position.y) * 0.08;

      // Soft rotating drift for the whole ribbon mesh
      fabricMesh.rotation.z = Math.sin(time * 0.15) * 0.05;
      fabricMesh.rotation.y = -Math.PI / 12 + Math.cos(time * 0.1) * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 opacity-80"
    />
  );
}
