import React, { useEffect, useRef } from 'react';
import { useSprings, a } from '@react-spring/three';

function Content({initialRoughness, maxHeight, randomizeCount}) {
    const meshRef = useRef();
    const powOfTwo = 4; // must be int greater than 0
    const sideLength = 2**powOfTwo+1; // side length must be 2**N+1 for Diamond Square
    const numElements = sideLength*sideLength; 
    const blockSize = 3;
    const colors = ['hsl(202, 88%, 38%)', 'hsl(39,96%,43%)', 'hsl(28,87%,61%)', 'hsl(22,87%,60%)', 'hsl(45,96%,48%)', 'hsl(62,93%,66%)', 'hsl(60,14%,93%)'];
  
    const twoToOneD = (x,y) => {
      /* 
        Helper function
        Converts a 2D coordinate (used by Diamond Step algo)
        to a 1D coordinate (used by react-spring array)
      */
      // if ((y * sideLength + x) > numElements) console.log(`Illegal index: x: ${x} y: ${y} side length: ${sideLength}`);
      return y * sideLength + x;
    }
  
    const calcPosition = (index, height) => {
      /*
        Helper function
        Returns correct position for a landscape 
        element given a position index and a height
      */
      const position_x = ((index % Math.sqrt(numElements)) * blockSize) - ((blockSize*sideLength) / 2); 
      const position_y = (height * blockSize) / 2;
      const position_z = (Math.floor(index / Math.sqrt(numElements)) * blockSize) - ((blockSize*sideLength) / 2) ;
  
      return [position_x, position_y, position_z];
    }
  
    const getRandomInt = (min,max) => {
      /*
        Helper function
        Returns random integer between min and max
      */    
      return Math.floor(Math.random() * (max - min + 1) + min)
    };
  
    const initElement = (i, numElements, blockSize, maxHeight) => {
      // Return random value for a landscape element
  
      const r = getRandomInt(0,0);
  
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
      from: initElement(i, numElements, blockSize, maxHeight),
      ...initElement(i, numElements, blockSize, maxHeight),
      config: { 
        mass: 3.25, 
        tension: 750, 
        friction: 75,
      }
    }))
    // useEffect(() => void setInterval(() => set((i) => ({ ...randomizeElement(i, numElements, blockSize, maxHeight), delay: i * 40 })), 3000), [])
  
    const getLandscapeHeight = (index) => {
      /*
        Helper function
        Gets the height of a single landscape element + corrects undefined heights
      */
      if (springs[index].scale.animation.toValues[1]) {
        return springs[index].scale.animation.toValues[1];
      } else {
        return 0;
      }    
    }
  
    const getAllLandscapeHeights = () => {
      /*
        Debug function
        Outputs heights of all landscape elements - used to check for undefined vals
      */ 
     // for (let i=0; i < springs.length; i++) {     
     //  console.log(`Index: ${i}, height: ${getLandscapeHeight(i)}`)
     // }
    }
    
    const setLandscapeElement = (index, height) => {
      /*
        Helper function
        Sets the height and correct color of a single landscape element
      */ 
      set.start(i => {
        if (index !== i) return; // We're only interested in changing spring-data for the current spring
        let color = undefined;
  
        if (height <= 1) { color = colors[0] }
        else if (height <= 6) { color = colors[1] }
        else if (height <= 12) { color = colors[2] }
        else if (height <= 18) { color = colors[3] }
        else if (height <= 24) { color = colors[4] }
        else if (height <= 31) { color = colors[5] }
        else { color = colors[6] };
  
        const position = calcPosition(i,height);
        // const color = colors[Math.round(colors.length*(height/(maxHeight+initialRoughness)))-1]
        const scale = [1, 1+height, 1];
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
        if((coord[0] >= 0) && (coord[0] < sideLength) && (coord[1] >= 0) && (coord[1] < sideLength)){
          count += 1;
          total += getLandscapeHeight(twoToOneD(coord[0],coord[1]));
          // console.log(`cords: ${coord} height: ${getLandscapeHeight(twoToOneD(coord[0],coord[1]))}`);
        }
      });
      // console.log(`average: ${total/count}`)
      return total / count;
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
        for(let y = 0; y < sideLength-1; y += chunkSize) {
          for(let x = 0; x < sideLength-1; x += chunkSize) {
            const squareCoords = [
              [x,y],
              [x+chunkSize,y],
              [x,y+chunkSize],
              [x+chunkSize,y+chunkSize]
            ];
            let newHeight = Math.floor(getAverageValue(squareCoords) + getRandomInt(-1*roughness,roughness));
            if (newHeight < 3) newHeight = 1; // Makes water areas a bit bigger
            // let newHeight = 0.5;
            // console.log(`>>>>>>X: ${x} Y: ${y} Chunk size: ${chunkSize} Half: ${half} Setting: [${x+half},${y+half}]`);
            setLandscapeElement(
              twoToOneD(x+half,y+half),
              newHeight
            );
          };
        };
      };
  
      const diamondStep = (half) => {
        for(let y = 0; y < sideLength; y += half) {
          for(let x = ((y + half) % chunkSize); x < sideLength; x += chunkSize) {
            const diamondCoords = [
              [x,y-half],
              [x-half,y],
              [x+half,y],
              [x,y+half]
            ];          
            // console.log(`>>>>>>Setting: [${x},${y}]`);
            let newHeight = Math.floor(getAverageValue(diamondCoords) + getRandomInt(-1*roughness,roughness));
            if (newHeight < 3) newHeight = 1; // Makes water areas a bit bigger
            // let newHeight = 0.5;
            setLandscapeElement(
              twoToOneD(x,y),
              newHeight
            );          
          }
        }
      }
      
      // getAllLandscapeHeights();
  
      // Step 1: Set 4 corners to random values
      const corners = [0,sideLength-1];
      corners.forEach((x) => {
        corners.forEach((y) => {
          setLandscapeElement(
            twoToOneD(x,y),
            getRandomInt(1,maxHeight)
          ); 
        });
      });
  
      // debugger;
  
      // Step 2: Set initial conditions
      let chunkSize = sideLength-1;
      let roughness = initialRoughness; // Random range added to values
  
      // Step 3: Main iterative loop
      //for (let i=0; i<2; i++) {
      while(chunkSize > 1) {
        const half = Math.floor(chunkSize / 2);
        squareStep(half);
        diamondStep(half);
        chunkSize = Math.floor(chunkSize / 2);
        roughness = Math.floor(roughness / 2); // Roughness decreases as we work on smaller chunks
        // console.log("++++++++++++++++++++++++");
        // console.log("++++++++++++++++++++++++");
        // console.log("++++++++++++++++++++++++");
      }
    }
    
    // Update when props change
    useEffect(() => {
      doDiamondSquare();
      // meshRef.current.scale.x = 100; // example of ref handle to mesh
      // meshRef.faces[0].vertexColors = [100,100,100];
    }, [initialRoughness, maxHeight, randomizeCount])
    
    return data.map((d, index) => (
      <a.mesh castShadow receiveShadow ref={meshRef} key={index} {...springs[index]}>
        {/* <boxGeometry args={[0.6, 0.6, 0.6]}>
          <instancedBufferAttribute attachObject={['attributes', 'color']} args={[colorArray, 3]} />
        </boxGeometry>
        <meshPhongMaterial vertexColors={THREE.VertexColors} />       */}
  
        <boxBufferGeometry attach="geometry" args={d.args} />
        <a.meshPhongMaterial attach="material" color={springs[index].color} />
        
        {/* <a.meshPhongMaterial attach="material" vertexColors={THREE.VertexColors} color={springs[index].color} /> */}
        {/* <a.meshStandardMaterial attach="material" color={springs[index].color} /> */}
      </a.mesh>
    ))
  }

  export default Content;