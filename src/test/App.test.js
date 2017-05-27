import React from 'react';
import renderer from 'react-test-renderer';

import App from '../app';

it('renders without crashing', () => {
  const app = renderer.create(<App />);
  expect(app).toMatchSnapshot();
});
