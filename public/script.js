
$(document).ready(() => {
    $('.form-signin').submit((e) => {
        e.preventDefault();
        const jsonwt = Cookies.get('jwt');
        const token = 'Bearer ' + jsonwt;
        const username = $('#inputUsername').val();
        const data = { username: $('#inputUsername').val(), password: $('#inputPassword').val() }
        fetch('/users/login', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then((res) => {
            if (res.status === 'fail') {
                throw Error(res.message);
            } else {
                localStorage.username = username;
                window.open("/chat", "_self");
            }
        })
        .catch(err => alert(err));
    });
});
