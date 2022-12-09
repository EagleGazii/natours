/* eslint-disable */
import { Component } from 'react';
import { Footer } from './footer';
import { Header } from './header';
import { Card } from './card';

import axios from 'axios';
class Overview extends Component {
  render() {
    const results = axios({
      method: 'GET',
      url: 'http://127.0.0.1:8000/api/v1/tours',
    });
    console.log(results);

    return (
      <div>
        <Header />
        <main className="main">
          <div className="card-container"></div>
        </main>
        <Footer />
      </div>
    );
  }
}

export default Overview;
