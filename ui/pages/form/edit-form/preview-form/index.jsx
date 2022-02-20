/* eslint-disable react-hooks/exhaustive-deps */
import { useLayoutEffect, useState } from 'react';
import styles from './PreviewForm.module.scss';
import Header from '../../../../components/Elements/Header';
import FullName from '../../../../components/Elements/FullName';
import Email from '../../../../components/Elements/Email';
import Address from '../../../../components/Elements/Address';
import Phone from '../../../../components/Elements/Phone';
import DatePicker from '../../../../components/Elements/DatePicker';
import ShortText from '../../../../components/Elements/ShortText';
import LongText from '../../../../components/Elements/LongText';
import Time from '../../../../components/Elements/Time';
import StarRating from '../../../../components/Elements/StarRating';
import SingleChoice from '../../../../components/Elements/SingleChoice';
import MultiChoice from '../../../../components/Elements/MultiChoice';
import FillBlank from '../../../../components/Elements/FillBlank';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';

const PreviewForm = () => {
    const wallet = useSelector((state) => state.wallet);
    const router = useRouter();
    const { query } = router;
    let forms = JSON.parse(localStorage.getItem('myForms'));
    forms = [
        {
            id: 'welcome',
            type: 2,
            label: 'Welcome',
            defaultValue: {
                title: ['Welcome', 'Please fill out and submit this form.'],
                meta: [],
                isRequired: false,
            },
        },
        ...forms,
        {
            id: 'thanks',
            type: 2,
            label: 'Thanks',
            defaultValue: {
                title: ['Thank You!', 'Your submission has been received.'],
                meta: [],
                isRequired: false,
            },
        },
    ];

    const [activeIndex, setActiveIndex] = useState(0);

    const renderElement = (el, index) => {
        const { type, id, defaultValue } = el;

        switch (id) {
            case 'welcome':
                return renderWelcome(el);
            case 'thanks':
                return renderThanks(el);
            case 'header':
                return <Header />;
            case 'fullName':
                return <FullName index={index} elType={type} type={'preview'} defaultValue={defaultValue} />;
            case 'email':
                return <Email index={index} elType={type} type={'preview'} defaultValue={defaultValue} />;
            case 'address':
                return <Address index={index} elType={type} type={'preview'} defaultValue={defaultValue} />;
            case 'phone':
                return <Phone index={index} elType={type} type={'preview'} defaultValue={defaultValue} />;
            case 'datePicker':
                return <DatePicker index={index} elType={type} type={'preview'} defaultValue={defaultValue} />;
            case 'shortText':
                return <ShortText index={index} elType={type} type={'preview'} defaultValue={defaultValue} />;
            case 'longText':
                return <LongText index={index} elType={type} type={'preview'} defaultValue={defaultValue} />;
            case 'time':
                return <Time index={index} elType={type} type={'preview'} defaultValue={defaultValue} />;
            case 'rating':
                return <StarRating index={index} elType={type} type={'preview'} defaultValue={defaultValue} />;
            case 'singleChoice':
                return <SingleChoice index={index} elType={type} type={'preview'} defaultValue={defaultValue} />;
            case 'multiChoice':
                return <MultiChoice index={index} elType={type} type={'preview'} defaultValue={defaultValue} />;
            case 'fillBlank':
                return <FillBlank index={index} elType={type} type={'preview'} defaultValue={defaultValue} />;

            default:
                break;
        }
    };

    useLayoutEffect(() => {
        onGetFormDetail();
    }, []);

    const onGetFormDetail = () => {
        const { contract, walletConnection } = wallet;
        const { id } = query;
        let content = '';
        if (id === null || id === '' || typeof id === 'undefined') {
            content = 'Could not found any object have that id!';
            const encoded_content = encodeURIComponent(content);
            router.push(`/error?content=${encoded_content}`);
        }

        contract
            ?.get_form_status?.({
                formId: id,
            })
            .then((res) => {
                if (res) {
                    const userId = walletConnection.getAccountId();
                    if (userId !== res?.owner) {
                        content = 'You do not have permssion to edit this form!';
                    }

                    if (content !== '') {
                        const encoded_content = encodeURIComponent(content);
                        router.push(`/error?content=${encoded_content}`);
                    }

                    // onGetElements({ total: res });
                }
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const renderWelcome = (el) => {
        const { defaultValue } = el;
        return (
            <>
                <div className={styles.welcome_title}>{defaultValue.title[0]}</div>
                <div className={styles.welcome_text}>{defaultValue.title[1]}</div>
                <div className={styles.welcome_button} onClick={onNextClick}>
                    Start <ArrowForwardOutlinedIcon className={styles.icon_next} />
                </div>
            </>
        );
    };

    const renderThanks = (el) => {
        const { defaultValue } = el;
        return (
            <>
                <div className={styles.welcome_title}>{defaultValue.title[0]}</div>
                <div className={styles.welcome_text}>{defaultValue.title[1]}</div>
            </>
        );
    };

    const onNextClick = () => {
        setActiveIndex(activeIndex + 1 > forms.length - 1 ? forms.length - 1 : activeIndex + 1);
    };

    const onPrevClick = () => {
        setActiveIndex(activeIndex - 1 > 0 ? activeIndex - 1 : 0);
    };

    return (
        <div className={styles.root}>
            <div className={styles.content}>
                {forms.map((item, index) => {
                    if (index !== activeIndex) {
                        return null;
                    }
                    return (
                        <div className={styles.element_content} key={index}>
                            {renderElement(item, index)}
                            {item.id !== 'welcome' && item.id !== 'thanks' && (
                                <div className={styles.button_submit}>
                                    {index > 1 && (
                                        <div className={styles.button_prev} onClick={onPrevClick}>
                                            <ArrowBackOutlinedIcon className={styles.icon_prev} />
                                            Previous
                                        </div>
                                    )}
                                    <div
                                        className={styles.button_next}
                                        style={index === 1 ? { borderBottomLeftRadius: 24, justifyContent: 'center' } : null}
                                        onClick={onNextClick}
                                    >
                                        {index < forms.length - 2 ? 'Next' : 'Submit'} <ArrowForwardOutlinedIcon className={styles.icon_next} />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PreviewForm;
