const generateMessage = (text, username = "Admin") => ({
  username,
  text,
  createdAt: new Date().getTime(),
});

const generateLocationMessage = (username, { latitude, longitude } = {}) => ({
  username,
  url: `https://google.com/maps?q=${latitude},${longitude}`,
  createdAt: new Date().getTime(),
});

module.exports = {
  generateMessage,
  generateLocationMessage,
};
