chrome.runtime.sendMessage({
    message: "get_name"
}, response => {
    if (response.message === 'success') {
        document.querySelector('#option-div').innerHTML = `Hello ${response.payload}`;
    }
});