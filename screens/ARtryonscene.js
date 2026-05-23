import React, { useState } from 'react';

export default function ARtryonscene({ sceneNavigator }) {
  const {
    ViroARScene,
    ViroAmbientLight,
    ViroImage,
    ViroNode,
    ViroTrackingStateConstants,
  } = require('@reactvision/react-viro');

  const {
    garmentUri,
    opacity = 1,
    scale = 1,
  } = sceneNavigator?.viroAppProps ?? {};

  const [arInitialized, setArInitialized] = useState(false);
  const [position, setPosition] = useState([0, -0.1, -0.5]);

  const onTrackingUpdated = (state) => {
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      setArInitialized(true);
    }
  };

  const onDrag = (dragToPos) => {
    setPosition(dragToPos);
  };

  return (
    <ViroARScene onTrackingUpdated={onTrackingUpdated}>
      <ViroAmbientLight color="#ffffff" intensity={200} />

      {arInitialized && garmentUri ? (
        <ViroNode
          position={position}
          dragType="FixedDistance"
          onDrag={onDrag}
        >
          <ViroImage
            source={{ uri: garmentUri }}
            scale={[0.4 * scale, 0.6 * scale, 1]}
            opacity={opacity}
            resizeMode="ScaleToFill"
          />
        </ViroNode>
      ) : null}
    </ViroARScene>
  );
}