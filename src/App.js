import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MapControls, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';

const lookAtCubePosition = new THREE.Vector3()

function Box(props) {
  // This reference will give us direct access to the mesh
  const ref = useRef()
  console.log(props.size)
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const [active, setActive] = useState(false)
  // Rotate mesh every frame, this is outside of React without overhead
  // useFrame(() => {
    // ref.current.rotation.x = ref.current.rotation.y += 0.01
  // })
  return (
    <mesh
      {...props}
      ref={ref}
      scale={active ? 1.5 : 1}
      onClick={(e) => setActive(!active)}
      onPointerOver={(e) => setHover(true)}
      onPointerOut={(e) => setHover(false)}>
      castShadow receiveShadow  
      <boxGeometry args={props.size} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

function CameraTarget() {
  const ref = useRef()
  // useFrame((state, delta) => {
  //   if (ref.current.position.x > 3) {
  //     ref.current.position.x = -3
  //   } else {
  //     ref.current.position.x += delta * 1
  //   }
  // })

  useFrame((state) => {
    lookAtCubePosition.x = ref.current.position.x
    lookAtCubePosition.y = ref.current.position.y
    lookAtCubePosition.z = ref.current.position.z
    // lookAtCubePosition.x = 0
    // lookAtCubePosition.y = 0
    // lookAtCubePosition.z = 0    
    state.camera.lookAt(lookAtCubePosition)
  })

  return (
    <mesh position={[0, 0.5, 0]} ref={ref}>
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshNormalMaterial attach="material" />
    </mesh>
  )
}

export default function App() {
  const mapElements = [1.0,2.0,1.0,4.0,3.0,1.0,2.5,4.5,1.5,1.0];
  // const lookAtCubePosition = new THREE.Vector3();

  return (
    <Canvas orthographic camera={{ near: 0.1, far: 1000, position: [3, 3, 3], zoom: 20 }}>
      {/* <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={40} /> */}
      <ambientLight intensity={0.5} />
      <spotLight castShadow position={[10, 10, 10]} angle={0.15} penumbra={1} />
      {/* <pointLight position={[-10, -10, -10]} /> */}
      <CameraTarget />
      {mapElements.map((mapUnit,index) =>
            <Box position={[index, mapUnit/2, 0]} size={[1,mapUnit,1]}/>
        )}   
        {/* <Box position={[0, 0, 0]} size={[1,1,1]}/>            */}
      <gridHelper />
      <MapControls />      
      {/* <OrbitControls /> */}
    </Canvas>
  )
}
