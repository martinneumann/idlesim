import { WorldObject } from "../objects/worldObjects";
import { ObjectDescriptor } from "../util/objectDescriptor";
import { Person } from "./person";

export type Category =
  | "house"
  | "need"
  | "job_proposition"
  | "unspecified"
  | undefined;

export function greaterThan(a: number, b: number) {
  return a > b;
}
export function greaterThanOrEqual(a: number, b: number) {
  return a >= b;
}
export function lessThanOrEqual(a: number, b: number) {
  return a <= b;
}
export function lessThan(a: number, b: number) {
  return a < b;
}

type MemoryType = "memory" | "object_memory";

/**
 * Anything that is remembered by that person
 */
export class Memory {
  type: MemoryType = "memory";
  age: number = 0;
  expiresAt: number = 3000;
}

class ObjectMemory extends Memory {
  type: MemoryType = "object_memory";
  descriptors: ObjectDescriptor[] = [];
}

/**
 * Central memory area in the brain.
 */
export class HippoCampus {
  private _memories: (Memory | ObjectMemory)[] = [];

  public get memories() {
    return this._memories;
  }

  /**
   * Memories of objects.
   * @returns
   */
  private _getObjectMemories() {
    return this._memories.filter(
      (memory): memory is ObjectMemory => memory.type === "object_memory"
    );
  }

  /**
   * Returns all object memories that contain at least one
   * of the given descriptors.
   * @param objectDescriptors
   * @returns
   */
  public getMemoriesByObjectDescriptor(objectDescriptors: ObjectDescriptor[]) {
    return this._getObjectMemories().filter((objectMemory) =>
      objectMemory.descriptors.some((y) => objectDescriptors.includes(y))
    );
  }

  /**
   * Checks whether the number of memories with a certain
   * descriptor meet the operator criterion.
   * @param descriptor
   * @param count
   * @param operator One of the four operator functions.
   * @returns Boolean.
   */
  public checkNumberOfMemoriesOfDescriptor(
    descriptor: ObjectDescriptor,
    count: number,
    operator: (arg0: number, arg1: number) => boolean
  ): boolean {
    return operator(
      this.getMemoriesByObjectDescriptor([descriptor]).length,
      count
    );
  }

  public addMemory(memory: Memory) {
    this.memories.push(memory);
  }
}
