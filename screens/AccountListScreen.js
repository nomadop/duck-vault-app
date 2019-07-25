import React, { Component } from 'react';
import { View, Text, SectionList, StyleSheet, ActivityIndicator } from 'react-native';
import DropdownAlert from 'react-native-dropdownalert';
import Spinner from 'react-native-loading-spinner-overlay';
import Search from 'react-native-search-box';
import Toast from "react-native-root-toast";
import * as _ from 'lodash';

import { AccountItem } from '../components/AccountItem';
import { requireLogin } from '../helpers/User';
import { currency } from '../helpers/Number';
import Environment from '../constants/Environment';
import Colors from '../constants/Colors';

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
    };
  }

  componentDidMount() {
    this.didFocusSubscription = this.props.navigation.addListener('didFocus', () => {
      this.sectionList && this.sectionList.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: false });
      this.refreshAccounts();
    });
  }

  componentWillUnmount() {
    this.didFocusSubscription.remove();
  }

  fetchAccounts(loadMore) {
    requireLogin().then(token => {
      this.setState({ refreshing: true });
      const { anchor, keyword } = this.state;
      const url = new URL(`${Environment.host}/accounts/section`);
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

  refreshAccounts(keyword = this.state.keyword) {
    this.setState({ anchor: null, endReached: false, keyword }, () => this.fetchAccounts(false));
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

  renderAccountList = (sections = this.state.accounts) => {
    return (
      <View style={styles.container}>
        <Search backgroundColor="#fff"
                cancelButtonTextStyle={styles.searchCancelText}
                onSearch={keyword => this.refreshAccounts(keyword)}
                onCancel={() => this.refreshAccounts(null)}/>
        <SectionList ref={ref => this.sectionList = ref}
                     style={styles.container}
                     renderItem={this.renderItem}
                     renderSectionHeader={this.renderSectionHeader}
                     sections={sections}
                     refreshing={this.state.refreshing}
                     onRefresh={() => this.refreshAccounts()}
                     onEndReached={() => this.loadMore()}
                     onEndReachedThreshold={0.5}
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
  searchCancelText: {
    color: '#9b9b9b',
  },
  itemSeparator: {
    marginLeft: 64,
    marginRight: 8,
    borderTopWidth: 1,
    borderColor: '#ccc',
  }
});
