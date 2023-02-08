'use strict';

const objProfile = JSON.parse(localStorage.getItem('objAuth'));
const user_id = objProfile[0]['username'];
// const url_api = "http://localhost:49705";
const url_api = "http://192.168.1.247:8089";
const url_auth_sys_user_create = url_api + '/v2/AuthSysUserCreate';
const url_auth_sys_user_update = url_api + '/v2/AuthSysUserUpdate';
const url_auth_sys_user_delete = url_api + '/v2/AuthSysUserDelete';
const url_auth_sys_user_get = url_api + '/v2/AuthSysUserGet';

const url_org_sys_employee_get = url_api + '/v2/OrgSysEmployeeGet';

let oTable = $('#tbl-list').DataTable();
let citem = [];

let customElement = $("<div>", {
    "css": {
        "border": "2px solid",
        "font-size": "14px",
        "text-align": "center",
        "padding": '7px'

    },
    "text": 'Please Wait...'
});


firebase.auth().onAuthStateChanged(async function (user) {

    if (user) {

        $.init = async function () {

            $.LoadingOverlay("show", {
                image: '/assets/img/sor.jpg',
                //custom: customElement
            });

            await $.List();

            //  await $.LoadingOverlay("hide");
            await setTimeout(function () {
                $.LoadingOverlay("hide");
            }, 1000);

            $('#btn-item_create').click(function (e) {

                e.preventDefault();

                $.Create();

            });

            $('#modal-frm_data').off('hidden.bs.modal').on('hidden.bs.modal', async function () {

                citem = [];

                await $.LoadingOverlay("show");

                await $.List();

                await $.LoadingOverlay("hide");

            });

            $('#modal-frm_data').off('shown.bs.modal').on('shown.bs.modal', async function () {

                let url = new URL(url_org_sys_employee_get);

                url.search = new URLSearchParams({
                    record_status: 1,
                });

                fetch(url).then(function (response) {
                    return response.json();
                }).then(function (result) {

                    $.each(result.data, function (key, val) {

                        if (val['record_status'] == true) {

                            $('#employee_id').append('<option value="' + val['employee_id'] + '">' + val['employee_code'] + ' ' + val['employee_fname_en'] + ' ' + val['employee_lname_en'] + ' (' + val['employee_nickname_en'] + ') ' + '</option>');

                        }

                    });

                }).then(function () {



                    $('#employee_id').select2({
                        dropdownParent: $('#modal-frm_data'),
                        templateResult: function (data) {
                            return data.text;
                        },
                        sorter: function (data) {
                            return data.sort(function (a, b) {
                                return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                            });
                        }
                    });

                });

            });

        };

        $.List = async function () {

            let url = new URL(url_auth_sys_user_get);

            url.search = new URLSearchParams({
                record_status: 1,
            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                let i = result.length;

                let data = [];

                $.each(result.data, function (key, val) {

                    data.push([
                        i,
                        val['employee_code'],
                        val['employee_fullname'],
                        val['user_username'],
                        val['record_status'],
                        val['user_id']
                    ]);

                    i--;

                });

                oTable.clear().destroy();

                oTable = $('#tbl-list').DataTable({
                    "data": data,
                    //"dom": 'ifrtp',
                    "deferRender": true,
                    "order": [[0, "desc"]],
                    // "ordering": false,
                    "pageLength": 25,
                    "columnDefs": [
                        {
                            "targets": [0, 1, 2,3],
                            "className": 'tx-center'
                        },

                        {
                            "targets": [4],
                            "searchable": false,
                            "className": 'tx-center',
                            "render": function (data, type, row) {

                                return data === true ? '<span class="badge badge-success">Enable</span>' : '<span class="badge badge-danger">Disable</span>';

                            }
                        },
                        {
                            "targets": [5],
                            "searchable": false,
                            "visible": false,

                        },
                    ],
                    "initComplete": function (settings, json) {
                        $.contextMenu({
                            selector: '#tbl-list tbody tr',
                            callback: async function (key, options) {

                                let tbl_data = oTable.row(this).data();

                                let citem = {
                                    user_id: tbl_data[6],
                                };

                                if (key === 'view') {

                                    await $.Details(citem['user_id']);

                                } else if (key === 'edit') {

                                    await $.Details(citem['user_id'], key);

                                } else if (key === 'delete') {

                                    await $.Details(citem['user_id'], key);

                                } else {

                                    $LogEventCreate('create', result['status'], JSON.stringify(citem))
                                    alert('ERROR');

                                }

                            },
                            items: {
                                "view": { name: "View", icon: "fas fa-search" },
                                "edit": { name: "Edit", icon: "edit" },
                                "delete": { name: "Delete", icon: "delete" },

                            }

                        });
                    }
                });

            });

        };

        $.Create = async function () {

            $('.btn-save_form').removeClass('d-none');
            $('.btn-save_form').prop('disabled', false);
            $('#btn-save_exit').html('Save');
            $('#btn-save_exit').removeClass('btn-danger').addClass('btn-primary');

            $('#frm_data input').val('').prop('disabled', false);
            $('#frm_data input').eq(0).focus();
            $('.record_status').eq(1).prop('checked', true);

            $('.btn-save_form').click(function (e) {

                let submit_action = $(this).data('action');

                $('#frm_data').parsley().on('form:submit', function () {

                    $('.btn-save_form').prop('disabled', true);

                    citem.push({
                        employee_id: $('#frm_data').find('#employee_id').val(),
                        user_password: $('#frm_data').find('#user_password').val(),
                        user_username: $('#frm_data').find('#user_username').val(),
                        record_status: $('#frm_data').find('.record_status').prop("checked") === true ? 1 : 0,
                        created_by: user_id,
                        updated_by: user_id,
                    });

                    console.log(citem);

                    $.ajax({
                        url: url_auth_sys_user_create,
                        type: 'POST',
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        data: JSON.stringify(citem),
                        success: function (result) {

                            $LogEventCreate('create', result['status'], JSON.stringify(citem))

                            citem = [];

                            toastr.options = {
                                "closeButton": false, // true/false
                                "debug": false, // true/false
                                "newestOnTop": false, // true/false
                                "progressBar": true, // true/false
                                "preventDuplicates": false,
                                "onclick": null,
                                "showDuration": "300", // in milliseconds
                                "hideDuration": "500", // in milliseconds
                                "timeOut": "900", // in milliseconds
                                "extendedTimeOut": "900", // in milliseconds
                                "showEasing": "swing",
                                "hideEasing": "linear",
                                "showMethod": "fadeIn",
                                "hideMethod": "fadeOut"
                            };

                            toastr.success('Save Successfully!', function () {

                                setTimeout(function () {

                                    $("#frm_data").parsley().reset();

                                    if (submit_action === "save_exit") {

                                        $('#modal-frm_data').modal('hide');

                                    } else if (submit_action === "save_new") {

                                        $('#user_username').val('');
                                        $('#user_password').val('');

                                        $('#frm_data input').val('').prop('disabled', false);
                                        $('#frm_data input').eq(0).focus();
                                        $('.record_status').eq(1).prop('checked', true);

                                        $('.btn-save_form').prop('disabled', false);

                                    } else {

                                        toastr.error('Error writing document');

                                    }

                                }, 1000);

                            });

                        }
                    }).catch(function (error) {

                        $LogEventCreate('create', error['status'], JSON.stringify(citem))
                        toastr.error(error, 'Error writing document');
                        console.error("Error writing document: ", error);

                    });

                    return false;

                });

            });

        };

        $.Details = async function (item_id, key = null) {

            $('#modal-frm_data').modal({
                keyboard: false,
                backdrop: 'static'
            });

            $('.btn-save_form').addClass('d-none');
            $('.btn-save_form').prop('disabled', true);

            let url = new URL(url_auth_sys_user_get);

            url.search = new URLSearchParams({
                user_id: item_id,
                user_name: '',
                user_code: '',
                user_type: '',
            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                $.each(result.data, function (key, val) {

                    $('#domain_id').val(val['domain_id']).trigger("change").prop('disabled', true);
                    $('#user_code').val(val['user_code']).prop('disabled', true);
                    $('#user_name').val(val['user_name']).prop('disabled', true);
                    $('#user_url_dev').val(val['user_url_dev']).prop('disabled', true);
                    $('#user_url_uat').val(val['user_url_uat']).prop('disabled', true);
                    $('#user_url_prod').val(val['user_url_prod']).prop('disabled', true);
                    $('#user_type').val(val['user_type']).prop('disabled', true);
                    $('.record_status').prop('disabled', true)

                    val['record_status'] === true
                        ? $('.record_status').eq(0).prop('checked', true)
                        : $('.record_status').eq(1).prop('checked', true)

                });

            }).then(function (result) {

                if (key === 'edit') {

                    $.Edit(item_id);

                } else if (key === 'delete') {

                    $.Delete(item_id);

                }

            })

        };

        $.Edit = async function (item_id) {

            $('#btn-save_exit').html('Update').removeClass('d-none').addClass('btn-primary').prop('disabled', false);

            $('#domain_id').prop('disabled', false);
            $('#user_code').prop('disabled', false);
            $('#user_name').prop('disabled', false);
            $('#user_url_dev').prop('disabled', false);
            $('#user_url_uat').prop('disabled', false);
            $('#user_url_prod').prop('disabled', false);
            $('#user_type').prop('disabled', false);


            $('.record_status').prop('disabled', false);

            $('.btn-save_form').click(function (e) {

                let submit_action = $(this).data('action');

                $('#frm_data').parsley().on('form:submit', function () {

                    $('.btn-save_form').prop('disabled', true);

                    citem = {
                        user_id: item_id,
                        domain_id: $('#frm_data').find('#domain_id').val(),
                        user_code: $('#frm_data').find('#user_code').val(),
                        user_name: $('#frm_data').find('#user_name').val(),
                        user_icon: $('#frm_data').find('#user_icon').val(),
                        user_url_dev: $('#frm_data').find('#user_url_dev').val(),
                        user_url_uat: $('#frm_data').find('#user_url_uat').val(),
                        user_url_prod: $('#frm_data').find('#user_url_prod').val(),
                        user_type: $('#frm_data').find('#user_type').val(),
                        suspend_detail: $('#frm_data').find('#suspend_detail').val(),
                        record_status: $('#frm_data').find('.record_status').prop("checked") === true ? true : false,
                        updated_by: user_id,
                    };

                    var params = [];
                    for (const i in citem) {
                        params.push(i + "=" + encodeURIComponent(citem[i]));
                    }

                    fetch(url_auth_sys_user_update, {
                        method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                        // mode: 'no-cors', // no-cors, *cors, same-origin
                        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        credentials: 'same-origin', // include, *same-origin, omit
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                        body: params.join("&"),
                    }).then(data => {
                        console.log('OK')
                        return data.json();
                    }).then(result => {

                        console.log(result)
                        $LogEventCreate('update', result['status'], JSON.stringify(citem));

                        citem = [];

                        toastr.options = {
                            "closeButton": false, // true/false
                            "debug": false, // true/false
                            "newestOnTop": false, // true/false
                            "progressBar": true, // true/false
                            "preventDuplicates": false,
                            "onclick": null,
                            "showDuration": "300", // in milliseconds
                            "hideDuration": "500", // in milliseconds
                            "timeOut": "900", // in milliseconds
                            "extendedTimeOut": "900", // in milliseconds
                            "showEasing": "swing",
                            "hideEasing": "linear",
                            "showMethod": "fadeIn",
                            "hideMethod": "fadeOut"
                        };

                        toastr.success('Save Successfully!', function () {

                            setTimeout(function () {

                                $("#frm_data").parsley().reset();

                                if (submit_action === "save_exit") {

                                    $('#modal-frm_data').modal('hide');

                                } else {

                                    toastr.error('Error writing document');

                                }

                            }, 500);

                        });

                    }).catch((error) => {

                        $LogEventCreate('update', 'ERROR', JSON.stringify(citem))
                        toastr.error(error, 'Error writing document');
                        console.error("Error writing document: ", error);

                    });

                    return false;

                });

            });

        };

        $.Delete = async function (item_id) {

            $('#btn-save_exit').html('Delete').removeClass('d-none').addClass('btn-danger').prop('disabled', false);
            $('.btn-save_form').click(function (e) {

                let submit_action = $(this).data('action');

                $('#frm_data').parsley().on('form:submit', function () {

                    $('.btn-save_form').prop('disabled', true);

                    citem = {
                        user_id: item_id,
                        updated_by: user_id,
                    };

                    var params = [];
                    for (const i in citem) {
                        params.push(i + "=" + encodeURIComponent(citem[i]));
                    }

                    fetch(url_auth_sys_user_delete, {
                        method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
                        // mode: 'no-cors', // no-cors, *cors, same-origin
                        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        credentials: 'same-origin', // include, *same-origin, omit
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                        body: params.join("&"),
                    }).then(data => {
                        console.log('OK')
                        return data.json();
                    }).then(result => {

                        console.log(result)
                        $LogEventCreate('delete', result['status'], JSON.stringify(citem));

                        citem = [];

                        toastr.options = {
                            "closeButton": false, // true/false
                            "debug": false, // true/false
                            "newestOnTop": false, // true/false
                            "progressBar": true, // true/false
                            "preventDuplicates": false,
                            "onclick": null,
                            "showDuration": "300", // in milliseconds
                            "hideDuration": "500", // in milliseconds
                            "timeOut": "900", // in milliseconds
                            "extendedTimeOut": "900", // in milliseconds
                            "showEasing": "swing",
                            "hideEasing": "linear",
                            "showMethod": "fadeIn",
                            "hideMethod": "fadeOut"
                        };

                        toastr.success('Save Successfully!', function () {

                            setTimeout(function () {

                                $("#frm_data").parsley().reset();

                                if (submit_action === "save_exit") {

                                    $('#modal-frm_data').modal('hide');

                                } else {

                                    toastr.error('Error writing document');

                                }

                            }, 500);

                        });

                    }).catch((error) => {

                        $LogEventCreate('delete', 'ERROR', JSON.stringify(citem))
                        toastr.error(error, 'Error writing document');
                        console.error("Error writing document: ", error);

                    });

                    return false;

                });

            });

        };

        $(document).ready(async function () {

            await $.init();


        });

    } else {

        window.location.assign('./login');

    }

});