import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import moment from 'moment';
import * as _ from 'lodash';

import { Types } from '../constants/Types';
import { currency } from '../helpers/Number';

const renderDeleteButton = onDelete => progress => {
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [120, 0],
  });
  const transform = { transform: [{ translateX }] };
  return (
    <Animated.View style={[transform, styles.swipeBackground]}>
      <RectButton style={styles.accountDelete} onPress={onDelete}>
        <Text style={styles.accountDeleteText}>删除</Text>
      </RectButton>
    </Animated.View>
  );
};

export function AccountItem(props) {
  const { item, index, onDelete } = props;
  const typeStyle = { backgroundColor: _.find(Types, { value: item.type }).color };
  return (
    <Swipeable friction={2}
               rightThreshold={60}
               overshootFriction={8}
               containerStyle={styles.swipeBackground}
               childrenContainerStyle={styles.container}
               renderRightActions={renderDeleteButton(onDelete)}>
      <View style={styles.account}>
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
          <View style={styles.accountChange}>
            <Text style={styles.accountChangeText}>-{currency(item.change)}</Text>
          </View>
        </View>
      </View>
    </Swipeable>
  );
}


const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  swipeBackground: {
    backgroundColor: '#fe0042',
  },
  account: {
    flexGrow: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
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
    flex: 1,
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountDeleteText: {
    color: '#fff',
    fontSize: 24,
  },
});
