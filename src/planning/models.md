# Object Hierarchies

- meta data should be kept to a minimum (store objects as is)
- use extended classes and override methods if necessary for objects that have functions
- use interfaces for data objects

# Communication and Memories

- Sound subject on world object as communication channel
- Actors subscribe (listen) to it and publish (speak) on it
- Published objects are messages and contain a ref to the object that is spoken about
- Messages are stored in actor memory

Memory: (Need | Place | Rumor | WorldObject)[]

world.sound.pipe(
map(sound => this.listen(sound))
)

listen(sound) => { this.memory.push({...})}

Sound: {...}
