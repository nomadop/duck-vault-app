import React, { Component } from 'react';
import { View, Text, SectionList, StyleSheet, ActivityIndicator } from 'react-native';
import DropdownAlert from 'react-native-dropdownalert';
import Spinner from 'react-native-loading-spinner-overlay';
import Search from 'react-native-search-box';
import * as _ from 'lodash';

import { AccountItem } from '../components/AccountItem';
import Environment from '../constants/Environment';
import Toast from "react-native-root-toast";
import Colors from '../constants/Colors';
import { requireLogin } from '../helpers/User';

export default class AccountListScreen extends Component {
  constructor() {
    super();
    this.state = { accounts: null, refreshing: false, spinner: false };
  }

  componentDidMount() {
    this.didFocusSubscription = this.props.navigation.addListener('didFocus', () => this.fetchAccounts());
  }

  componentWillUnmount() {
    this.didFocusSubscription.remove();
  }

  fetchAccounts(keyword = _.get(this.searchBox, 'state.keyword', null)) {
    requireLogin().then(token => {
      this.setState({ refreshing: true });
      let url = `${Environment.host}/accounts/section`;
      if (keyword) {
        url = `${url}?keyword=${encodeURIComponent(keyword)}`;
      }
      fetch(url, { headers: { 'Authorization': token } })
        .then(response => response.json())
        .then(accounts => {
          Toast.show('载入完成', {
            duration: 300,
            position: Toast.positions.CENTER,
            shadow: false,
            animation: true,
            hideOnPress: true,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            delay: 0,
          });
          this.setState({ accounts, refreshing: false });
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
          this.fetchAccounts();
        })
        .catch(() => {
          this.dropDownAlert.alertWithType('error', '删除失败', '');
          this.setState({ spinner: false });
        });
    });
  }

  renderItem = ({ item, index }) => {
    return <AccountItem item={item} index={index} onDelete={() => this.deleteAccount(item.id)} />
  };

  renderSectionHeader = ({ section }) => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
        <Text style={styles.sectionHeaderText}>总数：{section.total}</Text>
      </View>
    );
  };

  renderAccountList = (sections = this.state.accounts) => {
    return (
      <View style={styles.container}>
        <Search ref={ref => this.searchBox = ref}
                backgroundColor="#fff"
                cancelButtonTextStyle={styles.searchCancelText}
                onSearch={keyword => this.fetchAccounts(keyword)}
                onCancel={() => this.fetchAccounts(null)}/>
        <SectionList style={styles.container}
                     renderItem={this.renderItem}
                     renderSectionHeader={this.renderSectionHeader}
                     sections={sections}
                     refreshing={this.state.refreshing}
                     onRefresh={() => this.fetchAccounts()}
                     keyExtractor={_.property('id')} />
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
});
