const loginInput = document.querySelector('#login-input')
const passwordInput = document.querySelector('#password-input')

const writeNewInputToLocalStore = (payload) => {
  chrome.runtime.sendMessage({ message: "write_new_input_toLocal_store", payload });
}

// chrome.runtime.sendMessage(
//   { message: "get_name" },
//   response => {
//     if (response.message === 'success') {
//       document.querySelector('#test-div').innerHTML = `Hello ${response.payload}`;
//     }
//   });

// retrieves message from "popup_script" and sends response
chrome.runtime.sendMessage(
  { message: "get_login_and_password_from_background_local_store" },
  response => {
    if (response.message === 'success') {
      loginInput.value = response.payload.login;
      passwordInput.value = response.payload.password;
    }
  });

loginInput.addEventListener('change', function (event) {
  writeNewInputToLocalStore({ key: 'login', value: event.target.value })
});

passwordInput.addEventListener('change', function (event) {
  writeNewInputToLocalStore({ key: 'password', value: event.target.value })
});
