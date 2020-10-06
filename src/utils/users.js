const users = [];

const sanitizeString = (str) => str.trim().toLowerCase();

const addUser = ({ id, username, room } = {}) => {
  username = sanitizeString(username);
  room = sanitizeString(room);

  if (!username || !room) return { error: "Username and room are required!" };

  const existingUser = users.some(
    (user) => user.room === room && user.username === username
  );
  if (existingUser) return { error: "Username is in use!" };

  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) return users.splice(index, 1)[0];
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) =>
  users.filter((user) => user.room === sanitizeString(room));

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
