import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MapControls, OrthographicCamera } from '@react-three/drei';

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

export default function App() {
  const mapElements = [1.0,2.0,1.0,4.0,3.0,1.0,2.5,4.5,1.5,1.0];
  return (
    <Canvas shadows>
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={40} />
      <ambientLight intensity={0.5} />
      <spotLight castShadow position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      {mapElements.map((mapUnit,index) =>
            <Box position={[index, mapUnit/2, 0]} size={[1,mapUnit,1]}/>
        )}      
      <MapControls />
      {/* <OrbitControls /> */}
    </Canvas>
  )
}
