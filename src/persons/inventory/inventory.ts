import { WorldObject } from "../../objects/worldObjects";
import { ObjectDescriptor } from "../../util/objectDescriptor";

export class Inventory {
  private _objects: WorldObject[] = [];

  private get objects(): WorldObject[] {
    return this._objects;
  }

  public get length(): number {
    return this.objects.length;
  }

  /**
   * CRUD
   */
  public addItem(item: WorldObject) {
    this.objects.push(item);
  }

  /**
   * All objects the person has more than 3 of can be sold.
   */
  public markSuperfluousObjectsForTrade(): void {
    const objectsForSale = this.objects.filter(
      (object) =>
        this.objects.filter((otherObject) => object.name === otherObject.name)
          .length > 3
    );
    objectsForSale.forEach((objectForSale) => {
      if (!objectForSale.markedForTrade) objectForSale.markedForTrade = true;
    });
  }

  public getAllItemsMarkedForTrade() {
    return this.objects.filter((item) => item.markedForTrade);
  }

  public checkIfAnyItemMarkedForTrade() {
    return this.objects.find((item) => item.markedForTrade);
  }

  public findFirstObjectByObjectDescriptor(descriptor: ObjectDescriptor) {
    return this.objects.find((object) =>
      object.descriptors.some(
        (descriptorInInventory) => descriptorInInventory === descriptor
      )
    );
  }
  public findAllObjectsByObjectDescriptor(descriptor: ObjectDescriptor) {
    return this.objects.filter((object) =>
      object.descriptors.some(
        (descriptorInInventory) => descriptorInInventory === descriptor
      )
    );
  }

  public getNumberOfItemsByObjectDescriptor(descriptor: ObjectDescriptor) {
    return this.findAllObjectsByObjectDescriptor(descriptor).length;
  }
}
