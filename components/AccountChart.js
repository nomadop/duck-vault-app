import React, { Component } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryTheme } from 'victory-native';
import { chunk, flow, join, map, reverse, split, takeRight } from 'lodash/fp';
import Carousel from 'react-native-snap-carousel';
import * as PropTypes from 'prop-types';
import * as _ from 'lodash';

import { currency } from '../helpers/Number';
import SwitchButton from './SwitchButton';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';

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
    if (this.props.accounts !== nextProps.accounts) {
      setTimeout(() => this.carousel.snapToItem(chunk(9)(nextProps.accounts).length - 1), 0);
    }

    return true;
  }

  renderChart = ({ item }) => {
    return (
      <VictoryChart height={270} width={Layout.window.width - 30} padding={30} theme={VictoryTheme.grayscale}>
        <VictoryBar data={item}
                    y="total"
                    x={({ title }) => flow(split('-'), takeRight(2), join('-'))(title)}
                    style={chartBarStyle}
                    labels={({ total }) => currency(total)}
        />
        <VictoryAxis style={axisStyle} fixLabelOverlap />
      </VictoryChart>
    )
  };

  renderArrow = (name, style, onPress) => {
    return this.carousel && (
      <TouchableOpacity style={[styles.carouselControl, style]} onPress={onPress}>
        <Ionicons name={name} size={16} color="#9b9b9b" />
      </TouchableOpacity>
    );
  };

  render() {
    const chartContainerStyle = { height: this.state.height };
    const data = flow(chunk(9), map(reverse), reverse)(this.props.accounts);
    const lastIndex = data.length - 1;
    return (
      <Animated.View style={[styles.chartContainer, chartContainerStyle]}>
        <SwitchButton defaultValue="month"
                      buttons={[{ title: '月', value: 'month' }, { title: '日', value: 'day' }]}
                      width={80} height={30} style={{ alignSelf: 'flex-start', marginLeft: 30, }}
                      onChange={this.props.onChangeType} />
        <Carousel data={data}
                  firstItem={lastIndex}
                  renderItem={this.renderChart}
                  ref={ref => this.carousel = ref}
                  itemWidth={Layout.window.width - 30}
                  sliderWidth={Layout.window.width}
        />
        {this.renderArrow('ios-arrow-back', { left: 0 }, () => this.carousel.snapToPrev())}
        {this.renderArrow('ios-arrow-forward', { right: 0 }, () => this.carousel.snapToNext())}
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
  carouselControl: {
    position: 'absolute',
    width: 26,
    height: 270,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
