import * as React from 'react';

const Defs: React.SFC = () => {
  return (
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
  );
};

export default Defs;
