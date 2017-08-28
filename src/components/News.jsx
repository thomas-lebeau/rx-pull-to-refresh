/* eslint-disable react/no-danger */
import { h, Component } from 'preact';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';

export default class News extends Component {
  shouldComponentUpdate = () => false;

  render({ title, time, url, text, by, id }) {
    return (
      <li class="story">
        <h3>
          <a href={url}>
            {title}
          </a>
        </h3>
        <div dangerouslySetInnerHTML={{ __html: text }} />
        <small>
          {by} - {distanceInWordsToNow(time * 1000)} ago
        </small>
      </li>
    );
  }
}
