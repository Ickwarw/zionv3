
import React from 'react';
import JuliaAvatar from '../../../components/JuliaAvatar';
import JuliaSpeechBubble from '../../../components/JuliaSpeechBubble';

interface JuliaControlsProps {
  isJuliaActive: boolean;
  onJuliaToggle: () => void;
  showJuliaBubble: boolean;
  juliaMessage: string;
  juliaPosition: { x: number; y: number };
  onCloseBubble: () => void;
}

const JuliaControls = ({
  isJuliaActive,
  onJuliaToggle,
  showJuliaBubble,
  juliaMessage,
  juliaPosition,
  onCloseBubble
}: JuliaControlsProps) => {
  return (
    <>
      {/* Julia Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onJuliaToggle}
          className="p-3 rounded-full shadow-lg transition-all duration-300"
        >
          <JuliaAvatar isActive={isJuliaActive} isVisible={false} />
        </button>
      </div>

      {/* Julia Speech Bubble */}
      <JuliaSpeechBubble
        isVisible={showJuliaBubble}
        message={juliaMessage}
        onClose={onCloseBubble}
        position={juliaPosition}
      />
    </>
  );
};

export default JuliaControls;
