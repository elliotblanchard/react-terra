function Lights({timeOfDay}) {
   
    return (
      <group>
          <ambientLight intensity={0.5 * (timeOfDay/100)} />
          <directionalLight
            position={[((160 * (timeOfDay/100)) - 80), 60, ((40 * (timeOfDay/100)) - 20)]} // x=80 y=60 z=20
            // angle={timeOfDay} // -0.5
            intensity={2.0 * (timeOfDay/100)}
            castShadow
            shadow-mapSize-width={256}
            shadow-mapSize-height={256}
            shadow-camera-left={-200}
            shadow-camera-right={200}
            shadow-camera-top={200}
            shadow-camera-bottom={-200}
          />
          <directionalLight position={[-50, -50, -25]} intensity={0.5 * (timeOfDay/100)} />
      </group>
    )
  }

export default Lights;