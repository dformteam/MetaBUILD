/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import styles from './StarRating.module.scss';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import { Switch } from '@mui/material';

const StarRating = ({ index, onChange, defaultValue, type = '', error }) => {
    let initValue = {
        title: ['Type a question', 'Type your description'],
        meta: [],
        isRequired: false,
    };

    if (typeof defaultValue !== 'undefined') {
        initValue = { ...defaultValue };
    }

    const star = ['1', '2', '3', '4', '5'];
    const [title, setTitle] = useState(initValue?.title?.[0] || 'Type a question');
    const [first_field, setFirstField] = useState(initValue?.title?.[1] || 'Type your description.');
    const [active, setActive] = useState(null);
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
    const onStarClicked = (starx) => {
        setActive(starx);
        type === 'answer' &&
            onChange?.({
                index,
                title: [title, first_field],
                meta: [starx],
                isRequired: required,
            });
    };

    const onFillValue = () => {
        if (type !== 'edit') {
            setActive(initValue?.meta?.[0] || '0');
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
                title: [title, first_field],
                meta: [],
                isRequired: e.target.checked,
            });
    };

    return (
        <div className={styles.root_star_rating}>
            <div className={styles.star_rating_content}>
                {type === 'edit' ? (
                    <input
                        className={styles.star_rating_title}
                        value={title}
                        onChange={onTitleChange}
                        placeholder={'Type a title'}
                        disabled={type === 'edit' ? false : true}
                    />
                ) : (
                    <div className={styles.star_rating_title}>
                        {title} {required && <span>*</span>}
                    </div>
                )}
                {(type === 'edit' || first_field !== 'Type your description') && (
                    <input
                        className={styles.star_rating_description}
                        value={first_field}
                        onChange={onFirstFieldChange}
                        placeholder={'Type a description'}
                        disabled={type === 'edit' ? false : true}
                    />
                )}
                {type !== 'answer' && type !== 'analysis' && (
                    <div className={styles.rating_choicerequire}>
                        Question required: <Switch value={required} checked={required} onChange={onChangeRequired} />
                    </div>
                )}
                <div className={styles.star_rating}>
                    <div className={styles.star_rating_form}>
                        {star.map((item) => {
                            return (
                                <div
                                    onClick={() => onStarClicked(item)}
                                    className={item <= active ? styles.star_rating_active : styles.star_rating_item}
                                    key={item}
                                >
                                    <StarOutlinedIcon className={styles.star_rating_icon} />
                                    <div className={styles.star_rating_text}>{item}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div className={styles.star_rating_row}>
                        <input className={styles.star_rating_input} placeholder={'Type "Worst" text'} />
                        <input className={styles.star_rating_input} placeholder={'Type "Best" text'} />
                    </div>
                </div>
                {error !== '' && typeof error !== 'undefined' && <div className={styles.text_error}>{error}</div>}
            </div>
        </div>
    );
};

export default StarRating;
