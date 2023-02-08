'use strict';

const objProfile = JSON.parse(localStorage.getItem('objAuth'));
const user_id = objProfile[0]['username'];
const url_api = "http://localhost:49705";
//const url_api = "http://192.168.1.247:8089";

const url_auth_sys_department_create = url_api + '/v2/OrgSysDepartmentCreate';
const url_auth_sys_department_update = url_api + '/v2/OrgSysDepartmentUpdate';
const url_auth_sys_department_delete = url_api + '/v2/OrgSysDepartmentDelete';
const url_auth_sys_department_get = url_api +'/v2/OrgSysDepartmentGet';
const url_auth_sys_company_get = url_api + '/v2/OrgSysCompanyGet';

let oTable = $('#tbl-list').DataTable();
let citem = [];

firebase.auth().onAuthStateChanged(async function (user) {

    if (user) {

        $.init = async function () {

            await $.LoadingOverlay("show", {
                image: '/assets/img/sor.jpg',
                //custom: customElement
            });

            await $.List();

            await setTimeout(function () {
                $.LoadingOverlay("hide");
            }, 500)

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


            let url = new URL(url_auth_sys_company_get);

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                $.each(result.data, function (key, val) {

                    if (val['record_status'] == true) {

                        $('#company_id').append('<option value="' + val['company_id'] + '">' + val['company_code'] + ' : ' + val['company_name_th'] + '</option>');

                    }

                });

            }).then(function () {

                $('#modal-frm_data').off('shown.bs.modal').on('shown.bs.modal', async function () {

                    $('#company_id').select2({
                        dropdownParent: $('#modal-frm_data')
                    }).on('select2:select', function (e) {


                    });

                });

            });

        };

        $.List = async function () {

            let url = new URL(url_auth_sys_department_get);

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                let i = result.length;

                let data = [];

                $.each(result.data, function (key, val) {

                    data.push([
                        i,
                        val['department_id'],
                        val['department_code'],
                        val['department_name_th'],
                        val['department_name_en'],
                        val['record_status']
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
                    "pageLength": 10,
                    "columnDefs": [
                        {
                            "targets": [0],
                            "className": 'tx-center'
                        },
                        {
                            "targets": [1],
                            "searchable": false,
                            "visible": false

                        },
                        {
                            "targets": [2],
                            "searchable": false,
                            "className": 'tx-center'
                        },
                        {
                            "targets": [5],
                            "searchable": false,
                            "className": 'tx-center',
                            "render": function (data, type, row) {

                                return data === true ? '<span class="badge badge-success">Enable</span>' : '<span class="badge badge-danger">Disable</span>';

                            }
                        },
                     
                    ],
                    "initComplete": function (settings, json) {
                        $.contextMenu({
                            selector: '#tbl-list tbody tr',
                            callback: async function (key, options) {

                                let tbl_data = oTable.row(this).data();
   
                                let citem = {
                                    department_id: tbl_data[1],
                                    department_code: tbl_data[2],
                                    department_name_th: tbl_data[3],
                                    department_name_en: tbl_data[4],
                                    record_status: tbl_data[5]
                                };

                                if (key === 'view') {

                                    await $.Details(citem);

                                } else if (key === 'edit') {

                                    await $.Details(citem);
                                    await $.Edit(citem['department_id']);

                                } else if (key === 'delete') {

                                    await $.Details(citem);
                                    await $.Delete(citem['department_id']);
                             
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
                        department_code: $('#frm_data').find('#department_code').val(),
                        department_name_th: $('#frm_data').find('#department_name_th').val(),
                        department_name_en: $('#frm_data').find('#department_name_en').val(),
                        record_status: $('#frm_data').find('.record_status').prop("checked") === true ? 1 : 0,
                        created_by: user_id,
                        updated_by: user_id,
                    });

                    $.ajax({
                        url: url_auth_sys_department_create,
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

                                        $('#department_code').val('');
                                        $('#department_name_th').val('');
                                        $('#department_name_en').val('');

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

        $.Details = async function (citem) {

            $('.btn-save_form').addClass('d-none');
            $('.btn-save_form').prop('disabled', true);

            $('#modal-frm_data').modal({
                keyboard: false,
                backdrop: 'static'
            });

            $('#department_code').val(citem['department_code']).prop('disabled', true);
            $('#department_name_th').val(citem['department_name_th']).prop('disabled', true);
            $('#department_name_en').val(citem['department_name_en']).prop('disabled', true);
            $('.record_status').prop('disabled', true)

            citem['record_status'] === true
                ? $('.record_status').eq(0).prop('checked', true)
                : $('.record_status').eq(1).prop('checked', true);

        };

        $.Edit = async function (item_id) {

            $('#btn-save_exit').html('Update').removeClass('d-none').addClass('btn-primary').prop('disabled', false);

            $('#department_code').prop('disabled', false);
            $('#department_name_th').prop('disabled', false);
            $('#department_name_en').prop('disabled', false);
            $('.record_status').prop('disabled', false);

            $('.btn-save_form').click(function (e) {

                let submit_action = $(this).data('action');

                $('#frm_data').parsley().on('form:submit', function () {

                    $('.btn-save_form').prop('disabled', true);

                    citem = {
                        department_id: item_id,
                        department_code: $('#frm_data').find('#department_code').val(),
                        department_name_th: $('#frm_data').find('#department_name_th').val(),
                        department_name_en: $('#frm_data').find('#department_name_en').val(),
                        record_status: $('#frm_data').find('.record_status').prop("checked") === true ? true : false,
                        updated_by: user_id,
                    };

                    var params = [];
                    for (const i in citem) {
                        params.push(i + "=" + encodeURIComponent(citem[i]));
                    }

                    fetch(url_auth_sys_department_update, {
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
                        department_id: item_id,
                        updated_by: user_id,
                    };

                    var params = [];
                    for (const i in citem) {
                        params.push(i + "=" + encodeURIComponent(citem[i]));
                    }

                    fetch(url_auth_sys_department_delete, {
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