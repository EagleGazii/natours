/* eslint-disable */
import { showAlert } from '../utils/alerts';
import axios from 'axios';

export const updateData = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:8000/api/v1/users/updateMyPassword'
        : 'http://127.0.0.1:8000/api/v1/users/updateMe';
    const results = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (results.status === 'success') {
      showAlert('success', 'You update your data');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

/* document
  .querySelector('.form-user-data')
  .addEventListener('submit', (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    updateData({ name, email }, 'data');
  });
 */
