import React, { Component } from 'react';
import { Animated, View, Text, SectionList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryTheme } from 'victory-native';
import { Ionicons } from '@expo/vector-icons';
import DropdownAlert from 'react-native-dropdownalert';
import Spinner from 'react-native-loading-spinner-overlay';
import Search from 'react-native-search-box';
import Toast from "react-native-root-toast";
import { flow, join, reverse, split, take, takeRight } from 'lodash/fp';
import * as _ from 'lodash';

import { AccountItem } from '../components/AccountItem';
import { requireLogin } from '../helpers/User';
import { currency } from '../helpers/Number';
import Environment from '../constants/Environment';
import Colors from '../constants/Colors';
import SwitchButton from '../components/SwitchButton';

function showSuccessToast() {
  Toast.show('载入完成', {
    duration: 300,
    position: Toast.positions.CENTER,
    shadow: false,
    animation: true,
    hideOnPress: true,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    delay: 0,
  });
}

function combineSections(prev, next) {
  if (_.isEmpty(prev)) {
    return next;
  }

  if (_.get(prev, `${prev.length - 1}.title`) === _.get(next, '0.title')) {
    const { data, title, total } = _.last(prev);
    const combinedSection = { title, total , data: data.concat(next[0].data) };
    return _.concat(_.initial(prev), combinedSection, _.tail(next));
  } else {
    return prev.concat(next);
  }
}

export default class AccountListScreen extends Component {
  constructor() {
    super();
    this.state = {
      anchor: null,
      keyword: null,
      accounts: null,
      endReached: false,
      refreshing: false,
      spinner: false,
      swipedItem: null,
      sectionType: 'month',
      chartContainerHeight: new Animated.Value(0),
    };
  }

  componentDidMount() {
    this.didFocusSubscription = this.props.navigation.addListener('didFocus', () => {
      this.refreshAccounts();
    });
  }

  componentWillUnmount() {
    this.didFocusSubscription.remove();
  }

  fetchAccounts(loadMore) {
    requireLogin().then(token => {
      this.setState({ refreshing: true });
      const { anchor, keyword, sectionType } = this.state;
      const url = new URL(`${Environment.host}/accounts/section`);
      url.searchParams.append('type', encodeURIComponent(sectionType));
      if (keyword) {
        url.searchParams.append('keyword', encodeURIComponent(keyword));
      }
      if (anchor) {
        url.searchParams.append('anchor', anchor);
      }
      fetch(url, { headers: { 'Authorization': token } })
        .then(response => response.json())
        .then(({ accounts, anchor, end_reached: endReached }) => {
          const sections = loadMore ? combineSections(this.state.accounts, accounts) : accounts;
          this.setState({ accounts: sections, anchor, endReached, refreshing: false }, () => {
            showSuccessToast();
            if (this.loadMoreAfterFetch) {
              this.loadMoreAfterFetch = false;
              this.fetchAccounts(true);
            }
          });
        })
        .catch(() => {
          this.dropDownAlert.alertWithType('error', '载入失败', '');
          this.setState({ refreshing: false });
        });
    });
  }

  deleteAccount(id) {
    requireLogin().then(token => {
      this.setState({ spinner: true });
      fetch(`${Environment.host}/accounts/${id}/inactive`, {
        method: 'post',
        headers: { 'Authorization': token },
      }).then(response => response.json())
        .then(() => {
          this.dropDownAlert.alertWithType('success', '删除成功', '');
          this.setState({ spinner: false });
          this.refreshAccounts();
        })
        .catch(() => {
          this.dropDownAlert.alertWithType('error', '删除失败', '');
          this.setState({ spinner: false });
        });
    });
  }

