import React, { useState, createContext } from 'react';
import PropTypes from 'prop-types';

export const UserContext = createContext({});

const Provider = ({ children }) => {
  const [user, setUser] = useState({ assos: [] });

  return (
    <UserContext.Provider
      value={{
        user,
        loadUser: (currentValue) => {
          setUser(currentValue);
        },
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

Provider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Provider;
