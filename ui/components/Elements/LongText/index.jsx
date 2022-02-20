/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import styles from './LongText.module.scss';
import Switch from '@mui/material/Switch';

const LongText = ({ index, onChange, defaultValue, type = '', error }) => {
    let initValue = {
        title: ['Type a question', 'Type your description'],
        meta: [],
        isRequired: false,
    };

    if (typeof defaultValue !== 'undefined') {
        initValue = { ...defaultValue };
    }

    const [title, setTitle] = useState(initValue?.title?.[0] || 'Type a question');
    const [first_field, setFirstField] = useState(initValue?.title?.[1] || 'Type your description.');
    const [text, setText] = useState('');
    const [required, setRequired] = useState(initValue.isRequired || false);

    const onTitleChange = (e) => {
        setTitle(e.target.value);
        type === 'edit' &&
            onChange?.({
                index,
                title: [e.target.value, first_field],
                meta: [],
                isRequired: required,
            });
    };

    const onFirstFieldChange = (e) => {
        setFirstField(e.target.value);
        type === 'edit' &&
            onChange?.({
                index,
                title: [title, e.target.value],
                meta: [],
                isRequired: required,
            });
    };

    const onTextChange = (e) => {
        setText(e.target.value);
        type === 'answer' &&
            onChange?.({
                index,
                title: [title, first_field],
                meta: [e.target.value],
                isRequired: required,
            });
    };

    const onFillValue = () => {
        if (type !== 'edit') {
            setText(initValue?.meta?.[0] || '');
        }
    };

    useEffect(() => {
        onFillValue();
    }, []);

    const onChangeRequired = (e) => {
        setRequired(e.target.checked);
        type === 'edit' &&
            onChange?.({
                index,
                title: [title],
                meta: [],
                isRequired: e.target.checked,
            });
    };

    return (
        <div className={styles.root_long_text}>
            <div className={styles.long_text_content}>
                {type === 'edit' ? (
                    <input className={styles.long_text_title} value={title} onChange={onTitleChange} placeholder={'Type a title'} />
                ) : (
                    <div className={styles.long_text_title}>
                        {title} {required && <span>*</span>}
                    </div>
                )}
                {(type === 'edit' || first_field !== 'Type your description') && (
                    <input
                        className={styles.long_text_description}
                        value={first_field}
                        onChange={onFirstFieldChange}
                        placeholder={'Type a description'}
                        disabled={type === 'edit' ? false : true}
                    />
                )}
                {type !== 'answer' && type !== 'analysis' && (
                    <div className={styles.long_text_require}>
                        Question required: <Switch value={required} checked={required} onChange={onChangeRequired} />
                    </div>
                )}
                <div className={styles.long_text}>
                    <div className={styles.long_text_form}>
                        <textarea className={styles.long_text_input} disabled={type === 'answer' ? false : true} value={text} onChange={onTextChange} />
                        {error !== '' && typeof error !== 'undefined' && <div className={styles.text_error}>{error}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LongText;
