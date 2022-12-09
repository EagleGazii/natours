/* eslint-disable */
import { Component } from 'react';
class ReviewCard extends Component {
  render() {
    const { review } = this;
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          className={`reviews__star--${
            review.rating >= star ? 'active' : 'inactive'
          }`}
        >
          <use
            className="reviews__card"
            xlink:href="/img/icons.svg#icon-star"
          ></use>
        </svg>
      );
    }
    return (
      <div className="reviews__card">
        <div className="reviews__avatar">
          <img
            src={`/img/users/${review.user.photo}`}
            className="reviews__avatar-img"
            alt={`I am ${review.user.name.split(' ')[1]}`}
          />
          <h4 className="reviews__user">{review.user.name}</h4>
        </div>
        <p className="reviews__text">{review.review}</p>
        <div className="reviews__rating">{stars}</div>
      </div>
    );
  }
}

export default ReviewCard;
