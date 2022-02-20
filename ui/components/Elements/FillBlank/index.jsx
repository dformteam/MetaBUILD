import React, { useState } from 'react';
import styles from './FillBlank.module.scss';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import Switch from '@mui/material/Switch';

const FillBlank = ({ index, onChange, defaultValue, type = '' }) => {
    let initValue = {
        title: 'Type a question',
        meta: [],
    };

    if (typeof defaultValue !== 'undefined') {
        initValue = { ...defaultValue };
    }

    const [aInputs, setInputs] = useState([
        { type: 'label', content: 'This is a fill in the' },
        { type: 'input_text', content: 'Blank' },
        { type: 'label', content: 'field. Please add appropriate' },
        { type: 'input_text', content: 'Blank' },
    ]);

    const [title, setTitle] = useState(initValue?.title?.[0] || 'Type a question');
    const [required, setRequired] = useState(initValue.isRequired || false);
    const [error] = useState(initValue.error);

    const onTitleChange = (e) => {
        setTitle(e.target.value);
        type === 'edit' &&
            onChange?.({
                index,
                title: [e.target.value],
                meta: [],
                isRequired: required,
            });
    };

    const onChangeInput = (e, indexz) => {
        aInputs[indexz].content = e.currentTarget.textContent;
    };

    const onDeleteInput = (indexn) => {
        let copyInputs = [...aInputs];
        copyInputs.splice(indexn, 1);
        setInputs(copyInputs);
    };

    const onAddLabel = () => {
        let copyInputs = [...aInputs];
        copyInputs.push({ type: 'label', content: 'Label' });
        setInputs(copyInputs);
    };

    const onAddInput = () => {
        let copyInputs = [...aInputs];
        copyInputs.push({ type: 'input_text', content: 'Blanks' });
        setInputs(copyInputs);
    };

    const renderInput = (item, indexx) => {
        switch (item.type) {
            case 'label':
                return (
                    <>
                        <p
                            contentEditable={true}
                            onInput={(e) => onChangeInput(e, indexx)}
                            suppressContentEditableWarning={true}
                            className={styles.fill_blank_input_label}
                        >
                            {item.content}
                        </p>
                        <div className={styles.fill_blank_input_clear} onClick={() => onDeleteInput(indexx)}>
                            <ClearOutlinedIcon className={styles.fill_blank_input_icon} />
                        </div>
                    </>
                );

            case 'input_text':
                return (
                    <>
                        <span
                            contentEditable={true}
                            onInput={(e) => onChangeInput(e, index)}
                            suppressContentEditableWarning={true}
                            className={styles.fill_blank_input_fill}
                        >
                            {item.content}
                        </span>
                        <div className={styles.fill_blank_input_clear} onClick={() => onDeleteInput(index)}>
                            <ClearOutlinedIcon className={styles.fill_blank_input_icon} />
                        </div>
                    </>
                );

            default:
                break;
        }
    };

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
        <div className={styles.root_fill_blank}>
            <div className={styles.fill_blank_content}>
                {type === 'edit' ? (
                    <input className={styles.date_picker_title} value={title} onChange={onTitleChange} placeholder={'Type a title'} />
                ) : (
                    <div className={styles.date_picker_title}>
                        {title} {required && <span>*</span>}
                    </div>
                )}
                <input className={styles.fill_blank_description} placeholder={'Type a description'} disabled={type === 'edit' ? false : true} />
                {type === 'edit' && (
                    <div className={styles.fill_blank_require}>
                        Question required: <Switch value={required} checked={required} onChange={onChangeRequired} />
                    </div>
                )}
                <div className={styles.fill_blank}>
                    <div className={styles.fill_blank_form}>
                        {aInputs?.map?.((item, indexy) => {
                            return (
                                <div className={styles.fill_blank_input} key={indexy}>
                                    {renderInput(item, indexy)}
                                </div>
                            );
                        })}
                        {type === 'edit' && (
                            <span className={styles.fill_blank_add_label} onClick={onAddLabel}>
                                + Add label
                            </span>
                        )}
                        {type === 'edit' && (
                            <span className={styles.fill_blank_add_label} onClick={onAddInput}>
                                + Add input
                            </span>
                        )}
                    </div>
                </div>
                {error !== '' && typeof error !== "undefined" && <div className={styles.text_error}>{error}</div>}
            </div>
        </div>
    );
};

export default FillBlank;
