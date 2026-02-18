import React, { useState, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import {
    View,
    Text,
    TextInput
} from 'react-native';
import styles from '../../views/stylesheet'


export const LabelTextInput = forwardRef(({
    label = "Label",
    placeholder = "Enter text...",
    onChangeText = "",
    value = {},
    keyboardType = "text",
}, ref) => {

    return (
        <>
            <View>
                <Text style={styles.smallText}>{label}</Text>

                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    onChangeText={onChangeText}
                    value={value}
                    keyboardType={keyboardType}
                />

            </View>
        </>
    );
});