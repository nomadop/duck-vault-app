import React, { Component } from 'react';
import { View, Text, SectionList, StyleSheet, ActivityIndicator } from 'react-native';
import DropdownAlert from 'react-native-dropdownalert';
import Spinner from 'react-native-loading-spinner-overlay';
import * as _ from 'lodash';

import { AccountItem } from '../components/AccountItem';
import Environment from '../constants/Environment';
import Toast from "react-native-root-toast";

export default class AccountListScreen extends Component {
  constructor() {
    super();
    this.state = { accounts: null, refreshing: false, spinner: false };
  }

  componentDidMount() {
    this.fetchAccounts();
  }

  fetchAccounts() {
    this.setState({ refreshing: true });
    fetch(`${Environment.host}/accounts/section`)
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
  }

  deleteAccount(id) {
    this.setState({ spinner: true });
    fetch(`${Environment.host}/accounts/${id}.json`, { method: 'delete' })
      .then(response => response.json())
      .then(accounts => {
        this.dropDownAlert.alertWithType('success', '删除成功', '');
        this.setState({ accounts, spinner: false });
      })
      .catch(() => {
        this.dropDownAlert.alertWithType('error', '删除失败', '');
        this.setState({ spinner: false });
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
    return <ActivityIndicator style={styles.container} size="large" />;
  };

  render() {
    const content = _.isNil(this.state.accounts) ? this.renderEmpty() : this.renderContent();
    return (
      <View style={styles.container}>
        <Spinner textContent="发送中..."
                 visible={this.state.spinner}
                 textStyle={styles.spinnerTextStyle} />
        {content}
        <DropdownAlert ref={ref => this.dropDownAlert = ref} />
      </View>
    )
  }
}

AccountListScreen.navigationOptions = {
  title: '查账',
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
});
