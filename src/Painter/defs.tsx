import * as React from 'react';

const Defs: React.SFC = () => {
  return (
    <defs>
      <marker
        id="arrow"
        markerWidth={10}
        markerHeight={10}
        refX={8}
        refY={5}
        orient={'auto'}
        markerUnits={'strokeWidth'}
      >
        <path d="M2,2 L2,8 L8,5 L2,2" stroke="#999" fill="#999" />
      </marker>

      <radialGradient id="radialGradient">
        <stop offset="0%" stopColor="red" stopOpacity={0} />
        <stop offset="100%" stopColor="red" stopOpacity={1} />
      </radialGradient>
    </defs>
  );
};

export default Defs;
