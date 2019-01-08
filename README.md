# process-designer

## 介绍

项目需要一款图形化流程定义工具. 由于流程定义工具通常作为流程引擎的附属, 相对项目而言过重. 一款较符合需求的 jsplumb 较庞大, 压缩体积 188KB(而且收费), 所以自己造了个新轮子.\

### 特点

- 流程节点可根据需要自行配置
- 支持`react / angular`等框架
- 支持**节点自动排列**(灵感: 百度脑图)
- 提供辅助线作图, 很容易对齐
- 特别适合**沿竖直轴线排列**的流程图

## Install

```bash
npm install --save process-designer
or
yarn add process-designer
```

## Usage

React: 参见 example 目录\
angular: 参见 example-angular 目录\
二者的区别是: react 直接引入组件, angular 需要安装在某个预先存在的 dom 节点上\

### 第一步: 定义节点模板

    const nodeTemplates: PNodeTemplate[] = [
      {
        id: 1,
        type: ElementType.Node,
        label: '操作',
        shape: Shape.Rect,
        dim: { w: 100, h: 30 }
      }
    ];

### 第二步: 定义事件

目前内置两个自定义事件:

#### onActiveNode

// 双击 或 点击 node 上的编辑按钮时 触发此事件
// 回调方法将收到整个 node 节点, 可使用 node 节点的 id, 查找对应的业务对象并弹出编辑框
onActiveNode?: (id: PNodeId) => void;

#### onDelNode

    // 在图中删除节点时调用, 同步调用 对应的 业务对象
    onDelNode?: (id: PNodeId) => void;

### 第三步: 初始化

    // 以下是angular的初始代码, 注意将返回 designerController
    ngAfterViewInit() {
      this.designerController = installProcessDesigner({
        el: ProcessDesingerId,
        config: { nodeTemplates },
        events,
        data: {}    // 可以是空对象, 也可以是上次存入数据库的内容
      });
    }

    // react
    <ProcessDesigner config={this.config} data={processData} events={events} />

### 第四步: 编辑, 保存

保存时:

1. 可以使用 getAllAssoc 方法, 获取全部 节点关联, 并应用到 业务对象上
2. 可以使用 getDesingerData 方法, 获取 节点设计信息, 以备下次使用

## License

MIT © [g770728y](https://github.com/g770728y)
