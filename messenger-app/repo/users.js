const { v4 } = require('uuid')

class User {
  constructor(name) {
    this.name = name;
    this.id = v4();
  }
}




class UserRepository {
  constructor() {
    this.users = [];
  }

  add(name) {
    const alreadyExistsUser = this.exists(name);
    if(alreadyExistsUser) {
      return {
        success: true,
        result: alreadyExistsUser
      }
    }
    const user = new User(name);
    this.users.push(user);
    return {
      succes: true,
      result: user
    }
  }

  exists(name) {
    return this.users.find(x => x.name.toLowerCase() === name.toLowerCase());
  }
 

  get(id) {
    return this.users.find(x => x.id === id);
  }

  getAll() {
    return {
      success: true,
      result: this.users
    }
  }
}

module.exports = new UserRepository();