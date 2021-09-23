import React from 'react';
import { FilterType } from '../typings';

export function Filter(props: { 
    type: FilterType;
    onChange: (t: FilterType) => void;
}) {

    return (
        <div className="filter">
            <span>Filter:</span>
            <span
                className={props.type === 'all' ? 'active' : ''}
                onClick={() => props.onChange('all')}
            >
                all
            </span> |
            <span
                className={props.type === 'unfinished' ? 'active' : ''}
                onClick={() => props.onChange('unfinished')}
            >
                unfinished
            </span> | 
            <span
                className={props.type === 'finished' ? 'active' : ''}
                onClick={() => props.onChange('finished')}
            >
                finished
            </span>
        </div>
    )
}