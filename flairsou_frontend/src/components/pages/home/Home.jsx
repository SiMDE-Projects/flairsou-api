import React, { memo } from 'react';
import ContentWrapper from '../../UI/organisms/ContentWrapper/ContentWrapper';
import HomeContent from '../../UI/organisms/HomeContent/HomeContent';

const Home = () => (
  <ContentWrapper content={<HomeContent />} />
);

export default memo(Home);
