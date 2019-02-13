import React, { Component } from 'react';
import './App.css';
import { processData, nodeTemplates, nodeCandidates } from './data';
import ProcessDesigner from 'process-designer';

class App extends Component {
  config = {
    canvas: { background: '#ffffff' },
    nodeTemplates: nodeTemplates,
    nodeCandidates: nodeCandidates
  };

  render() {
    return (
      <div className="App">
        <ProcessDesigner config={this.config} data={processData} events={{}} />
      </div>
    );
  }
}

export default App;
