import { h, Component } from 'preact';
import { bind } from 'decko';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { of } from 'rxjs/observable/of';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { timer } from 'rxjs/observable/timer';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { repeat } from 'rxjs/operators/repeat';
import { takeWhile } from 'rxjs/operators/takeWhile';
import { tap } from 'rxjs/operators/tap';
import { switchMap } from 'rxjs/operators/switchMap';
import { map } from 'rxjs/operators/map';
import { merge } from 'rxjs/operators/merge';
import { startWith } from 'rxjs/operators/startWith';
import { takeUntil } from 'rxjs/operators/takeUntil';
import { concat } from 'rxjs/operators/concat';

import { Header } from './components/Header';
import { News } from './components/News';
import { Loader } from './components/Loader';
import HNService from './services/HNService';

export default class App extends Component {
  isPrerender = typeof window === 'undefined';
  document = this.isPrerender ? null : window.document;
  maxPos = this.isPrerender ? 0 : window.innerHeight / 2;
  hnService = new HNService();

  subscription;
  requestLoad$ = new Subject().pipe(tap(() => this.isLoading$.next(true)));
  loadComplete$ = new Subject().pipe(tap(() => this.isLoading$.next(false)));
  isLoading$ = new BehaviorSubject(true);

  touchstart$ = fromEvent(this.document, 'touchstart');
  touchmove$ = fromEvent(this.document, 'touchmove');
  touchend$ = fromEvent(this.document, 'touchend');

  endDrag$ = this.loadComplete$.pipe(switchMap(() => of(0)));

  drag$ = this.touchstart$.pipe(
    switchMap(start =>
      this.touchmove$.pipe(
        map(move => move.touches[0].pageY - start.touches[0].pageY),
        takeUntil(this.touchend$),
        concat(of(0))
      )
    ),
    tap(p => {
      if (p >= this.maxPos) {
        this.requestLoad$.next();
      }
    }),
    takeWhile(p => p < this.maxPos),
    repeat()
  );

  position$ = this.drag$.pipe(merge(this.endDrag$), startWith(0));
  positionTranslate$ = this.position$.pipe(
    map(p => `translate3d(0, ${p}px, 0)`)
  );
  updateNewsTrigger$ = timer(0).pipe(merge(this.requestLoad$));

  news$ = this.updateNewsTrigger$.pipe(
    switchMap(() => this.hnService.getNews()),
    tap(this.loadComplete$)
  );

  constructor() {
    super();
    this.state = {
      news: [],
      positionTranslate: `translate3d(0, ${this.maxPos}px, 0)`,
      isLoading: true,
    };
  }

  @bind
  handleClick() {
    this.requestLoad$.next();
  }

  componentDidMount() {
    this.subscription = combineLatest(
      this.news$,
      this.positionTranslate$,
      this.isLoading$
    ).subscribe(([news, positionTranslate, isLoading]) => {
      this.setState({
        news,
        positionTranslate,
        isLoading,
      });
    });
  }

  componentWillUnmount() {
    this.subscription.sunsubscribe();
  }

  render({}, { news, positionTranslate, isLoading }) {
    return (
      <div class="app">
        <Header title="RxHN" />
        <div style={`transform: ${positionTranslate};`}>
          <Loader {...{ isLoading }} />
          <ul class="list">{news.map(item => <News {...item} />)}</ul>
        </div>
      </div>
    );
  }
}
