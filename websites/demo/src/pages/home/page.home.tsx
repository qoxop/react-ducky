import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage:React.FC = () => {
  return (
    <div className='p-4 text-center'>
      <h1 className='text-2xl my-4 underline'>React-Ducky Demos</h1>
      <div className='text-2xl'>
          <div className='my-2'>
            <Link 
              className=' block border rounded border-slate-100 p-5 shadow-md cursor-pointer'
              to="/todo/list"
            >
              Todo Demo
            </Link>
          </div>
          <div className='my-2'>
            <Link 
              className=' block border rounded border-slate-100 p-5 shadow-md cursor-pointer'
              to="/article/list"
            >
              Articles Demo
            </Link>
          </div>
      </div>
    </div>
  )
}