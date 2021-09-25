import React, { useEffect, useRef } from 'react';
import { useSprings, a } from '@react-spring/three';
import PropTypes from 'prop-types';

function Content({initialRoughness, maxHeight, randomizeCount}) {
    const blockSize = 3;
    const colors = [
      'hsl(202, 88%, 38%)', 
      'hsl(39,96%,43%)', 
      'hsl(28,87%,61%)', 
      'hsl(22,87%,60%)', 
      'hsl(45,96%,48%)', 
      'hsl(62,30%,75%)', 
      'hsl(60,14%,93%)'
    ];
    const powOfTwo = 4; // size of landscape - must be int greater than 0
    const sideLength = 2**powOfTwo+1; 
    const totalElements = sideLength*sideLength;
       
    const calcPosition = (index, height) => {
      /*
        Helper function
        Returns correct position for a landscape 
        element given a position index and a height
      */
      const position_x = ((index % Math.sqrt(totalElements)) * blockSize) - ((blockSize*sideLength) / 2); 
      const position_y = (height * blockSize) / 2;
      const position_z = (Math.floor(index / Math.sqrt(totalElements)) * blockSize) - ((blockSize*sideLength) / 2);
  
      return [position_x, position_y, position_z];
    };

    const data = new Array(totalElements).fill().map(() => {
      return {
        color: 'white',
        args: [blockSize, blockSize, blockSize]
      }
    });

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
    };

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
    };

    const getRandomInt = (min,max) => {
      /*
        Helper function
        Returns random integer between min and max
      */    
      return Math.floor(Math.random() * (max - min + 1) + min)
    };

    const initElement = (i) => {
      // Return random value for a landscape element
  
      const r = getRandomInt(0,0);
  
      return {
        position: calcPosition(i,r),
        color: colors[r],
        scale: [1, 1 + r, 1],
        rotation: [0, 0, 0]
      };
    };

    const [springs, set] = useSprings(totalElements, (i) => ({
      from: initElement(i, totalElements, blockSize, maxHeight),
      ...initElement(i, totalElements, blockSize, maxHeight),
      config: { 
        mass: 3.25, 
        tension: 750, 
        friction: 75,
      }
    })); 

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
        const scale = [1, 1+height, 1];

        return {
          position,
          color,
          scale,
        }
      })         
    };

    const twoToOneD = (x,y) => {
      /* 
        Helper function
        Converts a 2D coordinate (used by Diamond Step algo)
        to a 1D coordinate (used by react-spring array)
      */
      return y * sideLength + x;
    };
    
    const doDiamondSquare = () => {
      /* 
        Main function - defines the terrain
        Diamond Square Algo: https://www.youtube.com/watch?v=4GuAV1PnurU
      */

      const averageWetterHeight = (coords) => {
        /* 
          Helper function
          Averages coordinates and increases the water areas
        */
        let newHeight = Math.floor(getAverageValue(coords) + getRandomInt(-1*roughness,roughness));
        if (newHeight < 3) newHeight = 1; // Makes water areas a bit bigger

        return newHeight;
      };

      const squareStep = (half) => {
        for(let y = 0; y < sideLength-1; y += chunkSize) {
          for(let x = 0; x < sideLength-1; x += chunkSize) {
            const squareCoords = [
              [x,y],
              [x+chunkSize,y],
              [x,y+chunkSize],
              [x+chunkSize,y+chunkSize]
            ];

            let newHeight = averageWetterHeight(squareCoords);

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

            let newHeight = averageWetterHeight(diamondCoords);

            setLandscapeElement(
              twoToOneD(x,y),
              newHeight
            );          
          }
        }
      };
  
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
  
      // Step 2: Set initial conditions
      let chunkSize = sideLength-1;
      let roughness = initialRoughness; // Random range added to values
  
      // Step 3: Main iterative loop
      while(chunkSize > 1) {
        const half = Math.floor(chunkSize / 2);
        squareStep(half);
        diamondStep(half);
        chunkSize = Math.floor(chunkSize / 2);
        roughness = Math.floor(roughness / 2); // Roughness decreases as we work on smaller chunks
      }
    }
    
    // Update when props change
    useEffect(() => {
      doDiamondSquare();
    }, [initialRoughness, maxHeight, randomizeCount])
    
    return data.map((d, index) => (
      <a.mesh castShadow receiveShadow key={index} {...springs[index]}>  
        <boxBufferGeometry attach="geometry" args={d.args} />
        <a.meshPhongMaterial attach="material" color={springs[index].color} />
      </a.mesh>
    ))
}

Content.propTypes = {
    initialRoughness: PropTypes.number,
    maxHeight: PropTypes.number,
    randomizeCount: PropTypes.number,
};

Content.defaultProps = {
    initialRoughness: 10,
    maxHeight: 10,
    randomizeCount: 0,
};

export default Content;