  refreshAccounts(keyword = this.state.keyword, sectionType = this.state.sectionType) {
    this.sectionList && this.sectionList.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: false });
    this.setState({ anchor: null, endReached: false, keyword, sectionType }, () => this.fetchAccounts(false));
  }

  loadMore = _.debounce(() => {
    if (this.state.endReached) {
      return;
    }

    if (this.state.refreshing) {
      return this.loadMoreAfterFetch = true;
    }

    this.fetchAccounts(true);
  }, 500);

  toggleChart = (chartOpened = !this.state.chartOpened) => {
    this.setState({ chartOpened }, () => {
      Animated.timing(this.state.chartContainerHeight, { toValue: chartOpened ? 300 : 0 }).start();
    });
  };

  renderItem = ({ item, index }) => {
    const swipeHandler = () => setTimeout(() => this.setState({ swipedItem: item.id }), 0);
    return (
      <AccountItem item={item}
                   index={index}
                   swipedItem={this.state.swipedItem}
                   onDelete={() => this.deleteAccount(item.id)}
                   onSwipe={swipeHandler}/>
    );
  };

  renderSectionHeader = ({ section }) => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
        <Text style={styles.sectionHeaderText}>总数：{currency(section.total)}</Text>
      </View>
    );
  };

  renderItemSeparator = () => <View style={styles.itemSeparator} />;

  renderListHeader = () => {
    const iconColor = this.state.chartOpened ? Colors.tintColor : '#ccc';
    return (
      <View style={styles.listHeader}>
        <View style={styles.searchContainer}>
          <Search placeholder="搜索"
                  backgroundColor="#fff"
                  cancelButtonTextStyle={styles.searchCancelText}
                  onSearch={keyword => this.refreshAccounts(keyword)}
                  onCancel={() => this.refreshAccounts(null)}/>
        </View>
        <TouchableOpacity onPress={() => this.toggleChart()}>
          <Ionicons name="ios-stats" color={iconColor} style={styles.listHeaderIcon} size={32} />
        </TouchableOpacity>
      </View>
    )
  };

  renderStatsChart = () => {
    const data = flow(take(9), reverse)(this.state.accounts);
    const chartContainerStyle = { height: this.state.chartContainerHeight };
    const chartBarStyle = {
      data: { fill: Colors.tintColor },
      labels: { fontSize: 10, fill: '#9b9b9b' }
    };
    const axisStyle = {
      axis: { stroke: '#ccc' },
      ticks: {stroke: "#ccc", size: 5},
      tickLabels: { fill: '#9b9b9b', padding: 3 },
    };
    return (
      <Animated.View style={[styles.chartContainer, chartContainerStyle]}>
        <SwitchButton defaultValue="month"
                      buttons={[{ title: '月', value: 'month' }, { title: '日', value: 'day' }]}
                      width={80} height={30} style={{ alignSelf: 'flex-start', marginLeft: 30, }}
                      onChange={sectionType => this.refreshAccounts(this.state.keyword, sectionType)} />
        { this.state.chartOpened && <VictoryChart height={270} padding={30} theme={VictoryTheme.grayscale}>
          <VictoryBar data={data}
                      y="total"
                      x={({ title }) => flow(split('-'), takeRight(2), join('-'))(title)}
                      style={chartBarStyle}
                      labels={({ total }) => currency(total)}
          />
          <VictoryAxis style={axisStyle} fixLabelOverlap />
        </VictoryChart> }
      </Animated.View>
    );
  };

  renderAccountList = (sections = this.state.accounts) => {
    return (
      <View style={styles.container}>
        {this.renderListHeader()}
        {this.renderStatsChart()}
        <SectionList ref={ref => this.sectionList = ref}
                     style={styles.container}
                     renderItem={this.renderItem}
                     renderSectionHeader={this.renderSectionHeader}
                     sections={sections}
                     refreshing={this.state.refreshing}
                     onRefresh={() => this.refreshAccounts()}
                     onEndReached={() => this.loadMore()}
                     onEndReachedThreshold={0.5}
                     onScrollBeginDrag={() => this.toggleChart(false)}
                     keyExtractor={_.property('id')}
                     ItemSeparatorComponent={this.renderItemSeparator}/>
      </View>
    );
  };

  renderContent = () => {
    return _.isEmpty(this.state.accounts) ?
      this.renderAccountList([{ title: '无记录', data: [], total: 0 }]) :
      this.renderAccountList();
  };

  renderEmpty = () => {
    return this.state.refreshing ? <ActivityIndicator style={styles.container} size="large" /> : <View />;
  };

  render() {
    const content = _.isNil(this.state.accounts) ? this.renderEmpty() : this.renderContent();
    return (
      <View style={styles.container}>
        <Spinner textContent="发送中..."
                 visible={this.state.spinner}
                 textStyle={styles.spinnerTextStyle} />
        {content}
        <DropdownAlert ref={ref => this.dropDownAlert = ref}
                       successColor={Colors.alertSuccessBackground}
                       errorColor={Colors.alertErrorBackground} />
      </View>
    )
  }
}

AccountListScreen.navigationOptions = {
  title: '查询账单',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  spinnerTextStyle: {
    color: '#eee',
    fontSize: 24,
  },
  sectionHeader: {
    height: 30,
    padding: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#eee',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  sectionHeaderText: {
    color: '#9b9b9b',
  },
  searchContainer: {
    flex: 1,
  },
  searchCancelText: {
    color: '#9b9b9b',
  },
  chartContainer: {
    overflow: 'hidden',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listHeaderIcon: {
    paddingTop: 4,
    paddingHorizontal: 4,
  },
  itemSeparator: {
    marginLeft: 64,
    marginRight: 8,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
});
