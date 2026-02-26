import React from 'react';
import { Section, SectionTitle, HeaderZoneBoy } from './style';
import OverviewNumbers from './components/overviewNumbers';

const Overview = () => {
  return (
    <Section>
      <HeaderZoneBoy>
        <SectionTitle>Overview</SectionTitle>
      </HeaderZoneBoy>
      <OverviewNumbers />
    </Section>
  );
};

export default Overview;
