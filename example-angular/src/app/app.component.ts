import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import ProcessDesigner, {
  installProcessDesigner,
  PNodeTemplate,
  ElementType,
  Shape,
  PNode,
  DesignerController,
  PNodeId,
  PConfig,
  PNodeCandidate
} from 'process-designer';

const ProcessDesingerId = '__process_designer__';

export const nodeTemplates: PNodeTemplate[] = [
  {
    id: 1,
    label: '操作',
    shape: Shape.Rect,
    iconSrc: '/assets/repair_24x24.png',
    dim: { w: 100, h: 30 },
    branchFlags: ['ok', 'fail']
  }
];

export const nodeCandidates: PNodeCandidate[] = [
  {
    label: 'go go go',
    shape: Shape.Rect,
    iconSrc: '/assets/repair_24x24.png',
    dim: { w: 100, h: 30 },
    branchFlags: ['ok', 'fail'],
    templateId: 1,
    data: { a: 1 }
  },
  {
    label: 'fighting',
    shape: Shape.Rect,
    iconSrc: '/assets/repair_24x24.png',
    dim: { w: 100, h: 30 },
    branchFlags: ['aha', 'cry'],
    templateId: 1,
    data: { a: 2 }
  }
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit, OnDestroy {
  title = 'example-angular';
  designerController: DesignerController;
  uninstall: () => void;

  rearrange() {
    this.designerController.rearrange();
  }

  ngAfterViewInit() {
    const [designerController, uninstall] = installProcessDesigner({
      el: ProcessDesingerId,
      config: {
        nodeTemplates,
        nodeCandidates,
        ui: { nodeCandidatesPanelTop: 30 }
      },
      events: {
        // onActiveNode(nodeId?: PNodeId, data?: any) {
        // console.log('nodeId:', nodeId, data);
        // },

        onDelNode(nodeId: PNodeId) {
          console.log('delete node:', nodeId);
        },

        onAddNode(nodeId: PNodeId, data: any) {
          console.log('add node:', nodeId, 'data:', data);
        }
      },
      data: null
    });

    this.designerController = designerController;
    this.uninstall = uninstall;
  }

  ngOnDestroy() {
    this.uninstall();
  }
}
