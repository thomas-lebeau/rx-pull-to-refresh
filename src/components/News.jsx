/* eslint-disable react/no-danger */
import { h } from 'preact';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';

export const News = ({ title, time, url, text, by, id }) => (
  <li class="story">
    <h3>
      <a href={url}>{title}</a>
    </h3>
    <div dangerouslySetInnerHTML={{ __html: text }} />
    <small>
      {by} - {distanceInWordsToNow(time * 1000)} ago
    </small>
  </li>
);
