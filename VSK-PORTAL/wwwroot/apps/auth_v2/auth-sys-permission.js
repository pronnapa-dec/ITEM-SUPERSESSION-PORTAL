'use strict';

const objProfile = JSON.parse(localStorage.getItem('objAuth'));
const user_id = objProfile[0]['username'];
// const url_api = "http://localhost:49705";
const url_api = "http://192.168.1.247:8089";
const url_auth_sys_permission_create = url_api + '/v2/AuthSysPermissionCreate';
const url_auth_sys_permission_update = url_api + '/v2/AuthSysPermissionUpdate';
const url_auth_sys_permission_delete = url_api + '/v2/AuthSysPermissionDelete';
const url_auth_sys_permission_get = url_api + '/v2/AuthSysPermissionGet';

const url_auth_sys_domain_get = url_api + '/v2/AuthSysDomainGet';
const url_auth_sys_application_get = url_api + '/v2/AuthSysApplicationGet';
const url_auth_sys_role_get = url_api + '/v2/AuthSysRoleGet';
const url_auth_sys_user_get = url_api + '/v2/AuthSysUserGet';


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


                $('#domain_id').empty().select2().select2("destroy").append('<option value="">--- Select Domain ---</option>');;
                $('#application_id').empty().select2().select2("destroy").append('<option value="">--- Select Application ---</option>');;
                $('#role_id').empty().select2().select2("destroy").append('<option value="">--- Select Role ---</option>');;
                $('#user_username').empty().select2().select2("destroy").append('<option value="">--- Select Employee ---</option>');;


                await $.List();

                await $.LoadingOverlay("hide");

            });

            $('#modal-frm_data').off('shown.bs.modal').on('shown.bs.modal', async function () {

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

                    $('#domain_id').select2({
                        dropdownParent: $('#modal-frm_data')
                    }).off('select2:select').on('select2:select', function (e) {

                        let url = new URL(url_auth_sys_application_get);
                        url.search = new URLSearchParams({
                            domain_id: $('#domain_id').val(),
                        });
                        fetch(url).then(function (response) {
                            return response.json();
                        }).then(function (result) {

                            $('#application_id').empty().select2().select2("destroy");

                            $('#application_id').append('<option value="">--- Select Application ---</option>');

                            $.each(result.data, function (key, val) {

                                if (val['record_status'] == true) {

                                    $('#application_id').append('<option value="' + val['application_id'] + '">' + val['application_code'] + '</option>');

                                }

                            });

                        }).then(function () {

                            $('#application_id').select2({
                                dropdownParent: $('#modal-frm_data')
                            }).off('select2:select').on('select2:select', function (e) {

                                let url = new URL(url_auth_sys_role_get);
                                url.search = new URLSearchParams({
                                    application_id: $('#application_id').val(),
                                });
                                fetch(url).then(function (response) {
                                    return response.json();
                                }).then(function (result) {

                                    $('#role_id').select2().empty().select2("destroy");
                                    $('#role_id').append('<option value="">--- Select Role ---</option>');

                                    $.each(result.data, function (key, val) {

                                        if (val['record_status'] == true) {

                                            $('#role_id').append('<option value="' + val['role_id'] + '">' + val['role_name'] + '</option>');

                                        }

                                    });

                                }).then(function () {

                                    $('#role_id').select2({
                                        dropdownParent: $('#modal-frm_data')
                                    }).off('select2:select').on('select2:select', function (e) {

                                        let url = new URL(url_auth_sys_user_get);
                                        url.search = new URLSearchParams({
                                            record_status: 1,
                                        });
                                        fetch(url).then(function (response) {
                                            return response.json();
                                        }).then(function (result) {

                                            $('#user_username').select2().empty().select2("destroy");
                                            $('#user_username').append('<option value="">--- Select Employee ---</option>');

                                            $.each(result.data, function (key, val) {

                                                if (val['record_status'] == true) {

                                                    $('#user_username').append('<option value="' + val['user_username'] + '">' + val['employee_code'] + ' ' + val['employee_fullname'] + '</option>');

                                                }

                                            });

                                        }).then(function () {

                                            $('#user_username').select2({
                                                dropdownParent: $('#modal-frm_data')
                                            }).off('select2:select').on('select2:select', function (e) {

                                            });

                                        });


                                    });

                                });

                            });

                        });

                    });

                });

            });

        };

        $.List = async function () {

            let url = new URL(url_auth_sys_permission_get);

            url.search = new URLSearchParams({
                role_id: '',
                application_id: '',
                domain_id: '',
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
                        val['domain_code'],
                        val['application_code'],
                        val['role_name'],
                        val['user_username'],
                        val['permission_id']
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
                            "targets": [0, 1, 2, 3, 4],
                            "className": 'tx-center'
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
                                    permission_id: tbl_data[6],
                                };

                                if (key === 'view') {

                                    await $.Details(citem['permission_id']);

                                } else if (key === 'edit') {

                                    await $.Details(citem['permission_id'], key);

                                } else if (key === 'delete') {

                                    await $.Details(citem['permission_id'], key);

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
                        role_id: $('#frm_data').find('#role_id').val(),
                        user_username: $('#frm_data').find('#user_username').val(),
                        record_status: 1,
                        created_by: user_id,
                        updated_by: user_id,
                    });

                    console.log(citem);

                    $.ajax({
                        url: url_auth_sys_permission_create,
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

                                $('#domain_id').val('').trigger("change");
                                $('#application_id').val('').trigger("change");
                                $('#role_id').val('').trigger("change");
                                $('#user_username').val('').trigger("change");

                                setTimeout(function () {

                                    $("#frm_data").parsley().reset();

                                    if (submit_action === "save_exit") {

                                        $('#modal-frm_data').modal('hide');

                                    } else if (submit_action === "save_new") {

                                        $('#permission_code').val('');
                                        $('#permission_name').val('');

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

            let url = new URL(url_auth_sys_permission_get);

            url.search = new URLSearchParams({
                permission_id: item_id,
                permission_name: '',
                permission_code: '',
                permission_type: '',
            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                $.each(result.data, function (key, val) {

                    $('#domain_id').val(val['domain_id']).trigger("change").prop('disabled', true);
                    $('#permission_code').val(val['permission_code']).prop('disabled', true);
                    $('#permission_name').val(val['permission_name']).prop('disabled', true);
                    $('#permission_url_dev').val(val['permission_url_dev']).prop('disabled', true);
                    $('#permission_url_uat').val(val['permission_url_uat']).prop('disabled', true);
                    $('#permission_url_prod').val(val['permission_url_prod']).prop('disabled', true);
                    $('#permission_type').val(val['permission_type']).prop('disabled', true);
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
            $('#permission_code').prop('disabled', false);
            $('#permission_name').prop('disabled', false);
            $('#permission_url_dev').prop('disabled', false);
            $('#permission_url_uat').prop('disabled', false);
            $('#permission_url_prod').prop('disabled', false);
            $('#permission_type').prop('disabled', false);

            $('.record_status').prop('disabled', false);

            $('.btn-save_form').click(function (e) {

                let submit_action = $(this).data('action');

                $('#frm_data').parsley().on('form:submit', function () {

                    $('.btn-save_form').prop('disabled', true);

                    citem = {
                        permission_id: item_id,
                        domain_id: $('#frm_data').find('#domain_id').val(),
                        permission_code: $('#frm_data').find('#permission_code').val(),
                        permission_name: $('#frm_data').find('#permission_name').val(),
                        permission_icon: $('#frm_data').find('#permission_icon').val(),
                        permission_url_dev: $('#frm_data').find('#permission_url_dev').val(),
                        permission_url_uat: $('#frm_data').find('#permission_url_uat').val(),
                        permission_url_prod: $('#frm_data').find('#permission_url_prod').val(),
                        permission_type: $('#frm_data').find('#permission_type').val(),
                        suspend_detail: $('#frm_data').find('#suspend_detail').val(),
                        record_status: $('#frm_data').find('.record_status').prop("checked") === true ? true : false,
                        updated_by: user_id,
                    };

                    var params = [];
                    for (const i in citem) {
                        params.push(i + "=" + encodeURIComponent(citem[i]));
                    }

                    fetch(url_auth_sys_permission_update, {
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
                        permission_id: item_id,
                        updated_by: user_id,
                    };

                    var params = [];
                    for (const i in citem) {
                        params.push(i + "=" + encodeURIComponent(citem[i]));
                    }

                    fetch(url_auth_sys_permission_delete, {
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