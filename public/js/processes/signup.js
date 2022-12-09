/* eslint-disable */
import { showAlert } from '../utils/alerts';
import axios from 'axios';

export const signup = async (
  name,
  email,
  password,
  passwordConfirm
) => {
  try {
    const results = await axios({
      method: 'post',
      url: 'http://127.0.0.1:8000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    if (results.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

/* document
  .querySelector('#register')
  .addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm =
      document.getElementById('passwordConfirm').value;

    signup(name, email, password, passwordConfirm);
  }); */
