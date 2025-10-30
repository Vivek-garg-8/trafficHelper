import React from 'react'

const url = "https://wokwi.com/projects/446131937804759041";

const EmbeddedStimulation = () => {
    return (
        <div>
            <div style={{ width: '100%', height: '1000px' }}> {/* Adjust styling as needed */}
                <iframe
                    src={url}
                    title={"Traffic Light Simulation"}
                    width="100%"
                    height="90%"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    )
}

export default EmbeddedStimulation
