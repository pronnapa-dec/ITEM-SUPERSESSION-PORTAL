'use strict';

const objProfile = JSON.parse(localStorage.getItem('objAuth'));
const user_id = objProfile[0]['username'];
// const url_api = "http://localhost:49705";
const url_api = "http://192.168.1.247:8089";
const url_auth_sys_rolemenu_create = url_api + '/v2/AuthSysRoleMenuCreate';
const url_auth_sys_rolemenu_update = url_api + '/v2/AuthSysRoleMenuUpdate';
const url_auth_sys_rolemenu_delete = url_api + '/v2/AuthSysRoleMenuDelete';
const url_auth_sys_rolemenu_get = url_api + '/v2/AuthSysRoleMenuGet';
const url_auth_sys_rolemenulist_get = url_api + '/v2/AuthSysRoleMenuListGet';

const url_auth_sys_application_get = url_api + '/v2/AuthSysApplicationGet';
const url_auth_sys_role_get = url_api + '/v2/AuthSysRoleGet';
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

                await $('#application_id').val('').trigger("change").prop('disabled', false);

                await $('#load_menu_list').html('');

                await $('#role_id').empty().select2().select2("destroy").prop('disabled', false);
                await $('#role_id').append('<option value="">--- Select Role ---</option>');

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

                        $('#load_menu_list').html('');

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

                                $('#load_menu_list').html('');

                                let url = new URL(url_auth_sys_menu_get);
                                url.search = new URLSearchParams({
                                    application_id: $('#application_id').val(),
                                });
                                fetch(url).then(function (response) {
                                    return response.json();
                                }).then(async function (result) {

                                    await $.each(result.data, async function (key, val) {

                                        if (val['record_status'] == true && (val['parent_name'] == '' || val['parent_name'] == null)) {

                                            await $('#load_menu_list').append('<div class="mg-t-10" id="parent_' + val['menu_id'] + '"><label class="ckbox"><input type="checkbox" class="role_menu" name="role_menu[]" value="' + val['menu_id'] + '"><span><i class="' + val['menu_icon'] + '"></i> &nbsp;' + val['menu_name'] + '</span>\</label></div>');

                                        }

                                    });

                                    await $.each(result.data, async function (key, val) {

                                        if (val['record_status'] == true && (val['parent_name'] != '' || val['parent_name'] != null)) {

                                            await $('#parent_' + val['menu_parent']).append('<div class="mg-t-10 mg-l-15"><label class="ckbox"><input type="checkbox" class="role_menu" name="role_menu[]" value="' + val['menu_id'] + '"><span>' + val['menu_name'] + '</span></label></div>');

                                        }

                                    });

                                });

                            });

                        });

                    });


                });

            });

        };

        $.List = async function () {

            let url = new URL(url_auth_sys_rolemenu_get);

            url.search = new URLSearchParams({
                menu_id: '',
                role_id: ''
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
                        val['role_name'],
                        val['role_id']
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
                            "targets": [3],
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
                                    func_id: tbl_data[3],
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

                    let role_menu_citem = $(".role_menu:checked").map(function () { return $(this).val() }).toArray();
                    
                    for (let i = 0; i < role_menu_citem.length; i++) {

                        citem.push({
                            role_id: $('#frm_data').find('#role_id').val(),
                            menu_id: role_menu_citem[i],
                            record_status: 1,
                            created_by: user_id,
                        });
                    }
                 
                    $.ajax({
                        url: url_auth_sys_rolemenu_create,
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

            let url = new URL(url_auth_sys_rolemenu_get);

            url.search = new URLSearchParams({
                role_id: item_id
            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(async function (result) {

                await $.each(result.data, function (key, val) {
                    $('#application_id').val(val['application_id']).trigger("change").prop('disabled', true);
                });

                let url = new URL(url_auth_sys_role_get);

                url.search = new URLSearchParams({
                    application_id: $('#application_id').val(),
                });

                await fetch(url).then(function (response) {
                    return response.json();
                }).then(async function (result) {

                    $('#role_id').select2().empty().select2("destroy");
                    $('#role_id').append('<option value="">--- Select Menu ---</option>');

                    await $.each(result.data, function (key, val) {

                        if (val['record_status'] == true) {

                            $('#role_id').append('<option value="' + val['role_id'] + '">' + val['role_name'] + '</option>');

                        }

                    });

                    await $('#role_id').val(item_id).prop('disabled', true);

                    await $('#load_menu_list').html('');

                    let url = new URL(url_auth_sys_menu_get);
                    url.search = new URLSearchParams({
                        application_id: $('#application_id').val(),
                    });
                    await fetch(url).then(function (response) {
                        return response.json();
                    }).then(async function (result) {

                        await $.each(result.data, async function (key, val) {

                            if (val['record_status'] == true && (val['parent_name'] == '' || val['parent_name'] == null)) {

                                await $('#load_menu_list').append('<div class="mg-t-10" id="parent_' + val['menu_id'] + '"><label class="ckbox"><input type="checkbox" id="' + val['menu_id']+'" class="role_menu" name="role_menu[]" value="' + val['menu_id'] + '"><span><i class="' + val['menu_icon'] + '"></i> &nbsp;' + val['menu_name'] + '</span>\</label></div>');

                            }

                        });

                        await $.each(result.data, async function (key, val) {

                            if (val['record_status'] == true && (val['parent_name'] != '' || val['parent_name'] != null)) {

                                await $('#parent_' + val['menu_parent']).append('<div class="mg-t-10 mg-l-15"><label class="ckbox"><input type="checkbox" id="' + val['menu_id'] +'" class="role_menu" name="role_menu[]" value="' + val['menu_id'] + '"><span>' + val['menu_name'] + '</span></label></div>');

                            }

                        });

                        let url = new URL(url_auth_sys_rolemenulist_get);

                        url.search = new URLSearchParams({
                            role_id: item_id,
                        });

                        await fetch(url).then(function (response) {
                            return response.json();
                        }).then(async function (result) {

                            await $.each(result.data, async function (key, val) {
                                
                                $('#' + val['menu_id']).prop('checked', true);

                            })

                            $('.role_menu').prop('disabled', true)

                        });

                    });

                })


            }).then(function (result) {

                if (key === 'edit') {

                    $.Edit(item_id);

                } else if (key === 'delete') {

                    $.Delete(item_id);

                }

            })

        };

        $.Edit = async function (item_id) {

            $('#btn-save_exit').html('Update').removeClass('d-none').removeClass('btn-danger').addClass('btn-primary').prop('disabled', false);
            $('#application_id').prop('disabled', true);
            $('#role_id').prop('disabled', true);
            $('.role_menu').prop('disabled', false);

            $('.btn-save_form').click(function (e) {

                let submit_action = $(this).data('action');

                $('#frm_data').parsley().on('form:submit', function () {

                    $('.btn-save_form').prop('disabled', true);

                    citem = {
                        role_id: item_id,
                    };

                    var params = [];
                    for (const i in citem) {
                        params.push(i + "=" + encodeURIComponent(citem[i]));
                    }

                    fetch(url_auth_sys_rolemenu_delete, {
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

                        let role_menu_citem = $(".role_menu:checked").map(function () { return $(this).val() }).toArray();

                        for (let i = 0; i < role_menu_citem.length; i++) {

                            citem.push({
                                role_id: $('#frm_data').find('#role_id').val(),
                                menu_id: role_menu_citem[i],
                                record_status: 1,
                                created_by: user_id,
                            });
                        }

                        $.ajax({
                            url: url_auth_sys_rolemenu_create,
                            type: 'POST',
                            contentType: "application/json; charset=utf-8",
                            dataType: "json",
                            data: JSON.stringify(citem),
                            success: function (result) {

                                $LogEventCreate('update', result['status'], JSON.stringify(citem))

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

                                    }, 1000);

                                });

                            }
                        }).catch(function (error) {

                            $LogEventCreate('create', error['status'], JSON.stringify(citem))
                            toastr.error(error, 'Error writing document');
                            console.error("Error writing document: ", error);

                        });

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
                        role_id: item_id,
                    };

                    var params = [];
                    for (const i in citem) {
                        params.push(i + "=" + encodeURIComponent(citem[i]));
                    }

                    fetch(url_auth_sys_rolemenu_delete, {
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