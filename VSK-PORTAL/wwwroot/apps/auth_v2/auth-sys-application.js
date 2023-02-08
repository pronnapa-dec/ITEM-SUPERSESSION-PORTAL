'use strict';

const objProfile = JSON.parse(localStorage.getItem('objAuth'));
const user_id = objProfile[0]['username'];
// const url_api = "http://localhost:49705";
const url_api = "http://192.168.1.247:8089";
const url_auth_sys_application_create = url_api + '/v2/AuthSysApplicationCreate';
const url_auth_sys_application_update = url_api + '/v2/AuthSysApplicationUpdate';
const url_auth_sys_application_delete = url_api + '/v2/AuthSysApplicationDelete';
const url_auth_sys_application_get = url_api + '/v2/AuthSysApplicationGet';

const url_auth_sys_domain_get = url_api + '/v2/AuthSysDomainGet';

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

                $('#modal-frm_data').off('shown.bs.modal').on('shown.bs.modal', async function () {

                    $('#domain_id').select2({
                        dropdownParent: $('#modal-frm_data')
                    }).on('select2:select', function (e) {


                    });

                });

            });

        };

        $.List = async function () {

            let url = new URL(url_auth_sys_application_get);

            url.search = new URLSearchParams({
                application_id: '',
                application_name: '',
                application_code: '',
                application_type: '',
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
                        val['application_name'],
                        val['application_type'],
                        val['record_status'],
                        val['application_id']
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
                            "targets": [0, 1,2],
                            "className": 'tx-center'
                        },
                        {
                            "targets": [4],
                            "searchable": false,
                            "className": 'tx-center',
                            "render": function (data, type, row) {

                                if (data === 'web') {
                                    return '<span class="badge badge-primary">WEB</span>';
                                } else if (data === 'mobile') {
                                    return '<span class="badge badge-info">MOBILE</span>';
                                }else {
                                    return '<span class="badge badge-danger">ERROR</span>';
                                }

                            }
                        },

                        {
                            "targets": [5],
                            "searchable": false,
                            "className": 'tx-center',
                            "render": function (data, type, row) {

                                return data === true ? '<span class="badge badge-success">Enable</span>' : '<span class="badge badge-danger">Disable</span>';

                            }
                        },
                        {
                            "targets": [6],
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
                                    application_id: tbl_data[6],
                                };

                                if (key === 'view') {

                                    await $.Details(citem['application_id']);

                                } else if (key === 'edit') {

                                    await $.Details(citem['application_id'],key);
                                 
                                } else if (key === 'delete') {

                                    await $.Details(citem['application_id'],key);

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
                        domain_id: $('#frm_data').find('#domain_id').val(),
                        application_code: $('#frm_data').find('#application_code').val(),
                        application_name: $('#frm_data').find('#application_name').val(),
                        application_icon: $('#frm_data').find('#application_icon').val(),
                        application_url_dev: $('#frm_data').find('#application_url_dev').val(),
                        application_url_uat: $('#frm_data').find('#application_url_uat').val(),
                        application_url_prod: $('#frm_data').find('#application_url_prod').val(),
                        application_type: $('#frm_data').find('#application_type').val(),
                        suspend_detail: $('#frm_data').find('#suspend_detail').val(),
                        record_status: $('#frm_data').find('.record_status').prop("checked") === true ? 1 : 0,
                        created_by: user_id,
                        updated_by: user_id,
                    });

                    console.log(citem);

                    $.ajax({
                        url: url_auth_sys_application_create,
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

                                        $('#application_code').val('');
                                        $('#application_name').val('');

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

        $.Details = async function (item_id,key = null) {

            $('#modal-frm_data').modal({
                keyboard: false,
                backdrop: 'static'
            });

            $('.btn-save_form').addClass('d-none');
            $('.btn-save_form').prop('disabled', true);

            let url = new URL(url_auth_sys_application_get);

            url.search = new URLSearchParams({
                application_id: item_id,
                application_name: '',
                application_code: '',
                application_type: '',
            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                $.each(result.data, function (key, val) {

                    $('#domain_id').val(val['domain_id']).trigger("change").prop('disabled', true);
                    $('#application_code').val(val['application_code']).prop('disabled', true);
                    $('#application_name').val(val['application_name']).prop('disabled', true);
                    $('#application_url_dev').val(val['application_url_dev']).prop('disabled', true);
                    $('#application_url_uat').val(val['application_url_uat']).prop('disabled', true);
                    $('#application_url_prod').val(val['application_url_prod']).prop('disabled', true);
                    $('#application_type').val(val['application_type']).prop('disabled', true);
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
            $('#application_code').prop('disabled', false);
            $('#application_name').prop('disabled', false);
            $('#application_url_dev').prop('disabled', false);
            $('#application_url_uat').prop('disabled', false);
            $('#application_url_prod').prop('disabled', false);
            $('#application_type').prop('disabled', false);


            $('.record_status').prop('disabled', false);

            $('.btn-save_form').click(function (e) {

                let submit_action = $(this).data('action');

                $('#frm_data').parsley().on('form:submit', function () {

                    $('.btn-save_form').prop('disabled', true);

                    citem = {
                        application_id: item_id,
                        domain_id: $('#frm_data').find('#domain_id').val(),
                        application_code: $('#frm_data').find('#application_code').val(),
                        application_name: $('#frm_data').find('#application_name').val(),
                        application_icon: $('#frm_data').find('#application_icon').val(),
                        application_url_dev: $('#frm_data').find('#application_url_dev').val(),
                        application_url_uat: $('#frm_data').find('#application_url_uat').val(),
                        application_url_prod: $('#frm_data').find('#application_url_prod').val(),
                        application_type: $('#frm_data').find('#application_type').val(),
                        suspend_detail: $('#frm_data').find('#suspend_detail').val(),
                        record_status: $('#frm_data').find('.record_status').prop("checked") === true ? true : false,
                        updated_by: user_id,
                    };

                    var params = [];
                    for (const i in citem) {
                        params.push(i + "=" + encodeURIComponent(citem[i]));
                    }

                    fetch(url_auth_sys_application_update, {
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
                        application_id: item_id,
                        updated_by: user_id,
                    };

                    var params = [];
                    for (const i in citem) {
                        params.push(i + "=" + encodeURIComponent(citem[i]));
                    }

                    fetch(url_auth_sys_application_delete, {
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