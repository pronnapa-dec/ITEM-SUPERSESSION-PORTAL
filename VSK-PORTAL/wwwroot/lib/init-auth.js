'use strict';

const url_api = "http://localhost:49705";
const url_auth_sys_domain_get = url_api + '/v2/AuthSysDomainGet';

$(document).ready(async function () {

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

    $('#btn-change_user').click(function () {

        $('#block-chang_user').removeClass('d-none');

        return false;

    });

    $('#btn-change_domain').click(function () {

        $('#block-chang_domain').removeClass('d-none');

        return false;

    });


});

