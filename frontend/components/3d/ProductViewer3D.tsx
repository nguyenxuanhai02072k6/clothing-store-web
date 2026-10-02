'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ProductViewer3DProps {
  modelType?: 'bag' | 'glasses' | 'dress' | 'default';
  colorHex?: string;
}

export default function ProductViewer3D({ modelType = 'dress', colorHex = '#D7C49E' }: ProductViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef(colorHex);

  // Sync colorHex ref
  useEffect(() => {
    colorRef.current = colorHex;
  }, [colorHex]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 2. Create Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Main material that updates color
    const customMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      side: THREE.DoubleSide
    });

    // Mannequin stand material (brushed gold)
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.25
    });

    // Mannequin body material (polished off-white)
    const torsoMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f3ef,
      roughness: 0.4
    });

    // 3. Build Procedural Geometry based on modelType
    if (modelType === 'dress') {
      // Abstract High-End Dress Mannequin
      // Stand base
      const baseGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.06, 32);
      const baseMesh = new THREE.Mesh(baseGeo, goldMaterial);
      baseMesh.position.y = -2.2;
      modelGroup.add(baseMesh);

      // Stand pole
      const poleGeo = new THREE.CylinderGeometry(0.025, 0.025, 2.5, 16);
      const poleMesh = new THREE.Mesh(poleGeo, goldMaterial);
      poleMesh.position.y = -1;
      modelGroup.add(poleMesh);

      // Torso body
      const torsoGeo = new THREE.CylinderGeometry(0.42, 0.32, 1.4, 32);
      const torsoMesh = new THREE.Mesh(torsoGeo, torsoMaterial);
      torsoMesh.position.y = 0.5;
      modelGroup.add(torsoMesh);

      const chestGeo = new THREE.SphereGeometry(0.42, 32, 16);
      const chestMesh = new THREE.Mesh(chestGeo, torsoMaterial);
      chestMesh.position.y = 1.2;
      chestMesh.scale.set(1, 0.75, 1.2);
      modelGroup.add(chestMesh);

      const neckGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.3, 16);
      const neckMesh = new THREE.Mesh(neckGeo, goldMaterial);
      neckMesh.position.y = 1.6;
      modelGroup.add(neckMesh);

      // Draped Silk Ribbon winding around the torso
      const drapeGeo = new THREE.TorusKnotGeometry(0.55, 0.08, 150, 16, 2, 3);
      const drapeMesh = new THREE.Mesh(drapeGeo, customMaterial);
      drapeMesh.position.y = 0.65;
      drapeMesh.rotation.x = Math.PI / 4;
      modelGroup.add(drapeMesh);

    } else {
      // Default: Elegant Rotating Sculptural Orb/Ribbon Geometry
      const coreGeo = new THREE.SphereGeometry(0.8, 32, 32);
      const coreMesh = new THREE.Mesh(coreGeo, torsoMaterial);
      modelGroup.add(coreMesh);

      const ringGeo = new THREE.TorusGeometry(1.3, 0.06, 16, 100);
      const ringMesh1 = new THREE.Mesh(ringGeo, customMaterial);
      ringMesh1.rotation.x = Math.PI / 3;
      modelGroup.add(ringMesh1);

      const ringMesh2 = new THREE.Mesh(ringGeo, goldMaterial);
      ringMesh2.rotation.y = Math.PI / 3;
      modelGroup.add(ringMesh2);
    }

    // 4. Add Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff8ee, 1.5);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xdbeafe, 0.7);
    dirLight2.position.set(-5, -3, 2);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.2, 10);
    pointLight.position.set(0, 2, 4);
    scene.add(pointLight);

    // 5. Lightweight Drag-to-Rotate Interaction Handlers
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleStart = (clientX: number, clientY: number) => {
      isDragging = true;
      previousMousePosition = { x: clientX, y: clientY };
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;

      const deltaX = clientX - previousMousePosition.x;
      const deltaY = clientY - previousMousePosition.y;

      // Update model rotations smoothly
      modelGroup.rotation.y += deltaX * 0.008;
      modelGroup.rotation.x += deltaY * 0.008;

      // Limit vertical rotation to avoid flipping upside down
      modelGroup.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, modelGroup.rotation.x));

      previousMousePosition = { x: clientX, y: clientY };
    };

    const handleEnd = () => {
      isDragging = false;
    };

    // Mouse listeners
    const onMouseDown = (e: MouseEvent) => handleStart(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleEnd();

    // Touch listeners
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => handleEnd();

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    canvas.addEventListener('touchstart', onTouchStart);
    canvas.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    // 6. Resize handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 7. Render Loop
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Animate color change in real time smoothly
      const targetColor = new THREE.Color(colorRef.current);
      customMaterial.color.lerp(targetColor, 0.1);

      // Auto-rotation when not dragging
      if (!isDragging) {
        modelGroup.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full cursor-grab active:cursor-grabbing select-none"
    />
  );
}
