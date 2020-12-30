import React from "react";
import { Text } from "react-konva";

class CenteredText extends React.Component {
  offsetX = 0;
  offsetY = 0;
  center() {
    this.offsetX = this.ref.textWidth / 2;
    this.offsetY = this.ref.textHeight / 2;
  }
  componentDidMount() {
    this.center();
  }
  componentDidUpdate() {
    this.center();
  }
  render() {
    return (
      <Text
        {...this.props}
        ref={(r) => (this.ref = r)}
        offsetX={this.offsetX}
        offsetY={this.offsetY}
      />
    );
  }
}

export default CenteredText;
