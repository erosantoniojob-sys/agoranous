import React from 'react'

/**
 * Instrumento celeste puramente decorativo. A posição reage às variáveis
 * escritas pela superfície do hero, sem criar um segundo listener de ponteiro.
 */
export const AgoraOrrery: React.FC = () => (
  <div className="agora-orrery" aria-hidden="true">
    <div className="agora-orrery__halo" />
    <div className="agora-orrery__meridian agora-orrery__meridian--outer">
      <span className="agora-orrery__satellite agora-orrery__satellite--one" />
    </div>
    <div className="agora-orrery__meridian agora-orrery__meridian--middle">
      <span className="agora-orrery__satellite agora-orrery__satellite--two" />
    </div>
    <div className="agora-orrery__meridian agora-orrery__meridian--inner">
      <span className="agora-orrery__satellite agora-orrery__satellite--three" />
    </div>
    <div className="agora-orrery__axis" />
    <div className="agora-orrery__sun">
      <span />
    </div>
    <div className="agora-orrery__base" />
  </div>
)
