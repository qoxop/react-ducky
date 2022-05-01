import React, { useCallback, useState } from 'react';
import DatePicker from "react-datepicker";
import dayjs from 'dayjs';

import { TodoItem } from '../model';
import "react-datepicker/dist/react-datepicker.css";

const getEmptyItem = () => ({
  id: '',
  title: '',
  expired: '',
  finished: false,
});

export const TodoEditor: React.FC<{
  data?: TodoItem,
  update: (todo: TodoItem) => void,
  onCancel?: () => void,
}> = React.memo(({ data = getEmptyItem(), update, onCancel }) => {

  const [values, setValues] = useState(data || getEmptyItem());

  const onTitleChange = useCallback(e => {
    setValues(v => ({ ...v, title: e.target.value }));
  }, []);

  const onTimeChange = useCallback((date:Date) => {
    setValues(v => ({ ...v, expired: dayjs(date).format('YYYY-MM-DD') }));
  }, []);

  const onSave = () => {
    update({...data, ...values });
    setValues(getEmptyItem())
  };

  return (
    <div className='h-11 w-full flex flex-row flex-wrap' style={{borderWidth: 1}}>
      <div className='flex-1'>
        <input
          value={values.title}
          onChange={onTitleChange}
          placeholder='input here ~'
          className='inline-block h-full w-full text-left indent-4 outline-none'
        />
      </div>
      <div className='date-picker-wrapper' style={{borderLeftWidth: 1, borderRight: 1}}>
        <DatePicker
          selected={dayjs(values.expired || new Date()).toDate()}
          onChange={onTimeChange}
        />
      </div>
      <div className='px-1 flex items-center'>
        <div className='h-full pr-1' style={{borderLeftWidth: 1}}/>
        <button
          className='w-12 h-7 px-1 mx-1 rounded bg-primary text-white disabled:cursor-not-allowed'
          disabled={!values.title}
          onClick={onSave}
        >
          Save
        </button>
        {onCancel && <button className='w-16 h-7 px-1 mx-1 rounded bg-slate-100' onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  )
});