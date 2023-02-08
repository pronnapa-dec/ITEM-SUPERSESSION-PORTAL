'use strict';

// const url_api = "http://localhost:49705";
const url_api = "http://192.168.1.247:8089";
const url_auth_sys_domain_get = url_api + '/v2/AuthSysDomainGet';
const url_auth_sys_signindm_get = url_api + '/SignInWithDmGet';
const url_auth_sys_signinpwd_get = url_api + '/SignInOutDmGet';
const url_auth_sys_appinuser_get = url_api + '/AppsInUserGet';


let mode = (domain != '' ? 'dm' : 'pwd');  // dm = ผ่านโดเมน / psw = แบบปกติ

$.check_signin = function () {

    const objPermission = JSON.parse(localStorage.getItem('objAuth'));

    console.log('objPermission', objPermission)

    if (objPermission === null) {

        

    } else if (objPermission[0]['username'] != '') {

        window.location.assign('./home');
    }

}

firebase.auth().onAuthStateChanged(function (user) {

    if (user) {

        window.location.assign('./home');

    } else {

        $(document).ready(async function () {

            $.check_signin();

            let url = new URL(url_auth_sys_domain_get);

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                $.each(result.data, function (key, val) {

                    if (val['record_status'] == true) {

                        $('#domain_id').append('<option value="' + val['domain_id'] + '">' + val['domain_code'] + '</option>');

                    }

                });

            }).then(function () {



            });

            $('#btn-change_user').click(async function () {

                mode = 'pwd'

                $('#block-chang_user').removeClass('d-none');

                $('#user_username').prop('readonly', false);

                return false;

            });

            $('#btn-change_domain').click(async function () {

                $('#block-chang_domain').removeClass('d-none');

                return false;

            });

            $('#btn-submit').click(async function (e) {

                e.preventDefault();

                let objAuth = [];

                let url;

                if (mode === 'dm') {

                    url = new URL(url_auth_sys_signindm_get);

                    url.search = new URLSearchParams({
                        username: $('#user_username').val(),
                        domain: domain,
                        application: '2d63ae38-d927-4091-9c0e-616567ed1195',
                    });

                } else if (mode === 'pwd') {

                    if ($('#user_username').val() != '' || $('#user_password') != '') {

                        url = new URL(url_auth_sys_signinpwd_get);

                        url.search = new URLSearchParams({
                            username: $('#user_username').val(),
                            password: $('#user_password').val(),
                            application: '2d63ae38-d927-4091-9c0e-616567ed1195',
                        });

                    } else {

                        alert('Username or Password Is Incorrect');
                        location.reload();

                    }

                } else {

                    alert('ERROR');
                }

                fetch(url).then(function (response) {
                    return response.json();
                }).then(function (result) {

                    $.each(result.data, function (key, val) {

                        objAuth.push({
                            application: val['application'],
                            domain: val['domain'],
                            role: val['role'],
                            username: val['username'],
                            empcode: val['empcode'],
                            firstname: val['firstname'],
                            lastname: val['lastname'],
                            nickname: val['nickname'],
                            menu: JSON.parse(val['menu'])
                        });

                    });

                    if (result.length === 1) {

                        localStorage.setItem("objAuth", JSON.stringify(objAuth));

                        url = new URL(url_auth_sys_appinuser_get);

                        url.search = new URLSearchParams({
                            username: $('#user_username').val(),
                            domain: domain,
                        });

                        fetch(url).then(function (response) {
                            return response.json();
                        }).then(function (result) {

                            let objApps = [];

                            $.each(result.data, function (key, val) {

                                objApps.push({
                                    application: val['application_code'],
                                    domain: val['domain_code'],
                                    role: val['role_name']
                                });

                            });

                            localStorage.setItem("objApps", JSON.stringify(objApps));

                            firebase.auth().signInWithEmailAndPassword('ongkarn.s@vskautoparts.com', '123456').catch(function (error) {
                                // Handle Errors here.
                                var errorCode = error.code;
                                var errorMessage = error.message;
                                console.log(errorCode);
                                console.log(errorMessage);

                            });

                        });


                    } else {

                        alert('Username or Password Is Incorrect')
                        location.reload();
                    }

                    console.log(result);

                })

                return false;

            });

        });

    }

});

