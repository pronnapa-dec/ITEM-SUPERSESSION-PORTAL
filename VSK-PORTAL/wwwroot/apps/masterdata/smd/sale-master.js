'use strict';

const objProfile = JSON.parse(localStorage.getItem('objAuth'));
const user_id = objProfile[0]['username'];
const url_api = "http://localhost:49705";
//const url_api = "http://192.168.1.247:8089";

const url_sale_master_get = url_api + '/v1/SaleMasterGet';
const url_sale_group_get = url_api + '/v1/SaleGroupGet';
const url_sale_branch_get = url_api + '/v1/SaleBranchGet';
const url_sale_branch_create = url_api + '/v1/SaleMasterCreate';
const url_sale_branch_update = url_api + '/v1/SaleMasterUpdate';


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

        var full_mail = user.email;
        var username = full_mail.replace("@vskautoparts.com", "");

        $.init = async function () {
            
            $('.uppercase').on('keyup', function (e) {

                e.preventDefault();
                $(this).val($(this).val().toUpperCase());

            })

            await $.List();

            $("input.numbers").keypress(function (event) {
                return isNumber(event, this)
            });

            await setTimeout(function () {
                $.LoadingOverlay("hide");
            }, 1000);

            $('#btn-item_create').click(function (e) {

                e.preventDefault();

                $.Create();

            });

            $('#modal-frm_data').off('hidden.bs.modal').on('hidden.bs.modal', async function () {
                $('#frm_data').parsley().reset();
            });
        };

        $.List = async function () {

            $("#global-loader").fadeIn("slow");

            let url = new URL(url_sale_master_get);

            url.search = new URLSearchParams({
                Mode: 'Search'
            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                let i = result.length;

                let data = [];

                $("#global-loader").fadeOut("slow");

                $.each(result.data, function (key, val) {

                    data.push([
                        i,
                        val['code'],
                        val['lname'],
                        val['stel'],
                        val['sdescript'],
                        val['salegroup'],
                        val['Branch']

                    ]);

                    i--;

                });

                oTable.clear().destroy();

                oTable = $('#tbl-list').DataTable({
                    "data": data,
                    //"dom": 'ifrtp',
                    "deferRender": true,
                    "order": [[0, "asc"]],
                    // "ordering": false,
                    "pageLength": 25,
                    "columnDefs": [
                        {
                            "targets": [0, 1, 3, 5, 6],
                            "className": 'tx-center'
                        },
                        {
                            "targets": [],
                            "searchable": false,
                            "visible": true,

                        },
                    ],
                    "initComplete": function (settings, json) {
                        $.contextMenu({
                            selector: '#tbl-list tbody tr',
                            callback: async function (key, options) {

                                let tbl_data = oTable.row(this).data();

                                let citem = {
                                    sale_code: tbl_data[1],
                                };

                                if (key === 'view') {

                                    await $.Details(tbl_data);

                                //} else if (key === 'edit') {

                                //    await $.Edit(tbl_data);

                                } else if (key === 'delete') {

                                    await $.Delete(tbl_data);

                                } else {

                                    $LogEventCreate('create', result['status'], JSON.stringify(citem))
                                    alert('ERROR');

                                }

                            },
                            items: {
                                "view": { name: "View", icon: "fas fa-search" },
                                //"edit": { name: "Edit", icon: "edit" },
                                "delete": { name: "Delete", icon: "delete" },

                            }

                        });
                    }
                });

            });

        };

        $.Create = async function () {

            $('#frm_data input, #frm_data select, #frm_data textarea').val('').prop('disabled', false)

            $('.btn-save_form').removeClass('d-none');
            $('.btn-save_form').prop('disabled', false);
            $('#btn-save_exit').html('Save');
            $('#btn-save_exit').removeClass('btn-danger').addClass('btn-primary');

            $('#frm_data input').eq(0).focus();

            $('.btn-save_form').click(function (e) {


                let submit_action = $(this).data('action');

                $('#frm_data').parsley().on('form:submit', function () {

                    $('.btn-save_form').prop('disabled', true);

                    $("#global-loader").fadeIn("slow");

                    let add_data = {
                        code: $('#frm_data').find('#sale_code').val(),
                        lname: $('#frm_data').find('#sale_name').val(),
                        stel: $('#frm_data').find('#sale_tel').val(),
                        sdescript: $('#frm_data').find('#sale-descrip').val(),
                        salegroup: $('#frm_data').find('#sale-group').val(),
                        Branch: $('#frm_data').find('#sale-branch').val(),
                        created_by: username,
                        record_status: 1
                    };

                    var params = [];
                    for (const i in add_data) {
                        params.push(i + "=" + encodeURIComponent(add_data[i]));
                    }

                    fetch(url_sale_branch_create, {
                        method: 'POST', // *GET, POST, PUT, DELETE, etc.
                        //mode: 'no-cors', // no-cors, *cors, same-origin
                        //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        //credentials: 'same-origin', // include, *same-origin, omit
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                        body: params.join("&"),
                    }).then(data => {
                        //console.log(data);
                        return data.json();
                    }).then(data => {
                        $("#global-loader").fadeOut("slow");

                        if (data.status === 'Error') {

                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                text: 'Something went wrong!',
                                //footer: '<a href>Why do I have this issue?</a>'
                            }).then((result) => {
                                if (result.isConfirmed) {

                                    location.reload();

                                }
                            })

                        } else {

                            if (data.data.length > 0) {
                                console.log('pmessage',)
                                if (data.data[0]['pMessage'] == 'This record already exists!') {
                                    Swal.fire(
                                        'PK นี้มีอยู่แล้ว',
                                        'กรุณาลองใหม่อีกครั้ง!',
                                        'info'
                                    )
                                }
                                $('.btn-save_form').prop('disabled', false);
                            } else {
                                $('.btn-save_form').prop('disabled', true);

                                toastr.success('Save Successfully!', function () {

                                    $('#frm_data input, #frm_data select, #frm_data textarea').val('').trigger('change');

                                    setTimeout(function () {

                                        $("#frm_data").parsley().reset();

                                        $.List();

                                        if (submit_action === "save_exit") {

                                            $('#modal-frm_data').modal('hide');

                                        } else if (submit_action === "save_new") {

                                            $('#frm_data input, #frm_data select, #frm_data textarea').val('').trigger('change');
                                            $('.btn-save_form').prop('disabled', false);

                                        } else {

                                            toastr.error('Error writing document');

                                        }

                                    }, 1000);

                                });
                            }

                        }

                    }).catch((error) => {
                        $("#global-loader").fadeOut("slow");
                        // toastr.error(data.error_message);
                        toastr.error(error);
                    });

                    return false;

                });

            });

        };

        $.Details = async function (citem) {

            $('#modal-frm_data').modal({
                keyboard: false,
                backdrop: 'static'
            });

            $('.btn-save_form').addClass('d-none');
            $('.btn-save_form').prop('disabled', true);

            $('#frm_data input, #frm_data select, #frm_data textarea').prop('disabled', true)

            $('#frm_data #sale_code').val(citem[1])
            $('#frm_data #sale_name').val(citem[2])
            $('#frm_data #sale_tel').val(citem[3])
            $('#frm_data #sale-descrip').val(citem[4])
            $('#frm_data #sale-group').val(citem[5]).trigger('change')
            $('#frm_data #sale-branch').val(citem[6]).trigger('change')

        };

        $.Edit = async function (citem) {
            $.Details(citem);

            $('#btn-save_exit').html('Update').removeClass('d-none').addClass('btn-primary').prop('disabled', false);


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
                        updated_by: username,
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

        $.Delete = async function (citem) {

            //$('#btn-save_exit').html('Delete').removeClass('d-none').addClass('btn-danger').prop('disabled', false);
            Swal.fire({
                title: "Are you sure?",
                text: "คุณแน่ใจลบข้อมูลพนักงานขาย " + citem[2] +" ใช่ไหม!",
                icon: "warning",
                buttons: true,
                dangerMode: true,
            }).then((willDelete) => {
                if (willDelete) {

                    let add_data = {
                        code: citem[1],
                        lname: citem[2],
                        stel: citem[3],
                        sdescript: citem[4],
                        salegroup: citem[5],
                        Branch: citem[6],
                        updated_by: 'pronnapa.d',
                        mode: 'delete',
                        record_status: 0

                    };

                    var params = [];
                    for (const i in add_data) {
                        params.push(i + "=" + encodeURIComponent(add_data[i]));
                    }

                    fetch(url_sale_branch_update, {
                        method: 'POST', // *GET, POST, PUT, DELETE, etc.
                        //mode: 'no-cors', // no-cors, *cors, same-origin
                        //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        //credentials: 'same-origin', // include, *same-origin, omit
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                        body: params.join("&"),
                    }).then(data => {
                        //console.log(data);
                        return data.json();
                    }).then(data => {
                        $("#global-loader").fadeOut("slow");

                        if (data.status === 'Error') {

                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                text: 'Something went wrong!',
                                //footer: '<a href>Why do I have this issue?</a>'
                            }).then((result) => {
                                if (result.isConfirmed) {

                                    location.reload();

                                }
                            })

                        } else {

                            toastr.success('Save Successfully!', function () {

                                $.List();

                            });


                        }

                    }).catch((error) => {
                        $("#global-loader").fadeOut("slow");
                        // toastr.error(data.error_message);
                        toastr.error(error);
                    });

                    return false;

                } else {
                    swal("Your imaginary file is safe!");
                }
            });

        };

        $.Sale_Group = async function () {
            let url = new URL(url_sale_group_get);

            url.search = new URLSearchParams({
                Mode: 'Search',
                code: ''
            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {
                if (result.status === 'Error') {

                    $.LoadingOverlay("hide");

                    $("#global-loader").fadeOut("slow");

                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Something went wrong!',
                        //footer: '<a href>Why do I have this issue?</a>'
                    }).then((result) => {
                        if (result.isConfirmed) {

                            location.reload();

                        }
                    })


                } else {
                    $.each(result.data, function (index, item) {
                        $('#sale-group').append(`<option value="${item['code']}">${item['code']}</option>`);
                    });

                }

            });
            return false;
        }

        $.Sale_Branch = async function () {
            $.ajax({
                dataType: "json",
                url: url_sale_branch_get,
                success: function (result) {

                    $.each(result.data, function (index, item) {
                        $('#sale-branch').append(`<option value="${item['lov_id']}">${item['lov_id']} - ${item['lov1']}</option>`);
                    });

                }
            })

            return false;
        }

        function isNumber(evt, element) {

            var charCode = (evt.which) ? evt.which : event.keyCode

            if (
                //(charCode != 45 || $(element).val().indexOf('-') != -1) &&      // “-” CHECK MINUS, AND ONLY ONE.
                //(charCode != 46 || $(element).val().indexOf('.') != -1) &&      // “.” CHECK DOT, AND ONLY ONE.
                (charCode < 48 || charCode > 57))
                return false;

            return true;
        }

        $(document).ready(async function () {

            await $.init();
            await $.Sale_Group();
            await $.Sale_Branch();

        });

    } else {

        window.location.assign('./login');

    }

});