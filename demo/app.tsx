import React from "react";
import { Route, Routes, Link } from 'react-router-dom';

const A = () => {
  return <div>
    <h1>A page</h1>
    <p><Link to="/a" replace>replace self</Link></p>
    <p><Link to="/b" replace>replace b</Link></p>
    <p><Link to="/c" replace>replace c</Link></p>
    <p><Link to="/d" replace>replace d</Link></p>
    <hr />
    <p><Link to="/a">push self</Link></p>
    <p><Link to="/b">push b</Link></p>
    <p><Link to="/c">push c</Link></p>
    <p><Link to="/d">push d</Link></p>
  </div>
}
const B = () => {
  return <div>
    <h1>B page</h1>
    <p><Link to="/b" replace>replace self</Link></p>
    <p><Link to="/a" replace>replace a</Link></p>
    <p><Link to="/c" replace>replace c</Link></p>
    <p><Link to="/d" replace>replace d</Link></p>
    <hr />
    <p><Link to="/b">push self</Link></p>
    <p><Link to="/a">push a</Link></p>
    <p><Link to="/c">push c</Link></p>
    <p><Link to="/d">push d</Link></p>
  </div>
}

const C = () => {
  return <div>
    <h1>C page</h1>
    <p><Link to="/c" replace>replace self</Link></p>
    <p><Link to="/a" replace>replace a</Link></p>
    <p><Link to="/b" replace>replace b</Link></p>
    <p><Link to="/d" replace>replace d</Link></p>
    <hr />
    <p><Link to="/c">push self</Link></p>
    <p><Link to="/a">push a</Link></p>
    <p><Link to="/b">push b</Link></p>
    <p><Link to="/d">push d</Link></p>
  </div>
}
const D = () => {
  return <div>
    <h1>D page</h1>
    <p><Link to="/d" replace>replace self</Link></p>
    <p><Link to="/a" replace>replace a</Link></p>
    <p><Link to="/b" replace>replace b</Link></p>
    <p><Link to="/c" replace>replace c</Link></p>
    <hr />
    <p><Link to="/d">push self</Link></p>
    <p><Link to="/a">push a</Link></p>
    <p><Link to="/b">push b</Link></p>
    <p><Link to="/c">push c</Link></p>
  </div>
}

export const App = () => {
  return (
    <Routes>
      <Route path="/">
        <Route path="a" element={<A />} />
        <Route path="b" element={<B />}/>
        <Route path="c" element={<C />} />
        <Route path="d" element={<D />} />
        <Route path="" element={<A />} />
      </Route>
    </Routes>
  )
}

