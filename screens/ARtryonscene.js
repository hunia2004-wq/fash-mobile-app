import React, { useState } from 'react';
import {
  ViroARScene,
  ViroAmbientLight,
  ViroImage,
  ViroNode,
} from '@reactvision/react-viro';

/**
 * ARtryonscene.js
 *
 * Filename matches App.js import: ./screens/ARtryonscene
 *
 * Receives from ViroARSceneNavigator via sceneNavigator.viroAppProps:
 *   - garmentUri: string   publicly accessible image URL
 *   - opacity:    number   0–1
 *   - scale:      number   size multiplier (default 1)
 *
 * The garment renders as a flat ViroImage 0.5 m in front of the camera
 * at chest height. The user drags it anywhere with onDrag.
 */
export default function ARtryonscene({ sceneNavigator }) {
  const {
    garmentUri,
    opacity = 1,
    scale = 1,
  } = sceneNavigator?.viroAppProps ?? {};

  const [arInitialized, setArInitialized] = useState(false);
  const [position, setPosition] = useState([0, -0.1, -0.5]);

  // ViroTrackingStateConstants.TRACKING_NORMAL === 3
  const onTrackingUpdated = (state) => {
    if (state === 3) {
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
          dragType="FixedToWorld"
          onDrag={onDrag}
        >
          <ViroImage
            source={{ uri: garmentUri }}
            scale={[0.4 * scale, 0.6 * scale, 1]}
            opacity={opacity}
            resizeMode="ScaleToFill"
          // No placeholderSource — avoids missing asset crash.
          // Add one once you have an assets/placeholder.png in your project.
          />
        </ViroNode>
      ) : null}
    </ViroARScene>
  );
}