import React, { Component } from 'react';
import { KeyboardAvoidingView, Button, ScrollView, StyleSheet, View, Text, TextInput, Image, Dimensions } from 'react-native';
import RNPickerSelect, { defaultStyles } from 'react-native-picker-select';
import DatePicker from 'react-native-datepicker'
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from 'react-native-root-toast';

import banner from '../assets/images/banner.gif';

const types = [
  {
    label: '吃吃吃',
    value: 'eating',
  },
  {
    label: '买买买',
    value: 'buying',
  },
];

const INIT_ACCOUNT = {
  type: 'eating',
  sub_type: null,
  change: null,
  merchant: null,
  datetime: new Date(),
  comments: null,
};

export default class KeepAccountScreen extends Component {
  constructor() {
    super();
    this.state = {
      account: INIT_ACCOUNT,
      spinner: false,
    };
    this.contentHeight = null;
    this.dimensionWidth = Dimensions.get('window').width;
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
      fetch(`http://192.168.1.120:4000/accounts.json`, {
        method: 'post',
        body: JSON.stringify(this.state.account),
      }).then(() => {
        Toast.show('保存成功', {
          duration: Toast.durations.SHORT,
          position: Toast.positions.CENTER,
          shadow: false,
          animation: true,
          hideOnPress: true,
          backgroundColor: 'rgba(0, 121, 169, 0.3)',
          textColor: '#00adef',
          delay: 0,
        });
        this.setState({ account: INIT_ACCOUNT, spinner: false });
      }).catch(() => {
        Toast.show('保存失败', {
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
    });
  }

  adjustScroll({ layout }) {
    if (this.contentHeight) {
      this.scrollView.scrollTo({ y: this.contentHeight - layout.height });
    } else {
      this.contentHeight = layout.height;
    }
  }

  updateAccount(updates) {
    this.setState({
      account: { ...this.state.account, ...updates },
    });
  }

  render() {
    const bannerSize = { width: this.dimensionWidth, height: (this.dimensionWidth / 200) * 113 };
    return (
      <KeyboardAvoidingView style={styles.container} behavior="height">
        <Spinner textContent="发送中..."
                 visible={this.state.spinner}
                 textStyle={styles.spinnerTextStyle} />
        <ScrollView style={styles.container}
                    contentContainerStyle={styles.contentContainer}
                    ref={component => this.scrollView = component}
                    onLayout={({ nativeEvent }) => this.adjustScroll(nativeEvent)}>
          <View style={styles.banner}>
            <Image source={banner} style={[styles.bannerImage, bannerSize]} />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>种类</Text>
            <RNPickerSelect items={types}
                            onValueChange={type => this.updateAccount({ type })}
                            style={pickerSelectStyles}
                            value={this.state.account.type} />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>子类</Text>
            <TextInput style={styles.fieldControl}
                       value={this.state.account.sub_type}
                       onChangeText={sub_type => this.updateAccount({ sub_type })}
                       placeholder="无" />
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
              minuteInterval={10}
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
        </ScrollView>
      </KeyboardAvoidingView>
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
