import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MapControls, OrthographicCamera } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three'
import * as THREE from 'three';
// import Post from "./Post";

/*
  https://codesandbox.io/s/react-spring-animations-6hi1y?file=/src/Canvas.js
  https://codesandbox.io/s/springy-boxes-jz9l97qn89

*/

const lookAtCubePosition = new THREE.Vector3()

function Box(props) {
  // This reference will give us direct access to the mesh
  const ref = useRef()
  // console.log(props.size)
  // Set up state for the hovered and active state
  const [hovered, setHover] = useState(false)
  const { scale } = useSpring({ scale: hovered ? 1.5 : 1 })
  // const [active, setActive] = useState(false)
  // Rotate mesh every frame, this is outside of React without overhead
  // useFrame(() => {
    // ref.current.rotation.x = ref.current.rotation.y += 0.01
  // })
  return (
    <animated.mesh castShadow receiveShadow
      {...props}
      ref={ref}
      scale-y={scale}
      // onClick={(e) => setActive(!active)}
      onPointerOver={(e) => setHover(true)}
      onPointerOut={(e) => setHover(false)}>
      castShadow receiveShadow  
      <boxGeometry args={props.size} />
      <meshLambertMaterial color={hovered ? 'hotpink' : 'orange'} />
    </animated.mesh>
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
    <mesh position={[-5, 0.5, -5]} ref={ref}>
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshNormalMaterial attach="material" />
    </mesh>
  )
}

export default function App() {

  const [mapElements, setMapElements] = useState(Array(10).fill(Array(10).fill(1)))

  const initMap = (dimension) => {
    const getRandomInt = (max) => {
      return Math.floor(Math.random() * max);
    }    
    let map = [];
    for(let i = 0; i < dimension; i++) {
      let row = new Array();
      for(let j=0; j < dimension; j++) {
        row.push(getRandomInt(5));
      }
      map.push(row);
    }
    return map;
  }

  // const lookAtCubePosition = new THREE.Vector3();

  return (
    <>
      <div onClick={() => setMapElements(initMap(10))}>Randomize Grid</div>
      <Canvas 
        orthographic
        shadows
        // gl={{
        //   stencil: false,
        //   depth: false,
        //   alpha: false,
        //   antialias: false,
        // }}       
        camera={{ 
          near: 0.01, 
          far: 1000, 
          position: [3, 3, 3], 
          zoom: 20, 
        }}>
        {/* <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={40} /> */}
        <color attach="background" args={["#eee"]} />      
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[50, 50, 25]}
          angle={0.3}
          intensity={2}
          castShadow
          shadow-mapSize-width={64}
          shadow-mapSize-height={64}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />      
        {/* <spotLight castShadow position={[10, 10, 10]} angle={0.15} penumbra={1} /> */}
        {/* <pointLight position={[-10, -10, -10]} /> */}
        <CameraTarget />
        {mapElements.map((row,i) =>
              row.map((item,j) =>
                <Box key={`${i}_${j}`} position={[(row.length*-1)+i, item/2, (row.length*-1)+j]} size={[1,item,1]}/>
              )
          )}   
          {/* <Box position={[0, 0, 0]} size={[1,1,1]}/>            */}
        {/* <gridHelper /> */}
        <MapControls />   
        {/* <Post />    */}
        {/* <OrbitControls /> */}
      </Canvas>
    </>
  )
}
