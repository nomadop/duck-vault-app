import React, { Component } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryTheme } from 'victory-native';
import { flow, join, reverse, split, take, takeRight } from 'lodash/fp';
import * as PropTypes from 'prop-types';
import * as _ from 'lodash';

import { currency } from '../helpers/Number';
import SwitchButton from './SwitchButton';
import Colors from '../constants/Colors';

const chartBarStyle = {
  data: { fill: Colors.tintColor },
  labels: { fontSize: 10, fill: '#9b9b9b' }
};

const axisStyle = {
  axis: { stroke: '#ccc' },
  ticks: { stroke: "#ccc", size: 5 },
  tickLabels: { fill: '#9b9b9b', padding: 3 },
};

export class AccountChart extends Component {
  constructor(props) {
    super();
    this.state = {
      height: new Animated.Value(0),
      activeSection: _.last(props.section),
    }
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.opened !== nextProps.opened) {
      setTimeout(() => Animated.timing(this.state.height, { toValue: nextProps.opened ? 300 : 0 }).start(), 0);
    }

    return true;
  }

  renderChart() {
    const data = flow(take(9), reverse)(this.props.accounts);
    return (
      <VictoryChart height={270} padding={30} theme={VictoryTheme.grayscale}>
        <VictoryBar data={data}
                    y="total"
                    x={({ title }) => flow(split('-'), takeRight(2), join('-'))(title)}
                    style={chartBarStyle}
                    labels={({ total }) => currency(total)}
        />
        <VictoryAxis style={axisStyle} fixLabelOverlap />
      </VictoryChart>
    )
  }

  render() {
    const { opened, onChangeType } = this.props;
    const chartContainerStyle = { height: this.state.height };
    return (
      <Animated.View style={[styles.chartContainer, chartContainerStyle]}>
        <SwitchButton defaultValue="month"
                      buttons={[{ title: '月', value: 'month' }, { title: '日', value: 'day' }]}
                      width={80} height={30} style={{ alignSelf: 'flex-start', marginLeft: 30, }}
                      onChange={onChangeType} />
        {opened && this.renderChart()}
      </Animated.View>
    );
  }
}

AccountChart.propTypes = {
  opened: PropTypes.bool,
  accounts: PropTypes.array,
  onChangeType: PropTypes.func,
};

AccountChart.defaultProps = {
  onChangeType: _.noop,
};

const styles = StyleSheet.create({
  chartContainer: {
    overflow: 'hidden',
  },
});
