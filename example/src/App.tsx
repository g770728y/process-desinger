import React, { Component } from 'react';
import './App.css';
import { processData, nodeTemplates } from './data';
import ProcessDesigner from 'process-designer';

class App extends Component {
  config = {
    canvas: { background: '#ffffff' },
    nodeTemplates: nodeTemplates
  };

  render() {
    return (
      <div className="App">
        <ProcessDesigner config={this.config} data={processData} />
      </div>
    );
  }
}

export default App;
