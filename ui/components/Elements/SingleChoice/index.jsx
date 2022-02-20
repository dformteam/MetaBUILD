/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import styles from './SingleChoice.module.scss';
import RadioButtonCheckedOutlinedIcon from '@mui/icons-material/RadioButtonCheckedOutlined';
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import Switch from '@mui/material/Switch';

const SingleChoice = ({ index, onChange, defaultValue, type = '', error }) => {
    let initValue = {
        title: ['Type a question', 'Type your description'],
        meta: ['Type option 1', 'Type option 2', 'Type option 3', 'Type option 4'],
        isRequired: false,
    };

    if (typeof defaultValue !== 'undefined') {
        initValue = { ...defaultValue };
    }
    const [title, setTitle] = useState(initValue?.title?.[0] || 'Type a question');
    const [first_field, setFirstField] = useState(initValue?.title?.[1] || 'Type your description.');
    const [aAnswers, setAnswers] = useState(initValue?.meta);
    const [required, setRequired] = useState(initValue.isRequired || false);

    const onTitleChange = (e) => {
        setTitle(e.target.value);
        type === 'edit' &&
            onChange?.({
                index,
                title: [e.target.value, first_field],
                meta: [...aAnswers],
                isRequired: required,
            });
    };

    const onFirstFieldChange = (e) => {
        setFirstField(e.target.value);
        type === 'edit' &&
            onChange?.({
                index,
                title: [title, e.target.value],
                meta: [...aAnswers],
                isRequired: required,
            });
    };

    const onOptionChange = (value, indexz) => {
        let copyAnswers = [...aAnswers];
        copyAnswers[indexz].content = value;
        setAnswers(copyAnswers);
        // const metaAnswer = copyAnswers?.filter((x) => x.content !== '')?.map((x) => x.content);
        type === 'edit' &&
            onChange?.({
                index,
                title: [title, first_field],
                meta: [...copyAnswers],
                isRequired: required,
            });
    };

    const onAddOption = (e) => {
        let copyAnswers = [...aAnswers];
        copyAnswers.push({ id: aAnswers.length, placeholder: 'Type option ' + (aAnswers.length + 1), content: '', check: false });
        setAnswers(copyAnswers);
    };

    const onDeleteOption = (e, indexz) => {
        let copyAnswers = [...aAnswers];
        copyAnswers.splice(indexz, 1);
        // const metaAnswer = copyAnswers?.filter((x) => x.content !== '')?.map((x) => x.content);
        setAnswers([
            ...copyAnswers.map((x, aIndex) => {
                x.placeholder = 'Type option ' + (aIndex + 1);
                return x;
            }),
        ]);
        setAnswers(copyAnswers);
        type === 'edit' &&
            onChange?.({
                index,
                title: [title, first_field],
                meta: [...copyAnswers],
                isRequired: required,
            });
    };

    const onOptionClick = (item, indexx) => {
        if (type === 'answer') {
            const check = item.check;
            aAnswers?.map?.((answ) => {
                answ.check = false;
                return answ;
            });

            if (!check) {
                aAnswers[indexx].check = true;
            }
            // const choosen = aAnswers?.filter((x) => x.check).map((x) => x.content);
            setAnswers([...aAnswers]);
            onChange?.({
                index,
                title: [title, first_field],
                meta: [...aAnswers],
                isRequired: required,
            });
        }
    };

    const onFillValue = () => {
        setAnswers([
            ...(initValue?.meta?.map?.((mt, indexn) => {
                // const check = type === 'analysis' ? true : false;
                return {
                    id: indexn,
                    content: mt?.content,
                    check: mt.check,
                };
            }) || []),
        ]);
    };

    useEffect(() => {
        onFillValue();
    }, []);

    const onChangeRequired = (e) => {
        setRequired(e.target.checked);
        // const metaAnswer = aAnswers?.filter((x) => x.content !== '')?.map((x) => x.content);
        type === 'edit' &&
            onChange?.({
                index,
                title: [title],
                meta: [...aAnswers],
                isRequired: e.target.checked,
            });
    };

    return (
        <div className={styles.root_single_choice}>
            <div className={styles.single_choice_content}>
                {type === 'edit' ? (
                    <input
                        className={styles.single_choice_title}
                        value={title}
                        onChange={onTitleChange}
                        placeholder={'Type a title'}
                        disabled={type === 'edit' ? false : true}
                    />
                ) : (
                    <div className={styles.single_choice_title}>
                        {title} {required && <span>*</span>}
                    </div>
                )}
                {(type === 'edit' || first_field !== 'Type your description') && (
                    <input
                        className={styles.single_choice_description}
                        value={first_field}
                        onChange={onFirstFieldChange}
                        placeholder={'Type a description'}
                        disabled={type === 'edit' ? false : true}
                    />
                )}
                {type !== 'answer' && type !== 'analysis' && (
                    <div className={styles.single_choice_require}>
                        Question required: <Switch value={required} checked={required} onChange={onChangeRequired} />
                    </div>
                )}
                <div className={styles.single_choice}>
                    {aAnswers?.map?.((item, indexx) => {
                        return (
                            <div
                                className={indexx % 2 === 0 ? styles.single_choice_form_left : styles.single_choice_form_right}
                                key={indexx}
                                onClick={() => onOptionClick(item, indexx)}
                            >
                                {item.check ? (
                                    <RadioButtonCheckedOutlinedIcon
                                        className={indexx % 2 === 0 ? styles.single_choice_checked_left : styles.single_choice_checked_right}
                                    />
                                ) : (
                                    <RadioButtonUncheckedOutlinedIcon
                                        className={indexx % 2 === 0 ? styles.single_choice_checked_left : styles.single_choice_checked_right}
                                    />
                                )}
                                <input
                                    className={styles.single_choice_input}
                                    value={item.content}
                                    placeholder={item.placeholder}
                                    onChange={(e) => onOptionChange(e.target.value, indexx)}
                                />
                                {type === 'edit' && (
                                    <div
                                        className={indexx % 2 === 0 ? styles.single_choice_delete_left : styles.single_choice_delete_right}
                                        onClick={(e) => onDeleteOption(e, indexx)}
                                    >
                                        <DeleteOutlinedIcon className={styles.single_choice_delete_icon} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {type === 'edit' && (
                        <div className={styles.single_choice_form_add} onClick={onAddOption}>
                            <AddOutlinedIcon className={styles.single_choice_checked_left} />
                            <div className={styles.single_choice_add}>Add Option</div>
                        </div>
                    )}
                </div>
                {error !== '' && typeof error !== 'undefined' && <div className={styles.text_error}>{error}</div>}
            </div>
        </div>
    );
};

export default SingleChoice;
