import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as _ from 'lodash';

import Colors from '../constants/Colors';

function Button({ button, radius, first, last, active, setValue }) {
  const activeStyle = { backgroundColor: active ? Colors.tintColor : '#ccc' };
  const firstStyle = first && { borderTopLeftRadius: radius, borderBottomLeftRadius: radius, paddingLeft: radius / 2 };
  const lastStyle = last && { borderTopRightRadius: radius, borderBottomRightRadius: radius, paddingRight: radius / 2 };
  return (
    <TouchableOpacity style={[styles.button, activeStyle, firstStyle, lastStyle]} onPress={() => setValue(button.value)}>
      <Text style={styles.buttonText}>{button.title}</Text>
    </TouchableOpacity>
  )
}

export default function SwitchButton({ width, height, defaultValue, buttons, style, onChange }) {
  const containerSize = { width, height };
  const [value, setValue] = useState(defaultValue);
  useEffect(() => onChange(value), [value]);
  return (
    <View style={[styles.container, containerSize, style]}>
      {buttons.map((button, index) => (
        <Button key={button.value}
                button={button}
                active={button.value === value}
                radius={height / 2}
                first={index === 0}
                last={index === buttons.length - 1}
                setValue={setValue} />
      ))}
    </View>
  );
}

SwitchButton.defaultProps = {
  onChange: _.noop,
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 3,
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
  },
});
