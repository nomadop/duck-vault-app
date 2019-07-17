import React, { Component } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import DropdownAlert from 'react-native-dropdownalert';
import Spinner from 'react-native-loading-spinner-overlay';
import * as _ from 'lodash';

import { AccountItem } from '../components/AccountItem';

export default class AccountListScreen extends Component {
  constructor() {
    super();
    this.state = { accounts: null, spinner: false };
  }

  componentDidMount() {
    this.didFocusSubscription = this.props.navigation.addListener('didFocus', () => this.fetchAccounts());
  }

  componentWillUnmount() {
    this.didFocusSubscription.remove();
  }

  fetchAccounts() {
    this.setState({ spinner: true });
    fetch(`${Expo.Constants.manifest.extra.host}/accounts/section`)
      .then(response => response.json())
      .then(accounts => this.setState({ accounts, spinner: false }))
      .catch(() => {
        this.dropDownAlert.alertWithType('error', '获取失败', '');
        this.setState({ spinner: false });
      });
  }

  deleteAccount(id) {
    this.setState({ spinner: true });
    fetch(`${Expo.Constants.manifest.extra.host}/accounts/${id}.json`, { method: 'delete' })
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
                     refreshing={this.state.spinner}
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
    return (
      <View styles={styles.container}>
      </View>
    );
  };

  render() {
    const content = _.isNil(this.state.accounts) ? this.renderEmpty() : this.renderContent();
    return (
      <View style={styles.container}>
        <Spinner textContent="获取记录..."
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
  contentContainer: {
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
    backgroundColor: '#ccc',
  },
  sectionHeaderText: {
    color: '#fff',
  },
});
