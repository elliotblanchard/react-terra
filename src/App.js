import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MapControls } from '@react-three/drei';
import * as THREE from 'three';

// import styles from './Terra.less';

import Content from './Content';
import Lights from './Lights';

/*
  Map generation:
  - Diamond Square https://www.youtube.com/watch?v=4GuAV1PnurU

  Vertex colors (for gradients): 
  - https://codesandbox.io/s/8fo01?file=/src/index.js:2218-2222
  - https://darrendev.blogspot.com/2016/03/gradients-in-threejs.html

  https://react-spring.io/hooks/use-springs
  https://codesandbox.io/s/worldgrid-0upfs
  https://codesandbox.io/s/springy-boxes-forked-0upfs?file=/src/index.js
  https://codesandbox.io/s/react-spring-animations-6hi1y?file=/src/Canvas.js
  https://react-spring.io/basics
  https://codesandbox.io/s/springy-boxes-jz9l97qn89
*/

function CameraTarget() {
  const lookAtCubePosition = new THREE.Vector3();
  const ref = useRef();

  useFrame((state) => {
    lookAtCubePosition.x = ref.current.position.x;
    lookAtCubePosition.y = ref.current.position.y;
    lookAtCubePosition.z = ref.current.position.z;  
    state.camera.lookAt(lookAtCubePosition);
  })

  return (
    <mesh position={[0, 40, 0]} ref={ref} scale={[0, 0, 0]}>
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshNormalMaterial attach="material" />
    </mesh>
  )
}

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
}

export default function App() {
  const [state, setState] = useState({
    initialRoughness: 10,
    maxHeight: 10,
    randomizeCount: 0,
    timeOfDay: 100,
  });

  const handleChange = (e) => {
    let value = undefined;
    if(e.target.type === 'submit') {
      value = state[e.target.name] += 1;
    } else {
      value = e.target.value;
    }
    setState({
      ...state,
      [e.target.name]: value,
    });
  };  

  return (
    <>
      <div className='overlay' style={{filter: `brightness(${(2 - (1 * (state.timeOfDay/100)))})`}} >
        <header>
          <h1>React Terrain</h1>
          <h2>{getWindowDimensions().width}</h2>          
          <p>The diamond-square - also known as cloud or plasma fractal algorithm - was first introduced by Fournier, Fussell and Carpenter at SIGGRAPH 1982</p>
          <p>Adjust the sliders to change seed values. Use the mouse to zoom or rotate the landscape. Randomize to generate a new terrain.</p>
          <p>Built with React + React Three Fiber</p>
        </header>
        <main>
          <div className='menuItem'>
            <h2>Roughness</h2>
            <input
              max='20'
              min='0'
              name='initialRoughness'
              onChange={handleChange}
              type='range'
              value={state.initialRoughness}
            />
          </div>
          <div className='menuItem'>
            <h2>Height</h2>
            <input
              max='20'
              min='5'
              name='maxHeight'
              onChange={handleChange}
              type='range'
              value={state.maxHeight}
            /> 
          </div>
          <div className="menuItem">         
            <h2>Time</h2>
            <input
              max='100' 
              min='1'     
              name='timeOfDay'       
              onChange={handleChange}                                 
              type='range'
              value={state.timeOfDay}
            /> 
          </div>
          <div className='menuItem'>       
            <button name='randomizeCount' onClick={handleChange}>Randomize</button>  
          </div>   
        </main>          
      </div>
      <Canvas 
        className='canvas'
        orthographic
        shadows      
        camera={{ 
          far: 1000,
          near: 0.01,  
          position: [100, 100, 100], 
          zoom: 10.5, 
        }}
      >
        <color 
          args={[`hsl(
            ${Math.floor(45 * (state.timeOfDay/100))}, 
            ${Math.floor(100 * (state.timeOfDay/100)+ 20)}%, 
            ${Math.floor(90 * (state.timeOfDay/100) + 5)}%)`]} 
          attach='background' 
        />      
        <CameraTarget />
        <group position={[0, -20, 0]} rotation={[0,(0-(5-(5 * (state.timeOfDay/100)))),0]}>
          <Lights timeOfDay={state.timeOfDay} />
          <Content 
            initialRoughness={state.initialRoughness} 
            maxHeight={state.maxHeight}
            randomizeCount={state.randomizeCount} 
          />
        </group>
        <MapControls />   
      </Canvas>
    </>
  )
}
