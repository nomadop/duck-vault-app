import React, { Component } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import Toast from "react-native-root-toast";
import Spinner from 'react-native-loading-spinner-overlay';
import moment from 'moment';
import * as _ from 'lodash';

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
    fetch(`http://192.168.1.120:4000/accounts/section`)
      .then(response => response.json())
      .then(accounts => this.setState({ accounts, spinner: false }))
      .catch(() => {
        Toast.show('获取失败', {
          duration: Toast.durations.SHORT,
          position: Toast.positions.CENTER,
          shadow: false,
          animation: true,
          hideOnPress: true,
          backgroundColor: 'rgba(203, 0, 53, 0.3)',
          textColor: '#e84522',
          delay: 0,
        });
        this.setState({ spinner: false });
      });
  }

  renderItem({ item, index }) {
    return (
      <View style={styles.account}>
        <View style={styles.accountType}>
          <Text style={styles.accountTypeText}>{item.type}</Text>
        </View>
        <View style={[styles.accountDetail, index === 0 && styles.firstAccountDetail]}>
          <View style={styles.accountInfo}>
            <Text>子类: {item.sub_type}</Text>
            <Text>商家: {item.merchant}</Text>
            <Text>备注: {item.comments}</Text>
            <Text style={styles.accountDatetime}>{moment(item.datetime).format('YYYY-MM-DD HH:mm')}</Text>
          </View>
          <View style={styles.accountChange}>
            <Text style={styles.accountChangeText}>-{item.change}</Text>
          </View>
        </View>
      </View>
    );
  }

  renderSectionHeader({ section }) {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{section.title}</Text>
        <Text style={styles.sectionHeaderText}>总数：{section.total}</Text>
      </View>
    );
  }

  renderAccountList() {
    console.log(this.state.accounts);
    return (
      <View style={styles.container}>
        <Spinner textContent="获取记录..."
                 visible={this.state.spinner}
                 textStyle={styles.spinnerTextStyle} />
        <SectionList style={styles.container}
                     renderItem={this.renderItem}
                     renderSectionHeader={this.renderSectionHeader}
                     sections={this.state.accounts}
                     refreshing={this.state.spinner}
                     onRefresh={() => this.fetchAccounts()}
                     keyExtractor={_.property('id')} />
      </View>
    );
  }

  renderContent() {
    return _.isEmpty(this.state.accounts) ? this.renderEmpty() : this.renderAccountList();
  }

  renderEmpty() {
    return (
      <View styles={styles.container}>
        <Spinner textContent="获取记录..."
                 visible={this.state.spinner}
                 textStyle={styles.spinnerTextStyle} />
      </View>
    );
  }

  render() {
    return _.isNil(this.state.accounts) ? this.renderEmpty() : this.renderContent();
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
  account: {
    marginHorizontal: 15,
    flexDirection: 'row',
  },
  accountType: {
    width: 38,
    height: 38,
    padding: 10,
    marginTop: 12,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#9d9d9d',
  },
  accountTypeText: {
    fontSize: 18,
    color: '#fff',
  },
  accountDetail: {
    flexGrow: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  firstAccountDetail: {
    borderTopWidth: 0,
  },
  accountInfo: {
    flexGrow: 1,
  },
  accountChange: {},
  accountChangeText: {
    fontSize: 18,
    color: '#e84522',
  },
  accountDatetime: {
    paddingTop: 4,
    color: '#9d9d9d',
  }
});
