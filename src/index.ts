import { timer } from 'rxjs';
import MyCircle from './graphics';
import { natural_drinks, tree_types, natural_fruit_forageable } from './assets/environment'
import { create_name } from './util/nameCreators';
import { text } from './util/text';
import { object_descriptor } from './util/objectDescriptor';
import { actions } from './util/actions';

import p5, { Camera } from 'p5';
import { get_color_by_object_type } from './util/utils';
import { Person } from './persons/person';
import { position } from './geometry/position';
import { WorldObject } from './objects/worldObjects';
import { World } from './world/world';

export namespace sim {











	const world = new World();

}