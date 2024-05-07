import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import styles from './JournalForm.module.css';
import Button from '../Button/Button';
import cn from 'classnames';
import { INITIAL_STATE, formReducer } from './JornalForm.state';
import Input from '../Input/Input';
import { UserContext } from '../../context/user.context';

function JournalForm({onSubmit, data, onDelete}) {
	const [formState, dispatchForm] = useReducer(formReducer, INITIAL_STATE);
	const { isValid, isFormReadyToSubmit, values } = formState;

	const [formValidState, setFormValidState] = useState(INITIAL_STATE);

	const titleRef = useRef();
	const dateRef = useRef();
	const postRef = useRef();
	const { userId } = useContext(UserContext);

	const focusError = (isValid) => {
		switch(true) {
		case !isValid.title:
			titleRef.current.focus();
			break;
		case !isValid.date:
			dateRef.current.focus();
			break;
		case !isValid.post:
			postRef.current.focus();
			break;
		}
	};

	useEffect(() => {
		if (!data) {
			dispatchForm({type: 'CLEAR'});
			dispatchForm({ type: 'SET_VALUE', payload: {
				userId: userId
			}});
		}

		dispatchForm({ type: 'SET_VALUE', payload: {
			...data
		}});
	}, [data]);

	useEffect(() => {
		let timerId;

		if (!isValid.title || !isValid.post || !isValid.date) {
			focusError(isValid);
			timerId = setTimeout(() => {
				dispatchForm({type: 'RESET_VALIDITY'});
			}, 2000);
		}

		return () => {
			clearTimeout(timerId);
		};
	}, [isValid]);

	useEffect(() => {
		if (isFormReadyToSubmit) {
			onSubmit(values);
			dispatchForm({type: 'CLEAR'});
			dispatchForm({ type: 'SET_VALUE', payload: {
				userId: userId
			}});
		}
	}, [isFormReadyToSubmit, values, onSubmit, userId]);

	useEffect(() => {
		dispatchForm({ type: 'SET_VALUE', payload: {
			userId: userId
		}});
	}, [userId]);

	console.log(data);

	const onChange = (e) => {
		dispatchForm({ type: 'SET_VALUE', payload: {
			[e.target.name]: e.target.value
		}});
	};

	const addJournalItem = (e) => {
		e.preventDefault();

		dispatchForm({type: 'SUBMIT'});
	};

	const deleteJournalItem = () => {
		onDelete(data.id);
		dispatchForm({type: 'CLEAR'});
		dispatchForm({ type: 'SET_VALUE', payload: {
			userId: userId
		}});
	};

	return (
		<form className={styles['journal-form']} onSubmit={addJournalItem}>
			{userId}
			<div className={styles['form-row']}>
				<Input type="text" ref={titleRef} isValid={isValid.title} onChange={onChange} value={values.title} name='title' appearence='title'/>
				{data?.id && <button className={styles['delete']} type='button' onClick={deleteJournalItem}>
					<img src="./archive.svg" alt="" />
				</button>}
			</div>
			<div className={styles['form-row']}>
				<label htmlFor='date' className={styles['form-label']}>
					<img src="/calendar.svg" alt="Календарь" />
					<span>Дата</span>
				</label>
				<Input type='date' ref={dateRef} onChange={onChange} name='date' value={values.date ? new Date(values.date).toISOString().slice(0, 10) : ''} id="date" isValid={!isValid.title}/>
			</div>
			<div className={styles['form-row']}>
				<label htmlFor='tag' className={styles['form-label']}>
					<img src="/folder.svg" alt="Календарь" />
					<span>Метки</span>
				</label>
				<input type="text" name='tag' id="tag" className={styles['input']} />
			</div>
			<textarea onChange={onChange} ref={postRef} value={values.post} name="post" id="" cols="30" rows="10" className={cn(styles['input'], {
				[styles['invalid']]: !isValid.post
			})} ></textarea>
			<Button text="Сохранить"/>
		</form>
	);
}

export default JournalForm;