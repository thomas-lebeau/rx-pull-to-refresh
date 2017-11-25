import * as shuffle from 'array-shuffle';
import { of } from 'rxjs/observable/of';
import { map } from 'rxjs/operators/map';
import { delay } from 'rxjs/operators/delay';
import { toPromise } from 'rxjs/operators/toPromise';

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

    return of(
      this.stories.slice(this.lastLoadedIndex).map(item => item.id)
    ).pipe(delay(200 + this.rand() * 100), toPromise());
  }

  getItemById(id) {
    const time = Date.now() / 1000;

    return of(this.stories.find(item => item.id === id)).pipe(
      map(item => ({ ...item, time })),
      delay(200 + this.rand() * 100),
      toPromise()
    );
  }

  rand() {
    return Math.floor(Math.random() * 5) + 1;
  }
}
