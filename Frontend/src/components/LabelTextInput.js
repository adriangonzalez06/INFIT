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
    darkMode = false,
}, ref) => {

    return (
        <>
            <View>
                <Text style={[styles.smallText, darkMode && { color: '#aaa' }]}>{label}</Text>

                <TextInput
                    style={[styles.input, darkMode && { backgroundColor: '#1e1e1e', borderColor: '#000', color: '#fff' }]}
                    placeholder={placeholder}
                    placeholderTextColor={darkMode ? "#666" : "#999"}
                    onChangeText={onChangeText}
                    value={value}
                    keyboardType={keyboardType}
                    maxLength={20}
                />

            </View>
        </>
    );
});