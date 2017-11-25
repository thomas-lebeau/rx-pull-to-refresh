import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { of } from 'rxjs/observable/of';
import { fromPromise } from 'rxjs/observable/fromPromise';

import { filter } from 'rxjs/operators/filter';
import { distinctUntilChanged } from 'rxjs/operators/distinctUntilChanged';
import { concatMap } from 'rxjs/operators/concatMap';
import { tap } from 'rxjs/operators/tap';
import { merge } from 'rxjs/operators/merge';

export default class HNService {
  baseUrl = 'https://hacker-news.firebaseio.com';
  version = 'v0';
  initalLoad = 20; // number of items to retrive on first load
  key = 'hn-cache';
  hasCache = typeof window === 'undefined' ? null : this.key in localStorage;

  stories$ = new BehaviorSubject(
    this.hasCache ? JSON.parse(localStorage[this.key]) : []
  );

  lastLoadedItem = this.hasCache
    ? this.stories$.value
        .map(s => s.id)
        .sort()
        .reverse()[0]
    : 0;

  cache$ = of(this.stories$.value).pipe(
    filter(stories => stories.length > 0),
    distinctUntilChanged((a, b) => a.length === b.length && a[0].id === b[0].id)
  );

  getNews() {
    let obs$;
    if (this.lastLoadedItem) {
      obs$ = fromPromise(this.refresh());
    } else {
      obs$ = fromPromise(this.init());
    }

    const new$ = obs$.pipe(
      concatMap(() => of(this.stories$.value)),
      tap(stories => this.cache(stories))
    );

    return this.cache$.pipe(merge(new$));
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
    return fetch(`${this.baseUrl}/${this.version}/newstories.json`).then(
      response => response.json()
    );
  }

  getItemById(id) {
    return fetch(`${this.baseUrl}/${this.version}/item/${id}.json`).then(
      response => response.json()
    );
  }

  updateStories(item) {
    const stories = [item, ...this.stories$.value];
    this.stories$.next(stories);
  }

  cache(stories) {
    localStorage[this.key] = JSON.stringify(stories);
  }
}
