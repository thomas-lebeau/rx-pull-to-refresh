import { h, Component } from 'preact';
import { bind } from 'decko';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/defer';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/takeWhile';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/repeat';

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
  requestLoad$ = new Subject().do(() => this.isLoading$.next(true));
  loadComplete$ = new Subject().do(() => this.isLoading$.next(false));
  isLoading$ = new BehaviorSubject(true);

  touchstart$ = Observable.fromEvent(this.document, 'touchstart');
  touchmove$ = Observable.fromEvent(this.document, 'touchmove');
  touchend$ = Observable.fromEvent(this.document, 'touchend');

  endDrag$ = this.loadComplete$.switchMap(() => Observable.of(0));

  drag$ = this.touchstart$
    .switchMap(start =>
      this.touchmove$
        .map(move => move.touches[0].pageY - start.touches[0].pageY)
        .takeUntil(this.touchend$)
        .concat(Observable.of(0))
    )
    .do(p => {
      if (p >= this.maxPos) {
        this.requestLoad$.next();
      }
    })
    .takeWhile(p => p < this.maxPos)
    .repeat();

  position$ = this.drag$.merge(this.endDrag$).startWith(0);
  positionTranslate$ = this.position$.map(p => `translate3d(0, ${p}px, 0)`);
  updateNewsTrigger$ = Observable.timer(0).merge(this.requestLoad$);

  news$ = this.updateNewsTrigger$
    .switchMap(() => this.hnService.getNews())
    .do(this.loadComplete$);

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
    this.subscription = Observable.combineLatest(
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
          <ul class="list">
            {news.map(item => <News {...item} />)}
          </ul>
        </div>
      </div>
    );
  }
}
