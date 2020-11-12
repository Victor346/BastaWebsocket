import React from 'react';
import ReactDOM from 'react-dom';

import Profile from './js/components/Profile';

const App = () => {
    return (
        <>
            <h1>This is the react app</h1>
            <Profile name="My Testing Name" />
        </>
    )
}

const appContainer = document.getElementById('react-app');
ReactDOM.render(<App />, appContainer);