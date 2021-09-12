import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MapControls } from '@react-three/drei';
import { useSprings, a } from '@react-spring/three'
import * as THREE from 'three';

/*
  https://codesandbox.io/s/worldgrid-0upfs
  https://codesandbox.io/s/springy-boxes-forked-0upfs?file=/src/index.js
  https://codesandbox.io/s/react-spring-animations-6hi1y?file=/src/Canvas.js
  https://react-spring.io/basics
  https://codesandbox.io/s/springy-boxes-jz9l97qn89
*/

const lookAtCubePosition = new THREE.Vector3()

function CameraTarget() {
  const ref = useRef()

  useFrame((state) => {
    lookAtCubePosition.x = ref.current.position.x
    lookAtCubePosition.y = ref.current.position.y
    lookAtCubePosition.z = ref.current.position.z  
    state.camera.lookAt(lookAtCubePosition)
  })

  return (
    <mesh position={[-5, 0.5, -5]} ref={ref}>
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshNormalMaterial attach="material" />
    </mesh>
  )
}

function Content() {
  const numElements = 100
  const blockSize = 10
  const maxHeight = 4

  const colors = ['#D98E04', '#F29544', '#F28241', '#F2B705']

  const randomizeElements = (i, numElements, blockSize, maxHeight) => {
    const getRandomInt = (max) => {
      return Math.floor(Math.random() * max)
    }

    const r = getRandomInt(maxHeight)

    return {
      position: [(i % Math.sqrt(numElements)) * blockSize, (r * blockSize) / 2, Math.floor(i / Math.sqrt(numElements)) * blockSize],
      color: colors[r],
      scale: [1, 1 + r, 1],
      rotation: [0, 0, 0]
    }
  }

  const data = new Array(numElements).fill().map(() => {
    return {
      color: 'red',
      args: [blockSize, blockSize, blockSize]
    }
  })

  const [springs, set] = useSprings(numElements, (i) => ({
    from: randomizeElements(i, numElements, blockSize, maxHeight),
    ...randomizeElements(i, numElements, blockSize, maxHeight),
    config: { mass: 2, tension: 1000, friction: 50 }
  }))
  // useEffect(() => void setInterval(() => set((i) => ({ ...randomizeElements(i, numElements, blockSize, maxHeight), delay: i * 40 })), 3000), [])

  const doRandomize = () => {
    set((i) => ({ ...randomizeElements(i, numElements, blockSize, maxHeight), delay: i * 10 }))
  }

  return data.map((d, index) => (
    <a.mesh castShadow receiveShadow onClick={() => doRandomize()} key={index} {...springs[index]}>
      <boxBufferGeometry attach="geometry" args={d.args} />
      <a.meshStandardMaterial attach="material" color={springs[index].color} />
    </a.mesh>
  ))
}

function Lights() {
  return (
    <group>
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[100, 100, 50]}
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
        <directionalLight position={[-50, -50, -25]} intensity={0.5} />
    </group>
  )
}

export default function App() {
  return (
    <>
      <Canvas 
        orthographic
        shadows      
        camera={{ 
          near: 0.01, 
          far: 1000, 
          position: [100, 100, 100], 
          zoom: 5, 
        }}>
        <color attach="background" args={["#eee"]} />      
        <Lights />
        <CameraTarget />
        <Content />
        <MapControls />   
      </Canvas>
    </>
  )
}
