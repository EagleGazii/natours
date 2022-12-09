/* eslint-disable */
import { Component } from 'react';
class Header extends Component {
  render() {
    return (
      <header class="header">
        <nav class="navnav--tours">
          <a class="nav__el" href="/">
            All tours{' '}
          </a>
        </nav>

        <div class="header__logo">
          <img src="/img/logo-white.png" alt="Natours logo" />
        </div>
        <nav class="nav nav--user">
          <a class="nav__el" href="/login">
            Log in
          </a>
          <a class="nav__el nav__el--cta" href="/signup">
            Sign up
          </a>
        </nav>
      </header>
    );
  }
}

export default Header;
