import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MapControls } from '@react-three/drei';
import { useSprings, a } from '@react-spring/three'
import * as THREE from 'three';

/*
  >>>> Invalid coords are being sent to the 2d->1d function
  
  Map generation:
  - Diamond Square https://www.youtube.com/watch?v=4GuAV1PnurU
  - Perlin Worms https://www.youtube.com/watch?v=B8qarIAuE6M
  - Lazy Flood Fill Biomes https://www.youtube.com/watch?v=YS0MTrjxGbM

  https://react-spring.io/hooks/use-springs
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
  const numElements = 25; // must be 2**N+1 for Diamond Square
  const sideLength = Math.sqrt(numElements);
  const blockSize = 10;
  const maxHeight = 5;

  const colors = ['#D98E04', '#F29544', '#F28241', '#F2B705', '#F4f957'];

  const TwoDimToOneDim = (x,y,sideLength) => {
    /* 
      Helper function
      Converts a 2D coordinate (used by Diamond Step algo)
      to a 1D coordinate (used by react-spring array)
    */
    if ((y * sideLength + x) > 25) console.log(`${x} ${y} ${sideLength}`);
    return y * sideLength + x;
  }

  const calcPosition = (index, height) => {
    /*
      Helper function
      Returns correct position for a landscape 
      element given a position index and a height
    */
    const position_x = (index % Math.sqrt(numElements)) * blockSize; 
    const position_y = (height * blockSize) / 2;
    const position_z = Math.floor(index / Math.sqrt(numElements)) * blockSize;

    return [position_x, position_y, position_z];
  }

  const getRandomInt = (min,max) => {
    /*
      Helper function
      Returns random integer between min and max
    */    
    return Math.floor(Math.random() * (max - min + 1) + min)
  };

  const randomizeElement = (i, numElements, blockSize, maxHeight) => {
    // Return random value for a landscape element

    const r = getRandomInt(0,maxHeight);

    return {
      position: calcPosition(i,r),
      color: colors[r],
      scale: [1, 1 + r, 1],
      rotation: [0, 0, 0]
    };
  }

  const data = new Array(numElements).fill().map(() => {
    return {
      color: 'green',
      args: [blockSize, blockSize, blockSize]
    }
  })

  const [springs, set] = useSprings(numElements, (i) => ({
    from: randomizeElement(i, numElements, blockSize, maxHeight),
    ...randomizeElement(i, numElements, blockSize, maxHeight),
    config: { mass: 2, tension: 1000, friction: 50 }
  }))
  // useEffect(() => void setInterval(() => set((i) => ({ ...randomizeElement(i, numElements, blockSize, maxHeight), delay: i * 40 })), 3000), [])

  const getLandscapeElementHeight = (index) => {
    return springs[index].scale.animation.fromValues[1];
  }
  
  const setLandscapeElement = (index, height) => {
    /*
      Helper function
      Sets the height and correct color of a single landscape element
    */ 
    set.start(i => {
      if (index !== i) return // We're only interested in changing spring-data for the current spring
      const position = calcPosition(i,height)
      const color = "#F00"
      const scale = [1, 1+height, 1]
      return {
        position,
        color,
        scale,
      }
    })      
  }

  const getAverageValue = (coords) => {
    /*
      Helper function
      Averages an array of x,y coordinates, discarding any out of range values
    */   
    let count = 0;
    let total = 0;
    coords.forEach((coord) => {
      if((coord[0] >= 0) && (coord[0] <= sideLength) && (coord[1] >= 0) && (coord[1] <= sideLength)){
        count += 1;
        // console.log(`cords: ${coord} <<<<<<<<<<<<>>>>>>>>>> index: ${TwoDimToOneDim(coord[0],coord[1],sideLength)}`);
        total += getLandscapeElementHeight(TwoDimToOneDim(coord[0],coord[1],sideLength));
      }
    });
    return total / count;
    //return 1;
  }

  const doRandomize = () => {
    set((i) => ({ 
      ...randomizeElement(i, numElements, blockSize, maxHeight), 
      delay: i * 5 
    }))
  }

  const doDiamondSquare = () => {
    // Diamond Square Algo: https://www.youtube.com/watch?v=4GuAV1PnurU

    const squareStep = (half) => {
      for(let y = 0; y < sideLength; y += chunkSize) {
        for(let x = 0; x < sideLength; x += chunkSize) {
          const squareCoords = [
            [x,y],
            [x+chunkSize,y],
            [x,y+chunkSize],
            [x+chunkSize,y+chunkSize]
          ];
          let newHeight = getAverageValue(squareCoords) + getRandomInt(-1*roughness,roughness);
          if (newHeight < 1) newHeight = 1;
          setLandscapeElement(
            TwoDimToOneDim(x+half,y+half,sideLength),
            newHeight
          );
        };
      };
    };

    const diamondStep = (half) => {
      for(let y = 0; y <= sideLength; y += half) {
        for(let x = ((y + half) % chunkSize); x <= sideLength; x += chunkSize) {
          const diamondCoords = [
            [x,y-half],
            [x-half,y],
            [x+half,y],
            [x,y+half]
          ];          
          let newHeight = getAverageValue(diamondCoords) + getRandomInt(-1*roughness,roughness);
          if (newHeight < 1) newHeight = 1;
          setLandscapeElement(
            TwoDimToOneDim(x,y,sideLength),
            newHeight
          );          
        }
      }
    }
    
    // Step 1: Set 4 corners to random values
    const corners = [0,sideLength-1];
    corners.forEach((x) => {
      corners.forEach((y) => {
        setLandscapeElement(
          TwoDimToOneDim(x,y,sideLength),
          getRandomInt(0,maxHeight)
        );
      })
    });

    // Step 2: Set initial conditions
    let chunkSize = numElements-1;
    let roughness = 2; // Random range added to values

    // Step 3: Main iterative loop
    while(chunkSize > 1) {
      const half = Math.floor(chunkSize / 2);
      squareStep(half);
      diamondStep(half);
      chunkSize = Math.floor(chunkSize / 2);
      roughness = Math.floor(roughness / 2); // Roughness decreases as we work on smaller chunks
    }
  }

  return data.map((d, index) => (
    <a.mesh castShadow receiveShadow onClick={() => doDiamondSquare()} key={index} {...springs[index]}>
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
          position={[80, 60, 20]}
          angle={-0.5}
          intensity={2}
          castShadow
          shadow-mapSize-width={64}
          shadow-mapSize-height={64}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
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
