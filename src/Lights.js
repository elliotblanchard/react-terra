import PropTypes from 'prop-types';

function Lights({timeOfDay}) {
   
    return (
      <group>
          <ambientLight intensity={0.5 * (timeOfDay/100)} />
          <directionalLight
            castShadow
            intensity={2.0 * (timeOfDay/100)}
            position={
              [
                ((160 * (timeOfDay/100)) - 80), 
                60, 
                ((40 * (timeOfDay/100)) - 20)
              ]
            }
            shadow-mapSize-width={256}
            shadow-mapSize-height={256}
            shadow-camera-left={-200}
            shadow-camera-right={200}
            shadow-camera-top={200}
            shadow-camera-bottom={-200}
          />
          <directionalLight 
            intensity={0.5 * (timeOfDay/100)}
            position={[-50, -50, -25]}  
          />
      </group>
    )
  }

Lights.propTypes = {
  timeOfDay: PropTypes.number,
};

Lights.defaultProps = {
  timeOfDay: 100,
};

export default Lights;