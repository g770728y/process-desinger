import * as React from 'react';
import styles from './styles.css';
import { DeleteFlag } from '../global';

type IProps = {
  x: number;
  y: number;
  flags?: any[] | null;
  onOk: (flag?: string) => void;
};

interface IState {
  value: string;
}

class EdgeFlagInput extends React.Component<IProps, IState> {
  state: IState = { value: '' };

  onChange = (e: React.ChangeEvent) => {
    this.setState({ value: (e.target as any).value.trim() });
  };

  onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      this.props.onOk(this.state.value);
    }
  };

  onSelect = (e: React.MouseEvent, flag: string) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.onOk(flag);
  };

  render() {
    const { value } = this.state;
    const { flags, x, y, onOk } = this.props;
    const flagsView =
      !!flags &&
      flags!.length > 0 &&
      [...flags, DeleteFlag].map(flag => (
        <div
          className={styles['list-item']}
          key={flag}
          onClick={e => this.onSelect(e, flag)}
        >
          {flag === DeleteFlag ? '删除' : flag}
        </div>
      ));

    const flagView = (!flags || flags.length === 0) && (
      <input
        className={styles['flag-input']}
        type="text"
        value={value}
        placeholder="输入状态码, 回车确认"
        onChange={this.onChange}
        onKeyDown={this.onKeyDown}
        onClick={e => e.stopPropagation()}
      />
    );

    return (
      <div className={styles.mask} onClick={() => onOk()}>
        <div className={styles.container} style={{ left: x, top: y }}>
          {flagsView}
          {flagView}
        </div>
        ;
      </div>
    );
  }
}

export default EdgeFlagInput;
