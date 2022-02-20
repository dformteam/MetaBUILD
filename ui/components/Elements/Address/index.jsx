/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import styles from './Address.module.scss';
import Switch from '@mui/material/Switch';

const Address = ({ index, onChange, defaultValue, type = '', error }) => {
    let initValue = {
        title: ['Address', 'Street Address', 'Street Address Line 2', 'City', 'State / Province', 'Postal / Zip Code'],
        meta: [],
        isRequired: false,
    };

    if (typeof defaultValue !== 'undefined') {
        initValue = { ...defaultValue };
    }

    const [title, setTitle] = useState(initValue?.title?.[0] || 'Address');
    const [first_field, setFirstField] = useState(initValue?.title?.[1] || 'Street Address');
    const [second_field, setSecondField] = useState(initValue?.title?.[2] || 'Street Address Line 2');
    const [third_field, setThirdField] = useState(initValue?.title?.[3] || 'City');
    const [fourth_field, setFourthField] = useState(initValue?.title?.[4] || 'State / Province');
    const [fifth_field, setFifthField] = useState(initValue?.title?.[5] || 'Postal / Zip Code');
    const [streetAddress, setStreetAddress] = useState('');
    const [streetLine2, setStreetLine2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postal, setPostal] = useState('');
    const [required, setRequired] = useState(initValue.isRequired || false);

    const onTitleChange = (e) => {
        setTitle(e.target.value);
        type === 'edit' &&
            onChange?.({
                index,
                title: [e.target.value, first_field, second_field, third_field, fourth_field, fifth_field],
                meta: [],
                isRequired: required,
            });
    };

    const onFirstFieldChange = (e) => {
        setFirstField(e.target.value);
        type === 'edit' &&
            onChange?.({
                index,
                title: [title, e.target.value, second_field, third_field, fourth_field, fifth_field],
                meta: [],
                isRequired: required,
            });
    };

    const onSecondFieldChange = (e) => {
        setSecondField(e.target.value);
        type === 'edit' &&
            onChange?.({
                index,
                title: [title, first_field, e.target.value, third_field, fourth_field, fifth_field],
                meta: [],
                isRequired: required,
            });
    };

    const onThirdFieldChange = (e) => {
        setThirdField(e.target.value);
        type === 'edit' &&
            onChange?.({
                index,
                title: [title, first_field, second_field, e.target.value, fourth_field, fifth_field],
                meta: [],
                isRequired: required,
            });
    };

    const onFourthFieldChange = (e) => {
        setFourthField(e.target.value);
        type === 'edit' &&
            onChange?.({
                index,
                title: [title, first_field, second_field, third_field, e.target.value, fifth_field],
                meta: [],
                isRequired: required,
            });
    };

    const onFifthFieldChange = (e) => {
        setFifthField(e.target.value);
        type === 'edit' &&
            onChange?.({
                index,
                title: [title, first_field, second_field, third_field, fourth_field, e.target.value],
                meta: [],
                isRequired: required,
            });
    };

    const onStreetChange = (e) => {
        setStreetAddress(e.target.value);
        type === 'answer' &&
            onChange?.({
                index,
                title: [title, first_field, second_field, third_field, fourth_field, fifth_field],
                meta: [e.target.value, streetLine2, city, state, postal],
                isRequired: required,
            });
    };

    const onStreet2Change = (e) => {
        setStreetLine2(e.target.value);
        type === 'answer' &&
            onChange?.({
                index,
                title: [title, first_field, second_field, third_field, fourth_field, fifth_field],
                meta: [streetAddress, e.target.value, city, state, postal],
                isRequired: required,
            });
    };

    const onCityChange = (e) => {
        setCity(e.target.value);
        type === 'answer' &&
            onChange?.({
                index,
                title: [title, first_field, second_field, third_field, fourth_field, fifth_field],
                meta: [streetAddress, streetLine2, e.target.value, state, postal],
                isRequired: required,
            });
    };

    const onStateChange = (e) => {
        setState(e.target.value);
        type === 'answer' &&
            onChange?.({
                index,
                title: [title, first_field, second_field, third_field, fourth_field, fifth_field],
                meta: [streetAddress, streetLine2, city, e.target.value, postal],
                isRequired: required,
            });
    };

    const onPostalChange = (e) => {
        setPostal(e.target.value);
        type === 'answer' &&
            onChange?.({
                index,
                title: [title, first_field, second_field, third_field, fourth_field, fifth_field],
                meta: [streetAddress, streetLine2, city, state, e.target.value],
                isRequired: required,
            });
    };

    const onFillValue = () => {
        if (type !== 'edit') {
            setStreetAddress(initValue?.meta?.[0] || '');
            setStreetLine2(initValue?.meta?.[1] || '');
            setCity(initValue?.meta?.[2] || '');
            setState(initValue?.meta?.[3] || '');
            setPostal(initValue?.meta?.[4] || '');
            setRequired(initValue?.isRequired || false);
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
                title: [title, first_field, second_field, third_field, fourth_field, fifth_field],
                meta: [],
                isRequired: e.target.checked,
            });
    };

    return (
        <div className={styles.root_address}>
            <div className={styles.address_content}>
                {type === 'edit' ? (
                    <input className={styles.address_title} value={title} onChange={onTitleChange} placeholder={'Type a title'} />
                ) : (
                    <div className={styles.address_title}>
                        {title} {required && <span>*</span>}
                    </div>
                )}
                {type !== 'answer' && type !== 'analysis'  && (
                    <div className={styles.address_require}>
                        Question required: <Switch value={required} checked={required} onChange={onChangeRequired} />
                    </div>
                )}
                <div className={styles.address}>
                    <div className={styles.address_form}>
                        <input
                            className={styles.address_label}
                            value={first_field}
                            onChange={onFirstFieldChange}
                            placeholder={'Type a field'}
                            disabled={type === 'edit' ? false : true}
                        />
                        <input className={styles.address_input} disabled={type === 'answer' ? false : true} value={streetAddress} onChange={onStreetChange} />
                    </div>
                    <div className={styles.address_form}>
                        <input
                            className={styles.address_label}
                            value={second_field}
                            onChange={onSecondFieldChange}
                            placeholder={'Type a field'}
                            disabled={type === 'edit' ? false : true}
                        />
                        <input className={styles.address_input} disabled={type === 'answer' ? false : true} value={streetLine2} onChange={onStreet2Change} />
                    </div>
                    <div className={styles.address_row}>
                        <div className={styles.address_form_left}>
                            <input
                                className={styles.address_label}
                                value={third_field}
                                onChange={onThirdFieldChange}
                                placeholder={'Type a field'}
                                disabled={type === 'edit' ? false : true}
                            />
                            <input className={styles.address_input} disabled={type === 'answer' ? false : true} value={city} onChange={onCityChange} />
                        </div>
                        <div className={styles.address_form_right}>
                            <input
                                className={styles.address_label}
                                value={fourth_field}
                                onChange={onFourthFieldChange}
                                placeholder={'Type a field'}
                                disabled={type === 'edit' ? false : true}
                            />
                            <input className={styles.address_input} disabled={type === 'answer' ? false : true} value={state} onChange={onStateChange} />
                        </div>
                    </div>
                    <div className={styles.address_row}>
                        <div className={styles.address_form_left}>
                            <input
                                className={styles.address_label}
                                value={fifth_field}
                                onChange={onFifthFieldChange}
                                placeholder={'Type a field'}
                                disabled={type === 'edit' ? false : true}
                            />
                            <input className={styles.address_input} disabled={type === 'answer' ? false : true} value={postal} onChange={onPostalChange} />
                        </div>
                        <div className={styles.address_form_right}></div>
                    </div>
                    {error !== '' && typeof error !== "undefined" && <div className={styles.text_error}>{error}</div>}
                </div>
            </div>
        </div>
    );
};

export default Address;
