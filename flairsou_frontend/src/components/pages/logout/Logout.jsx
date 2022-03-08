import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';

const Logout = () => {
  const [content, setContent] = useState(null);

  useEffect(() => {
    if (content === null) {
      fetch('${process.env.BASE_URL}oauth/logout').then(() => setContent(<Redirect to="/" />));
    }
  }, [content]);

  if (content === null) {
    return <></>;
  }
  return content;
};

export default Logout;
