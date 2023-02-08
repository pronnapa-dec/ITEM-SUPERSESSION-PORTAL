'use strict';

const objProfile = JSON.parse(localStorage.getItem('objAuth'));
const user_id = objProfile[0]['username'];
// const url_api = "http://localhost:49705";
const url_api = "http://192.168.1.247:8089";
const url_auth_sys_menufunc_create = url_api + '/v2/AuthSysMenuFuncCreate';
const url_auth_sys_menufunc_update = url_api + '/v2/AuthSysMenuFuncUpdate';
const url_auth_sys_menufunc_delete = url_api + '/v2/AuthSysMenuFuncDelete';
const url_auth_sys_menufunc_get = url_api + '/v2/AuthSysMenuFuncGet';

const url_auth_sys_application_get = url_api + '/v2/AuthSysApplicationGet';
const url_auth_sys_menu_get = url_api + '/v2/AuthSysMenuGet';

let oTable = $('#tbl-list').DataTable({});
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
            }, 500);

            $('#btn-item_create').click(function (e) {

                e.preventDefault();

                $.Create();

            });

            $('#modal-frm_data').off('hidden.bs.modal').on('hidden.bs.modal', async function () {

                citem = [];

                await $.LoadingOverlay("show");

                await $.List();

                await $('#application_id').val('').trigger("change");
                await $('#menu_id').empty().select2().select2("destroy");

                await $.LoadingOverlay("hide");

            });

            let url = new URL(url_auth_sys_application_get);

            url.search = new URLSearchParams({
                application_id: '',
            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                $.each(result.data, function (key, val) {

                    if (val['record_status'] == true) {

                        $('#application_id').append('<option value="' + val['application_id'] + '">' + val['application_code'] + '</option>');

                    }

                });

            }).then(function () {

                $('#modal-frm_data').off('shown.bs.modal').on('shown.bs.modal', async function () {

                    $('#application_id').select2({
                        dropdownParent: $('#modal-frm_data')
                    }).off('select2:select').on('select2:select', function (e) {

                        $('#menu_id').select2().empty().select2("destroy");

                        let url = new URL(url_auth_sys_menu_get);
                        url.search = new URLSearchParams({
                            application_id: $('#application_id').val(),
                        });
                        fetch(url).then(function (response) {
                            return response.json();
                        }).then(function (result) {

                            $('#menu_id').append('<option value="">--- Select Menu ---</option>');

                            $.each(result.data, function (key, val) {

                                if (val['record_status'] == true) {

                                    $('#menu_id').append('<option value="' + val['menu_id'] + '">' + val['menu_name'] + '</option>');

                                }

                            });

                        }).then(function () {

                            $('#menu_id').select2({
                                dropdownParent: $('#modal-frm_data')
                            });


                        });

                    });


                });

            });

        };

        $.List = async function () {

            let url = new URL(url_auth_sys_menufunc_get);

            url.search = new URLSearchParams({
                func_id: '',
                func_name: ''
            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                let i = result.length;

                let data = [];

                $.each(result.data, function (key, val) {

                    data.push([
                        i,
                        val['application_code'],
                        val['menu_name'],
                        val['func_name'],
                        val['record_status'],
                        val['func_id']
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
                            "targets": [0, 1, 2],
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
                                    func_id: tbl_data[5],
                                };

                                if (key === 'view') {

                                    await $.Details(citem['func_id']);


                                } else if (key === 'edit') {

                                    await $.Details(citem['func_id'], key);

                                } else if (key === 'delete') {

                                    await $.Details(citem['func_id'], key);

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
                        menu_id: $('#frm_data').find('#menu_id').val(),
                        func_name: $('#frm_data').find('#func_name').val(),
                        record_status: $('#frm_data').find('.record_status').prop("checked") === true ? 1 : 0,
                        created_by: user_id,
                        updated_by: user_id,
                    });

                    console.log(citem);

                    $.ajax({
                        url: url_auth_sys_menufunc_create,
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

                                        $('#application_id').val('').trigger("change");
                                        $('#func_name').val('');

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

            let action = key;

            $('#modal-frm_data').modal({
                keyboard: false,
                backdrop: 'static'
            });

            $('.btn-save_form').addClass('d-none');
            $('.btn-save_form').prop('disabled', true);

            let url = new URL(url_auth_sys_menufunc_get);

            url.search = new URLSearchParams({
                func_id: item_id,
            });

            await fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                $.each(result.data, async function (key, val) {

                    let url = new URL(url_auth_sys_menu_get);

                    url.search = new URLSearchParams({
                        application_id: val['application_id'],
                    });

                    await fetch(url).then(function (response) {
                        return response.json();
                    }).then(function (result) {

                        $('#menu_id').select2().empty().select2("destroy");
                        $('#menu_id').append('<option value="">--- Select Menu ---</option>');

                        $.each(result.data, function (key, val) {

                            if (val['record_status'] == true) {

                                $('#menu_id').append('<option value="' + val['menu_id'] + '">' + val['menu_name'] + '</option>');

                            }

                        });

                    }).then(function () {

                        $('#menu_id').select2({
                            dropdownParent: $('#modal-frm_data')
                        });

                    });

                    await $('#application_id').val(val['application_id']).trigger("change").prop('disabled', true);
                    await $('#menu_id').val(val['menu_id']).trigger("change").prop('disabled', true);
                    await $('#func_name').val(val['func_name']).prop('disabled', true);
                    await $('.record_status').prop('disabled', true)

                    await val['record_status'] === true
                        ? $('.record_status').eq(0).prop('checked', true)
                        : $('.record_status').eq(1).prop('checked', true)

                    if (action === 'edit') {

                        await $.Edit(item_id);

                    } else if (action === 'delete') {

                        await $.Delete(item_id);

                    }

                });

            });
            
        };

        $.Edit = async function (item_id) {

            $('#btn-save_exit').html('Update').removeClass('d-none').removeClass('btn-danger').addClass('btn-primary').prop('disabled', false);
            $('#application_id').prop('disabled', false);
            $('#menu_id').prop('disabled', false);
            $('#func_name').prop('disabled', false);
            $('.record_status').prop('disabled', false);
    
            $('.btn-save_form').click(function (e) {

                let submit_action = $(this).data('action');

                $('#frm_data').parsley().on('form:submit', function () {

                    $('.btn-save_form').prop('disabled', true);

                    citem = {
                        func_id: item_id,
                        application_id: $('#frm_data').find('#application_id').val(),
                        menu_id: $('#frm_data').find('#menu_id').val(),
                        func_name: $('#frm_data').find('#func_name').val(),
                        record_status: $('#frm_data').find('.record_status').prop("checked") === true ? true : false,
                        updated_by: user_id,
                    };

                    var params = [];
                    for (const i in citem) {
                        params.push(i + "=" + encodeURIComponent(citem[i]));
                    }

                    fetch(url_auth_sys_menufunc_update, {
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
                        func_id: item_id,
                        updated_by: user_id,
                    };

                    var params = [];
                    for (const i in citem) {
                        params.push(i + "=" + encodeURIComponent(citem[i]));
                    }

                    fetch(url_auth_sys_menufunc_delete, {
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