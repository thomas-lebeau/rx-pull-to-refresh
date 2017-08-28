import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/concatMap';
import 'rxjs/add/operator/take';

export default class HNService {
  baseUrl = 'https://hacker-news.firebaseio.com';
  version = 'v0';
  initalLoad = 20; // number of items to retrive on first load

  stories$ = new BehaviorSubject([]);
  lastLoadedItem = 0;

  getNews() {
    let obs$;

    if (this.lastLoadedItem) {
      obs$ = Observable.fromPromise(this.refresh());
    } else {
      obs$ = Observable.fromPromise(this.init());
    }

    return obs$.concatMap(() => Observable.of(this.stories$.value));
  }

  refresh() {
    return this.getNewStories().then(stories => {
      let sliceEnd = stories.indexOf(this.lastLoadedItem);
      sliceEnd >= 0 ? sliceEnd : 0;
      this.lastLoadedItem = stories[0];

      return this.getItems(stories.slice(0, sliceEnd));
    });
  }

  init() {
    return this.getNewStories().then(stories => {
      this.lastLoadedItem = stories[0];

      return this.getItems(stories.slice(0, this.initalLoad));
    });
  }

  getItems(ids) {
    const a = ids.map(id =>
      this.getItemById(id).then(story => this.updateStories(story))
    );

    return Promise.all(a);
  }

  getNewStories() {
    return fetch(
      `${this.baseUrl}/${this.version}/newstories.json`
    ).then(response => response.json());
  }

  getItemById(id) {
    return fetch(
      `${this.baseUrl}/${this.version}/item/${id}.json`
    ).then(response => response.json());
  }

  updateStories(item) {
    const stories = [item, ...this.stories$.value];
    this.stories$.next(stories);
  }
}
