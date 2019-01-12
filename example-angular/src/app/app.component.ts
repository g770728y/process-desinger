import { Component, AfterViewInit } from '@angular/core';
import ProcessDesigner, {
  installProcessDesigner,
  PNodeTemplate,
  ElementType,
  Shape,
  PNode,
  DesignerController,
  PNodeId
} from 'process-designer';

const ProcessDesingerId = '__process_designer__';

export const nodeTemplates: PNodeTemplate[] = [
  {
    id: 1,
    type: ElementType.Node,
    label: '操作',
    shape: Shape.Rect,
    iconSrc: '/assets/repair_24x24.png',
    dim: { w: 100, h: 30 }
  }
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'example-angular';
  designerController: DesignerController;

  rearrange() {
    this.designerController.rearrange();
  }

  ngAfterViewInit() {
    this.designerController = installProcessDesigner({
      el: ProcessDesingerId,
      config: { nodeTemplates },
      events: {
        onActiveNode(nodeId: PNodeId) {
          console.log('nodeId:', nodeId);
        },

        onDelNode(nodeId: PNodeId) {
          console.log('delete node:', nodeId);
        },

        onAddNode(nodeId: PNodeId) {
          console.log('add node:', nodeId);
        }
      },
      data: null
    });
  }
}
