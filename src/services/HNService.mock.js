import * as shuffle from 'array-shuffle';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/toPromise';

import HNService from './HNService';
import data from './HNData.json';

export class HNMockService extends HNService {
  lastLoadedIndex;
  key = 'hn-cache-mocks';
  stories = shuffle(data);

  getNewStories() {
    if (typeof this.lastLoadedIndex === 'undefined') {
      this.lastLoadedIndex = this.stories.length - this.initalLoad;
    } else {
      this.lastLoadedIndex -= this.rand();
    }

    if (this.lastLoadedIndex < 0) this.lastLoadedIndex = 0;

    return Observable.of(
      this.stories.slice(this.lastLoadedIndex).map(item => item.id)
    )
      .delay(200 + this.rand() * 100)
      .toPromise();
  }

  getItemById(id) {
    const time = Date.now() / 1000;

    return Observable.of(this.stories.find(item => item.id === id))
      .map(item => ({ ...item, time }))
      .delay(200 + this.rand() * 100)
      .toPromise();
  }

  rand() {
    return Math.floor(Math.random() * 5) + 1;
  }
}
