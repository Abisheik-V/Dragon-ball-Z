import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function ModelViewer({
  modelPath,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  auraColor = '#ffd700',
  auraIntensity = 1.0,
  isAutoRotate = false,
  poweringUp = false,
  lightingPreset = 'aura', // 'aura' | 'studio' | 'neon' | 'sunset'
  activeAnimationIndex = 0,
  onLoadProgress = () => {},
  onLoadComplete = () => {},
  onLoadError = () => {},
  onAnimationsFound = () => {}
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const mixerRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());

  // Dynamic light references
  const auraLightRef = useRef(null);
  const ambientLightRef = useRef(null);
  const dirLightRef = useRef(null);
  const rimLightRef = useRef(null);
  
  // Track loaded state locally to trigger animation changes
  const [animations, setAnimations] = useState([]);
  const [activeAction, setActiveAction] = useState(null);

  // Setup Scene, Camera, Renderer, Controls
  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Create Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    // Set background to transparent or dark charcoal to let CSS aura gradients show behind
    scene.background = null; 

    // 2. Create Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, -0.3, 4.0);
    cameraRef.current = camera;

    // 3. Create WebGLRenderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    // Clear container and append canvas
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Create OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 10;
    controls.minDistance = 2;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't orbit completely under the floor
    controls.target.set(0, -0.3, 0); // Focus controls exactly at the character center
    controlsRef.current = controls;

    // 5. Add Lights
    // Ambient
    const ambientLight = new THREE.AmbientLight('#12121e', 0.6);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // Hemisphere light for soft natural sky-ground gradient filling
    const hemiLight = new THREE.HemisphereLight('#ffffff', '#151525', 1.2);
    scene.add(hemiLight);

    // Key directional light (simulates sun/studio)
    const dirLight = new THREE.DirectionalLight('#ffffff', 1.5);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Aura Point Light (placed below model, casting light upwards)
    const auraLight = new THREE.PointLight(auraColor, 3, 8);
    auraLight.position.set(0, -1.9, 0);
    scene.add(auraLight);
    auraLightRef.current = auraLight;

    // Rim light (coming from back to highlight character silhouette)
    const rimLight = new THREE.DirectionalLight('#ffffff', 1.0);
    rimLight.position.set(-5, 3, -5);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // Add floor grid / circle platform for staging
    const gridColor = new THREE.Color(auraColor).multiplyScalar(0.5);
    const gridHelper = new THREE.GridHelper(10, 20, gridColor.getHex(), '#222233');
    gridHelper.position.y = -1.81;
    scene.add(gridHelper);

    // Dynamic ground ring
    const ringGeo = new THREE.RingGeometry(1.2, 1.3, 32);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: auraColor, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -1.8;
    scene.add(ringMesh);

    // Save grid references to dispose/update
    const floorHelpers = [gridHelper, ringMesh];

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      floorHelpers.forEach(item => scene.remove(item));
      scene.remove(ambientLight);
      scene.remove(hemiLight);
      scene.remove(dirLight);
      scene.remove(auraLight);
      scene.remove(rimLight);
      ringGeo.dispose();
      ringMat.dispose();
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
    };
  }, []);

  // Update light colors and intensities dynamically when form/auraColor changes
  useEffect(() => {
    if (!sceneRef.current) return;
    
    // Update active grid/ring colors
    sceneRef.current.traverse((child) => {
      if (child instanceof THREE.GridHelper) {
        // Redraw grid helper with new color
        sceneRef.current.remove(child);
        const gridColor = new THREE.Color(auraColor).multiplyScalar(0.4);
        const newGrid = new THREE.GridHelper(10, 20, gridColor.getHex(), '#151522');
        newGrid.position.y = -1.81;
        sceneRef.current.add(newGrid);
      }
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.RingGeometry) {
        child.material.color.set(auraColor);
      }
    });

    if (auraLightRef.current) {
      auraLightRef.current.color.set(auraColor);
      auraLightRef.current.intensity = auraIntensity * 3;
    }

    // Apply presets
    if (ambientLightRef.current && dirLightRef.current && rimLightRef.current && auraLightRef.current) {
      const activeColor = new THREE.Color(auraColor);
      
      switch (lightingPreset) {
        case 'studio':
          ambientLightRef.current.intensity = 1.0;
          ambientLightRef.current.color.set('#ffffff');
          dirLightRef.current.intensity = 2.0;
          dirLightRef.current.color.set('#ffffff');
          rimLightRef.current.intensity = 0.5;
          rimLightRef.current.color.set('#ffffff');
          auraLightRef.current.intensity = 0.2;
          break;
        case 'neon':
          ambientLightRef.current.intensity = 0.4;
          ambientLightRef.current.color.set('#0b001a');
          dirLightRef.current.intensity = 1.2;
          dirLightRef.current.color.set('#00ffff'); // Cyan key
          rimLightRef.current.intensity = 2.0;
          rimLightRef.current.color.set('#ff00ff'); // Magenta rim
          auraLightRef.current.intensity = auraIntensity * 1.5;
          break;
        case 'sunset':
          ambientLightRef.current.intensity = 0.6;
          ambientLightRef.current.color.set('#3a1a1a');
          dirLightRef.current.intensity = 1.8;
          dirLightRef.current.color.set('#ff5500'); // Orange sun
          rimLightRef.current.intensity = 1.5;
          rimLightRef.current.color.set('#ffcc00'); // Yellow rim
          auraLightRef.current.intensity = auraIntensity * 2;
          break;
        case 'aura':
        default:
          // Synced to the character's aura colors
          ambientLightRef.current.intensity = 0.7;
          ambientLightRef.current.color.set('#10101e');
          dirLightRef.current.intensity = 1.8;
          dirLightRef.current.color.set('#ffffff');
          
          // Tint rim light slightly with aura color
          rimLightRef.current.intensity = 1.2;
          const rimColor = activeColor.clone().addScalar(0.3);
          rimLightRef.current.color.set(rimColor);
          
          auraLightRef.current.intensity = auraIntensity * (poweringUp ? 7 : 3.5);
          break;
      }
    }
  }, [auraColor, auraIntensity, lightingPreset, poweringUp]);

  // Load GLB Model
  useEffect(() => {
    if (!sceneRef.current || !modelPath) return;

    let isCurrent = true;
    onLoadProgress(0);

    // Remove previous model if exists
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
      // Traverse and dispose geometries/materials
      modelRef.current.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      modelRef.current = null;
      mixerRef.current = null;
      setAnimations([]);
    }

    const loader = new GLTFLoader();

    loader.load(
      modelPath,
      (gltf) => {
        if (!isCurrent) {
          // Dispose of gltf resources if we cancelled this load before it finished
          gltf.scene.traverse((child) => {
            if (child.isMesh) {
              child.geometry.dispose();
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
          return;
        }

        const loadedModel = gltf.scene;
        modelRef.current = loadedModel;

        // 1. Reset scale, position, and rotation to calculate native bounding box
        loadedModel.scale.set(1, 1, 1);
        loadedModel.position.set(0, 0, 0);
        loadedModel.rotation.set(0, 0, 0);
        loadedModel.updateMatrixWorld(true);

        // 2. Compute bounding box
        const box = new THREE.Box3().setFromObject(loadedModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // 3. Determine auto-scale factor (normalize height/max dimension to 3.0 units)
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetHeight = 3.0;
        let scaleFactor = targetHeight / (maxDim || 1);
        
        // Scale prop is a relative multiplier (e.g., 1.0 means default fit, 1.1 means 10% larger)
        if (scale) {
          scaleFactor *= scale;
        }
        loadedModel.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Update matrix world after scaling to calculate scaled boundaries
        loadedModel.updateMatrixWorld(true);
        box.setFromObject(loadedModel);
        box.getCenter(center);

        // 4. Center X and Z, and place the bottom of the bounding box exactly on the floor (y = -1.8)
        const floorY = -1.8;
        loadedModel.position.x = -center.x + (position[0] || 0);
        loadedModel.position.y = floorY - box.min.y + (position[1] || 0);
        loadedModel.position.z = -center.z + (position[2] || 0);

        // Apply rotation
        loadedModel.rotation.set(rotation[0], rotation[1], rotation[2]);

        // Traverse to adjust material settings and enable shadows
        loadedModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Ensure materials react to light properly without overwriting native textures
            if (child.material) {
              // Ensure double-sided rendering for clothing/hair sheets
              child.material.side = THREE.DoubleSide;
              
              // Enable transparency sorting fixes if any materials use alpha
              if (child.material.transparent) {
                child.material.depthWrite = true;
              }
            }
          }
        });

        sceneRef.current.add(loadedModel);

        // Setup animations
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(loadedModel);
          mixerRef.current = mixer;
          setAnimations(gltf.animations);
          onAnimationsFound(gltf.animations.map(a => a.name || 'Unnamed Animation'));
          
          // Play default animation
          const defaultClip = gltf.animations[0];
          const action = mixer.clipAction(defaultClip);
          action.fadeIn(0.3).play();
          setActiveAction(action);
        } else {
          onAnimationsFound([]);
        }

        onLoadComplete();
        onLoadProgress(100);
      },
      (xhr) => {
        if (!isCurrent) return;
        if (xhr.total > 0) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          onLoadProgress(percent);
        } else {
          onLoadProgress(-1);
        }
      },
      (error) => {
        if (!isCurrent) return;
        console.error('Error loading 3D model:', error);
        onLoadError(error);
      }
    );

    return () => {
      isCurrent = false;
    };
  }, [modelPath]);

  // Handle playing selected animation index
  useEffect(() => {
    if (!mixerRef.current || animations.length === 0) return;
    
    const targetClip = animations[activeAnimationIndex];
    if (!targetClip) return;

    const newAction = mixerRef.current.clipAction(targetClip);
    
    if (activeAction) {
      if (activeAction === newAction) return; // Already playing
      activeAction.fadeOut(0.3);
    }
    
    newAction.reset().fadeIn(0.3).play();
    setActiveAction(newAction);
  }, [activeAnimationIndex, animations]);

  // Main Render/Animation Loop
  useEffect(() => {
    const clock = clockRef.current;
    
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // 1. Update Mixer (For skeletal animations)
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // 2. Auto-rotate Model (Slow passive spin if enabled and not currently orbiting manually)
      if (modelRef.current && isAutoRotate && !poweringUp) {
        modelRef.current.rotation.y += 0.005;
      }

      // 3. Aura Light pulsating effect
      if (auraLightRef.current) {
        const pulse = Math.sin(elapsedTime * 6) * 0.3 + 1.0;
        auraLightRef.current.intensity = auraIntensity * (poweringUp ? 10 : 3.5) * pulse;
      }

      // 4. Camera Power Up Shake Effect
      if (cameraRef.current && controlsRef.current) {
        if (poweringUp) {
          // Add high-frequency noise shake
          const shakeFactor = 0.06;
          cameraRef.current.position.x += (Math.random() - 0.5) * shakeFactor;
          cameraRef.current.position.y += (Math.random() - 0.5) * shakeFactor;
          cameraRef.current.position.z += (Math.random() - 0.5) * shakeFactor;
          
          // Flash ambient light colors slightly
          if (ambientLightRef.current) {
            ambientLightRef.current.intensity = 1.5;
          }
        } else {
          // Smoothly decay ambient back to normal
          if (ambientLightRef.current && ambientLightRef.current.intensity > 0.8) {
            ambientLightRef.current.intensity -= 0.05;
          }
        }
      }

      // 5. Update Orbit Controls
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // 6. Render
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isAutoRotate, auraIntensity, poweringUp]);

  return (
    <div 
      ref={containerRef} 
      className="flex-1 w-full relative overflow-hidden select-none cursor-grab active:cursor-grabbing" 
    />
  );
}
