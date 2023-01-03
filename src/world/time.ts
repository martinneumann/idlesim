import { Observable, timer } from "rxjs";

export class Time {
  currentInterval = 100;
  worldClock: Observable<number> = timer(0, this.currentInterval);
}
