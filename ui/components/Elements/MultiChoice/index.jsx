import React, { useState } from 'react';
import styles from './MultiChoice.module.scss';
import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import Switch from '@mui/material/Switch';

const MultiChoice = ({ index, onChange, defaultValue, type = '', error }) => {
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
        // const metaAnswer = aAnswers?.filter((x) => x.content !== '')?.map((x) => x.content);
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

    const onAddOption = () => {
        let copyAnswers = [...aAnswers];
        copyAnswers.push({ content: '', placeholder: 'Type option ' + (aAnswers.length + 1), check: false });
        setAnswers(copyAnswers);
    };

    const onDeleteOption = (indexz) => {
        let copyAnswers = [...aAnswers];
        copyAnswers.splice(indexz, 1);
        setAnswers(copyAnswers);
        // const metaAnswer = copyAnswers?.filter((x) => x.content !== '')?.map((x) => x.content);
        setAnswers([
            ...copyAnswers.map((x, aIndex) => {
                x.placeholder = 'Type option ' + (aIndex + 1);
                return x;
            }),
        ]);
        type === 'edit' &&
            onChange?.({
                index,
                title: [title, first_field],
                meta: [...copyAnswers],
                isRequired: required,
            });
    };

    const onChangeRequired = (e) => {
        setRequired(e.target.checked);
        // const metaAnswer = aAnswers?.filter((x) => x.content !== '')?.map((x) => x.content);
        type === 'edit' &&
            onChange?.({
                index,
                title: [title, first_field],
                meta: [...aAnswers],
                isRequired: e.target.checked,
            });
    };

    const onOptionClick = (item, indexx) => {
        if (type === 'answer') {
            aAnswers[indexx].check = !aAnswers?.[indexx].check;
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

    return (
        <div className={styles.root_multi_choice}>
            <div className={styles.multi_choice_content}>
                {type === 'edit' ? (
                    <input className={styles.multi_choice_title} value={title} onChange={onTitleChange} placeholder={'Type a title'} />
                ) : (
                    <div className={styles.multi_choice_title}>
                        {title} {required && <span>*</span>}
                    </div>
                )}
                {(type === 'edit' || first_field !== 'Type your description') && (
                    <input
                        className={styles.multi_choice_description}
                        value={first_field}
                        onChange={onFirstFieldChange}
                        placeholder={'Type a description'}
                        disabled={type === 'edit' ? false : true}
                    />
                )}
                {type !== 'answer' && type !== 'analysis' && (
                    <div className={styles.multi_choice_require}>
                        Question required: <Switch value={required} checked={required} onChange={onChangeRequired} />
                    </div>
                )}
                <div className={styles.multi_choice}>
                    {aAnswers?.map?.((item, indexx) => {
                        return (
                            <div
                                className={indexx % 2 === 0 ? styles.multi_choice_form_left : styles.multi_choice_form_right}
                                key={indexx}
                                onClick={() => onOptionClick(item, indexx)}
                            >
                                {item.check ? (
                                    <CheckBoxOutlinedIcon className={indexx % 2 === 0 ? styles.multi_choice_checked_left : styles.multi_choice_checked_right} />
                                ) : (
                                    <CheckBoxOutlineBlankOutlinedIcon
                                        className={indexx % 2 === 0 ? styles.multi_choice_checked_left : styles.multi_choice_checked_right}
                                    />
                                )}
                                <input
                                    className={styles.multi_choice_input}
                                    value={item.content}
                                    placeholder={item.placeholder}
                                    onChange={(e) => onOptionChange(e.target.value, indexx)}
                                    disabled={type !== 'edit' ? true : false}
                                />
                                {type === 'edit' && (
                                    <div
                                        className={indexx % 2 === 0 ? styles.multi_choice_delete_left : styles.multi_choice_delete_right}
                                        onClick={() => onDeleteOption(indexx)}
                                    >
                                        <DeleteOutlinedIcon className={styles.multi_choice_delete_icon} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {type === 'edit' && (
                        <div className={styles.multi_choice_form_add} onClick={onAddOption} disabled={type !== 'edit' ? true : false}>
                            <AddOutlinedIcon className={styles.multi_choice_checked_left} />
                            <div className={styles.multi_choice_add}>Add Option</div>
                        </div>
                    )}
                </div>
                {error !== '' && typeof error !== 'undefined' && <div className={styles.text_error}>{error}</div>}
            </div>
        </div>
    );
};

export default MultiChoice;
