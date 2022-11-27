import { Position } from "../geometry/position";
import { Need } from "./need";
import { Person } from "./person";

export class Contract {
  // Party with the need
  first_party: Person[] = [];

  // Party with the offer
  second_party: Person[] = [];

  // The need that is fulfilled for the first party
  fulfilled_need: Need;

  // Other contract data
  due_date: number = 0;

  // How long to wait at the meeting point to finish the contract
  wait_time: number = 500;

  // Where to meet when the contract is finished
  position: Position = { x: 0, y: 0, z: 0 };

  // first party
  payment: any;

  // second party
  compensation: any;

  constructor(
    first_party: Person[],
    second_party: Person[],
    fulfilled_need: Need,
    due_date: number,
    payment: any,
    compensation: any,
    wait_time: number
  ) {
    this.first_party = first_party;
    this.second_party = second_party;
    this.fulfilled_need = fulfilled_need;
    this.due_date = due_date;
    this.payment = payment;
    this.compensation = compensation;
    this.wait_time = wait_time;
  }
}
