import { Component, AfterViewInit } from '@angular/core';
import {
  installProcessDesigner,
  PNodeTemplate,
  ElementType,
  Shape
} from 'process-designer';

const ProcessDesingerId = '__process_designer__';

export const nodeTemplates: PNodeTemplate[] = [
  {
    id: 1,
    type: ElementType.Node,
    name: '操作',
    shape: Shape.Rect,
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

  ngAfterViewInit() {
    installProcessDesigner({ nodeTemplates }, ProcessDesingerId);
  }
}
