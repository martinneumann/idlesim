import { World } from './world/world';

export namespace sim {
	const world = new World();
	world.simulation_loop();


}