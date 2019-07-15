import React, { Component } from 'react';
import { KeyboardAvoidingView, Button, ScrollView, StyleSheet, View, Text, TextInput, Image, Dimensions } from 'react-native';
import RNPickerSelect, { defaultStyles } from 'react-native-picker-select';
import DatePicker from 'react-native-datepicker'

import banner from '../assets/images/banner.gif';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
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
    paddingVertical: 18,
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

export default class KeepAccountScreen extends Component {
  constructor() {
    super();
    this.state = {
      type: 'eating',
      sub_type: null,
      change: null,
      merchant: null,
      datetime: new Date(),
      comments: null,
    };
    this.contentHeight = null;
    this.dimensionWidth = Dimensions.get('window').width;
  }

  submit() {
    if (this.state.change > 0) {
      fetch(`${Expo.Constants.manifest.extra.host}/accounts.json`, {
        method: 'post',
        body: JSON.stringify(this.state),
      }).then(() => this.setState({

        type: 'eating',
        sub_type: null,
        change: null,
        merchant: null,
        datetime: new Date(),
        comments: null,
      }));
    }
  }

  adjustScroll({ layout }) {
    if (this.contentHeight) {
      this.scrollView.scrollTo({ y: this.contentHeight - layout.height });
    } else {
      this.contentHeight = layout.height;
    }
  }

  render() {
    const bannerSize = { width: this.dimensionWidth, height: (this.dimensionWidth / 200) * 113 };
    return (
      <KeyboardAvoidingView style={styles.container} behavior="height">
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
                            onValueChange={type => this.setState({ type })}
                            style={pickerSelectStyles}
                            value={this.state.type} />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>子类</Text>
            <TextInput style={styles.fieldControl}
                       value={this.state.sub_type}
                       onChangeText={sub_type => this.setState({ sub_type })}
                       placeholder="无" />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>金额</Text>
            <TextInput style={styles.fieldControl}
                       value={`${this.state.change || ''}`}
                       onChangeText={change => this.setState({ change })}
                       keyboardType="numeric"
                       placeholder="输入金额" />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>商家</Text>
            <TextInput style={styles.fieldControl}
                       value={this.state.merchant}
                       onChangeText={merchant => this.setState({ merchant })}
                       placeholder="无" />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>时间</Text>
            <DatePicker
              style={styles.datetimePicker}
              date={this.state.datetime}
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
              onDateChange={(datetime) => {this.setState({ datetime });}}
            />
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>备注</Text>
            <TextInput style={styles.fieldControl}
                       value={this.state.comments}
                       onChangeText={comments => this.setState({ comments })}
                       placeholder="无" />
          </View>
          <Button
            onPress={() => this.submit()}
            title="提交"
            color="#00adef"
          />
          <View styles={{height: this.state.offset}} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

KeepAccountScreen.navigationOptions = {
  title: '开始记账',
};
