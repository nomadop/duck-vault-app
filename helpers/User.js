import * as SecureStore from 'expo-secure-store';
import Toast from "react-native-root-toast";

export const requireLogin = () => new Promise(resolve => {
  SecureStore.getItemAsync('userInfo')
    .then(userInfo => resolve(JSON.parse(userInfo).token))
    .catch(() => Toast.show('需要登录', {
      duration: 300,
      position: Toast.positions.CENTER,
      shadow: false,
      animation: true,
      hideOnPress: true,
      backgroundColor: 'rgba(203, 0, 53, 0.3)',
      textColor: '#e84522',
      delay: 0,
    }));
});