import { PAnchorType } from '../../index.type';

// 抽取画布内node的数据属性
export function extractNodeAttrs(e: MouseEvent) {
  const el = e.target! as HTMLElement;
  const dataId = el.getAttribute('data-id');

  return {
    dataType: el.getAttribute('data-type') || undefined,
    dataId: dataId ? parseInt(dataId) : undefined
  };
}

// 抽取画布内grip的数据属性
export function extractGripAttrs(e: MouseEvent) {
  const el = e.target! as HTMLElement;
  const dataHost = el.getAttribute('data-host');
  const host = hostInfo(dataHost);

  return {
    dataType: el.getAttribute('data-type') || undefined,
    dataHost: host
  };
}

function hostInfo(dataHost: string | null) {
  if (!dataHost) return undefined;

  const [dataType, dataId, anchor] = dataHost.split(':');
  return {
    type: dataType,
    id: parseInt(dataId),
    anchor: anchor as PAnchorType
  };
}
