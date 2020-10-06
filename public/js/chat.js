const socket = io();

const TIME_FORMAT = "hh:mm:ss a";

// Elements
const $msgForm = document.querySelector("#msgForm");
const $msgInput = $msgForm.querySelector("#msgInput");
const $msgSend = $msgForm.querySelector("#msgSend");
const $sendLocationBtn = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  const $newMessage = $messages.lastElementChild;

  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = $messages.offsetHeight;
  const containerHeight = $messages.scrollHeight;

  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (msg) => {
  console.log(msg);
  const html = Mustache.render(messageTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format(TIME_FORMAT),
  });
  $messages.insertAdjacentHTML("beforeend", html);

  autoscroll();
});

socket.on("locationMessage", (msg) => {
  const html = Mustache.render(locationTemplate, {
    username: msg.username,
    url: msg.url,
    createdAt: moment(msg.createdAt).format(TIME_FORMAT),
  });
  $messages.insertAdjacentHTML("beforeend", html);

  autoscroll();
});

socket.on("roomData", ({ room, users } = {}) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });

  $sidebar.innerHTML = html;
});

$msgForm.addEventListener("submit", (event) => {
  event.preventDefault();

  $msgSend.setAttribute("disabled", "disabled");

  const msg = event.target.elements.message.value;

  socket.emit("sendMessage", msg, (error) => {
    $msgSend.removeAttribute("disabled");
    $msgInput.value = "";
    $msgInput.focus();

    if (error) return console.log(error);

    console.log("Message delivered!");
  });
});

$sendLocationBtn.addEventListener("click", (event) => {
  if (!navigator.geolocation)
    return alert("Geolocation is not supported by your browser.");

  $sendLocationBtn.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;

    socket.emit(
      "sendLocation",
      {
        latitude,
        longitude,
      },
      () => {
        console.log("Location shared!");
        $sendLocationBtn.removeAttribute("disabled");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
