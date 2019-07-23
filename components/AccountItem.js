import React, { Component } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import moment from 'moment';
import * as _ from 'lodash';

import { Types } from '../constants/Types';
import { currency } from '../helpers/Number';

export class AccountItem extends Component {
  constructor() {
    super();
    this.state = { dx: 0 };
    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: _.stubFalse,
      onStartShouldSetPanResponderCapture: _.stubFalse,
      onMoveShouldSetPanResponder: _.stubTrue,
      onMoveShouldSetPanResponderCapture: _.stubTrue,

      onPanResponderGrant: _.noop,
      onPanResponderMove: (evt, { dx }) => {
        if (-dx > 10) {
          this.setState({ dx: _.min([_.max([0, -dx]), 200]) });
        }
      },
      onPanResponderTerminationRequest: _.stubTrue,
      onPanResponderRelease: (evt, { dx }) => {
        this.setState({ dx: 0 });
        if (-dx >= 200) {
          this.props.onDelete();
        }
      },
      onPanResponderTerminate: _.noop,
      onShouldBlockNativeResponder: _.stubTrue,
    });
  }

  render() {
    const { item, index } = this.props;
    const { dx } = this.state;
    const offset = dx > 100 ? 100 + (dx - 100) * 0.3 : dx;
    const accountStyle = { marginLeft: -offset };
    const deleteStyle = { width: offset };
    const typeStyle = { backgroundColor: _.find(Types, { value: item.type }).color };
    return (
      <View style={styles.container}>
        <View style={[styles.account, accountStyle]}>
          <View style={[styles.accountType, typeStyle]}>
            <Text style={styles.accountTypeText}>{item.type}</Text>
          </View>
          <View style={[styles.accountDetail, index === 0 && styles.firstAccountDetail]}>
            <View style={styles.accountInfo}>
              <Text>子类: {item.sub_type}</Text>
              <Text>商家: {item.merchant}</Text>
              <Text>备注: {item.comments}</Text>
              <Text style={styles.accountUsername}>{item.username}</Text>
              <Text style={styles.accountDatetime}>{moment(item.datetime).format('YYYY-MM-DD HH:mm')}</Text>
            </View>
            <View style={styles.accountChange} {...this._panResponder.panHandlers}>
              <Text style={styles.accountChangeText}>-{currency(item.change)}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.accountDelete, deleteStyle]}>
          <Text style={styles.accountDeleteText}>删除</Text>
        </View>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  account: {
    flexGrow: 1,
    flexDirection: 'row',
  },
  accountType: {
    width: 38,
    height: 38,
    padding: 10,
    marginTop: 12,
    marginLeft: 15,
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
    paddingRight: 15,
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
  accountChange: {
    width: 80,
    alignItems: 'flex-end',
  },
  accountChangeText: {
    fontSize: 18,
    color: '#e84522',
  },
  accountUsername: {
    paddingTop: 4,
    fontSize: 14,
    color: '#9d9d9d',
  },
  accountDatetime: {
    fontSize: 12,
    color: '#9d9d9d',
  },
  accountDelete: {
    justifyContent: 'center',
    backgroundColor: '#fe0042',
  },
  accountDeleteText: {
    width: 60,
    color: '#fff',
    fontSize: 24,
    marginLeft: 30,
  }
});
