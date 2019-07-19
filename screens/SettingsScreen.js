import React, { Component } from 'react';
import { Button, Image, KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import DropdownAlert from 'react-native-dropdownalert';
import Spinner from 'react-native-loading-spinner-overlay';

import Colors from '../constants/Colors';
import Environment from '../constants/Environment';
import Layout from '../constants/Layout';
import login from '../assets/images/login.png';
import avatar from '../assets/images/avatar.png';

export default class SettingsScreen extends Component {
  constructor() {
    super();
    this.state = { userInfo: null, password: '', spinner: false };
  }

  componentDidMount() {
    SecureStore.getItemAsync('userInfo').then(userInfo => this.setState({ userInfo: JSON.parse(userInfo) }))
  }

  login = () => {
    const formData = new FormData();
    formData.append('password', this.state.password);
    this.setState({ spinner: true });
    fetch(`${Environment.host}/authentication/login`, {
      method: 'post',
      body: formData,
    }).then(response => response.json())
      .then(userInfo => {
        SecureStore.setItemAsync('userInfo', JSON.stringify(userInfo));
        this.setState({ userInfo, spinner: false });
      })
      .catch(() => {
        this.dropDownAlert.alertWithType('error', '登录失败', '');
        this.setState({ spinner: false });
      });
  };

  logout = () => {
    SecureStore.deleteItemAsync('userInfo')
      .then(() => this.setState({ userInfo: null }))
      .catch(() => this.dropDownAlert.alertWithType('error', '登出失败', ''));
  };

  renderSettings = () => {
    return (
      <View style={[styles.container, styles.contentContainer]}>
        <Image source={avatar} />
        <Text style={styles.username}>{this.state.userInfo.username}</Text>
        <Button onPress={this.logout} title="登出" color="#00adef" />
      </View>
    );
  };

  renderLogin = () => {
    const bannerSize = { width: Layout.window.width, height: (Layout.window.width / 500) * 287 };
    return (
      <KeyboardAvoidingView style={styles.container} behavior="height">
        <Image source={login} style={[styles.bannerImage, bannerSize]} />
        <View style={styles.loginContainer}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>密码</Text>
            <TextInput style={styles.fieldControl}
                       value={this.state.password}
                       onChangeText={password => this.setState({ password })} />
          </View>
          <Button onPress={this.login} title="登录" color="#00adef" />
        </View>
      </KeyboardAvoidingView>
    )
  };

  render() {
    const content = this.state.userInfo ? this.renderSettings() : this.renderLogin();
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

SettingsScreen.navigationOptions = {
  title: '鸭子金库',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 80,
  },
  loginContainer: {
    marginTop: 15,
  },
  bannerImage: {
    resizeMode: 'contain'
  },
  username: {
    padding: 16,
    fontSize: 32,
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
});