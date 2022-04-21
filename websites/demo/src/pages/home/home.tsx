import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage:React.FC = () => {
  return (
    <div className='px-4'>
      <h1 className='text-3xl my-4'>All Demos</h1>
      <div className='text-2xl'>
          <div className='m-2'>
            <Link 
              className=' block border rounded border-slate-100 p-5 shadow-md cursor-pointer'
              to="/todo/list"
            >
              🤖  My Todo
            </Link>
          </div>
          <div className='m-2'>
            <Link 
              className=' block border rounded border-slate-100 p-5 shadow-md cursor-pointer'
              to="/todo/list"
            >
              🔥 My Articles
            </Link>
          </div>
      </div>
    </div>
  )
}