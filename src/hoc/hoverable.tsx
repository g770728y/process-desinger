import * as React from 'react';

export type HoverableProps = {
  _ref: React.RefObject<any>;
  hovered: boolean;
};

function hoverable<P>(
  WrappedComponent: React.ComponentType<P & HoverableProps>
) {
  return class HoverableComponent extends React.Component<P, any> {
    childRef = React.createRef<any>();

    state = { hovered: false };

    constructor(props: P) {
      super(props);
      this.handleMouseEnter = this.handleMouseEnter.bind(this);
      this.handleMouseLeave = this.handleMouseLeave.bind(this);
    }

    handleMouseEnter() {
      this.setState({ hovered: true });
    }

    handleMouseLeave() {
      this.setState({ hovered: false });
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          _ref={this.childRef}
          hovered={this.state.hovered}
        />
      );
    }

    componentDidMount() {
      const el = this.childRef.current! as HTMLElement;
      el.addEventListener('mouseenter', this.handleMouseEnter);
      el.addEventListener('mouseleave', this.handleMouseLeave);
    }

    componentWillUnmount() {
      const el = this.childRef.current! as HTMLElement;
      el.removeEventListener('mouseenter', this.handleMouseEnter);
      el.removeEventListener('mouseleave', this.handleMouseLeave);
    }
  };
}
export default hoverable;
