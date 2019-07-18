import React, { Component } from 'react';
import { Button, StyleSheet, View, Text, TextInput, Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RNPickerSelect, { defaultStyles } from 'react-native-picker-select';
import DatePicker from 'react-native-datepicker'
import Spinner from 'react-native-loading-spinner-overlay';
import DropdownAlert from 'react-native-dropdownalert';
import Toast from 'react-native-root-toast';
import moment from 'moment';

import banner from '../assets/images/banner.gif';
import Layout from '../constants/Layout';
import { Types, SubTypes } from '../constants/Types';
import Environment from '../constants/Environment';

const initAccount = () => ({
  type: '吃吃吃',
  sub_type: '无',
  change: null,
  merchant: null,
  datetime: new Date(),
  comments: null,
});

export default class KeepAccountScreen extends Component {
  constructor() {
    super();
    this.state = {
      account: initAccount(),
      spinner: false,
      subTypes: SubTypes.吃吃吃,
    };
  }

  componentDidMount() {
    this.didFocusSubscription = this.props.navigation.addListener('didFocus', () => {
      this.setState({ account: initAccount() });
    });
  }

  componentWillUnmount() {
    this.didFocusSubscription.remove();
  }

  submit() {
    if (this.state.account.change <= 0) {
      Toast.show('输入金额', {
        duration: 300,
        position: Toast.positions.CENTER,
        shadow: false,
        animation: true,
        hideOnPress: true,
        backgroundColor: 'rgba(203, 0, 53, 0.3)',
        textColor: '#e84522',
        delay: 0,
      });
      return;
    }

    this.setState({ spinner: true }, () => {
      fetch(`${Environment.host}/accounts.json`, {
        method: 'post',
        body: JSON.stringify({
          ...this.state.account,
          datetime: moment(this.state.account.datetime).toISOString(),
        }),
      }).then(response => response.json())
        .then(() => {
          this.dropDownAlert.alertWithType('success', '保存成功', '');
          this.setState({ account: initAccount(), spinner: false });
        })
        .catch(() => {
          this.dropDownAlert.alertWithType('error', '保存失败', '');
          this.setState({ spinner: false });
        });
    });
  }

  updateAccount(account) {
    const updates = {
      account: { ...this.state.account, ...account },
    };
    if (account.type) {
      updates.account.sub_type = initAccount().sub_type;
      updates.subTypes = SubTypes[account.type];
    }
    this.setState(updates);
  }

  render() {
    const bannerSize = { width: Layout.window.width, height: (Layout.window.width / 200) * 113 };
    return (
      <View style={styles.container}>
        <Spinner textContent="发送中..."
                 visible={this.state.spinner}
                 textStyle={styles.spinnerTextStyle} />
        <KeyboardAwareScrollView style={styles.container}
                                 contentContainerStyle={styles.contentContainer}
                                 bounces={false}>
          <View style={styles.banner}>
            <Image source={banner} style={[styles.bannerImage, bannerSize]} />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>种类</Text>
            <RNPickerSelect items={Types}
                            placeholder={{}}
                            onValueChange={type => this.updateAccount({ type })}
                            style={pickerSelectStyles}
                            value={this.state.account.type} />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>子类</Text>
            <RNPickerSelect items={this.state.subTypes}
                            placeholder={{}}
                            onValueChange={sub_type => this.updateAccount({ sub_type })}
                            style={pickerSelectStyles}
                            value={this.state.account.sub_type} />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>金额</Text>
            <TextInput style={styles.fieldControl}
                       value={`${this.state.account.change || ''}`}
                       onChangeText={change => this.updateAccount({ change })}
                       keyboardType="numeric"
                       placeholder="输入金额" />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>商家</Text>
            <TextInput style={styles.fieldControl}
                       value={this.state.account.merchant}
                       onChangeText={merchant => this.updateAccount({ merchant })}
                       placeholder="无" />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>时间</Text>
            <DatePicker
              style={styles.datetimePicker}
              date={this.state.account.datetime}
              mode="datetime"
              format="YYYY-MM-DD HH:mm"
              confirmBtnText="确定"
              cancelBtnText="取消"
              customStyles={{
                dateTouchBody: {
                  height: 20,
                },
                dateInput: {
                  height: 20,
                  borderWidth: 0,
                  alignItems: 'flex-start',
                }
              }}
              showIcon={false}
              minuteInterval={1}
              onDateChange={(datetime) => {this.updateAccount({ datetime });}}
            />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>备注</Text>
            <TextInput style={styles.fieldControl}
                       value={this.state.account.comments}
                       onChangeText={comments => this.updateAccount({ comments })}
                       placeholder="无" />
          </View>
          <Button
            onPress={() => this.submit()}
            title="提交"
            color="#00adef"
          />
        </KeyboardAwareScrollView>
        <DropdownAlert ref={ref => this.dropDownAlert = ref} />
      </View>
    );
  }
}

KeepAccountScreen.navigationOptions = {
  title: '开始记账',
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
  banner: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  bannerImage: {
    flex: 1,
    resizeMode: 'contain'
  },
  fieldRow: {
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldLabel: {
    color: '#566979',
    marginRight: 10,
  },
  fieldControl: {
    width: 200,
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: 'gray',
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  datetimePicker: {
    width: 200,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: 'gray',
    paddingRight: 30,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    width: 200,
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: 'gray',
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});
