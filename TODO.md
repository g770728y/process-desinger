# mobx batch

action 会直接 transaction, 因此照理不需要
todo: 需要验证上述结论, 因为观察到相反现象

# 如何整合

react 组件, 如何整合进 angular

# 边的属性, 这块要结合考虑与锡膏的整合

# 全局移动时, 必须设置全局鼠标

# node 上显示图标

# 为何 gd-page 不生效?

# 对齐: 可选 竖直轴, 水平轴 对齐

自动对齐相应增加横轴对齐

# 默认操作: 双击填写属性

# validate:

1. 开始节点至少一条 next 边
2. 结束节点至少一条 prev 边
3. 其余节点至少一条 next 边 + 一条 prev 边
4. 每个节点自己做校验 , 并根据结果显示 感叹号 在后面
5. 添加 onAddNode / onDeleleteNode 两个事件(调用者收到事件后, 可立即创建空外部节点) ok
