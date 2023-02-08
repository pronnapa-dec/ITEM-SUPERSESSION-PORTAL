'use strict';

let fs = firebase.firestore();

const objProfile = JSON.parse(localStorage.getItem('objAuth'));
const user_id = objProfile[0]['username'];

let collection = 'lov_cn';
let oTable, name;
//let url_api = 'http://192.168.1.247/intranet/';
const url_api = "http://localhost:49256/";
let url_api_new = "http://localhost:49705/";


let route_get = url_api_new + 'api/CustomerSetupRouteGet';
let subroute_get = url_api_new + 'api/CustomerSetupSubrouteGet';
let Create_Delivery_Zone = url_api_new + 'api/TRP_Vendor_Create';
let Delivery_Zone_Get = url_api_new + 'api/TRP_Vendor_Get';
let Delivery_Zone_Update = url_api_new + 'api/TRP_Vendor_Update';
let Delivery_Zone_Delete = url_api_new + 'api/TRP_Vendor_Delete';

let TRP_Vendor_Lov_Get = url_api_new + 'api/TRP_Vendor_Lov_Get';

let route_dataSet = [];
let zone_dataSet = [];
let trp_vendor = [];

$.init = function () {

    $.List();

    $('#frm_data input').removeClass('parsley-success');

    $("input.numbers").keypress(function (event) {
        return isNumber(event, this)
    });

    $('.event-time-from').appendDtpicker({
        closeOnSelected: true,
        dateFormat: 'hh:mm',
        onInit: function (handler) {
            var picker = handler.getPicker();
            $(picker).addClass('main-datetimepicker');
        }
    });

    $('.event-time-from').on('click', function (e) {
        $('.datepicker_header, .datepicker_calendar').remove()
    });


    $('#frm_search').submit(async function (e) {

        e.preventDefault();

        $("#global-loader").fadeIn("slow");
        oTable.destroy();
        $.List(); //after search

    });

    $(".clear_btn").on("click", function () {


    });

    $("#btn-item_create").on("click", function () {
        $('#btn-save_exit').show();
        $('#frm_data').find('input, textarea').attr('readonly', false);
        $('#frm_data').find('select, input:radio').attr('disabled', false);
        //$('#btn-save_exit').html('บันทึก').show();
        //$('#btn-save_new').html('บันทึกและสร้างใหม่').show();
        $('#frm_data').trigger('reset');
        $("#route option").remove();
        $("#zone option").remove();

        setTimeout(function () {
            //$('#zone').append($("<option value=''>Please select..</option>"));
            //$('#route').append($("<option value=''>Please select..</option>"));
            //$.Zone_Get('Search');
            $.Create();
        }, 500);

    });

    $('#modal-frm_data').on('hidden.bs.modal', function () {
        $("#route option").remove();
        $("#route_search option").remove();
        $('.check').addClass('d-none');
        $('#frm_data').find('#name_transprot').removeClass('bd-danger');
        $('.btn-save_form').prop('disabled', false);

    });

    $(".route").on('change', function () {
        $.SubRoute_Get($(this).val());

    })

    $('#emmas_eline_search, #salegrch_delivery_subroute_search').select2({
        placeholder: 'Choose one',
        //width: '493px',
        searchInputPlaceholder: 'Search',
        dropdownParent: $("#frm_search")

    })

    $('#emmas_eline, #salegrch_delivery_subroute').select2({
        placeholder: 'Choose one',
        //width: '493px',
        searchInputPlaceholder: 'Search',
        dropdownParent: $("#modal-frm_data")

    })

    $("#modal-frm_data").on('hide.bs.modal', function () {
        $('#frm_data input, #frm_data textarea').val('')
    });

    fetch(TRP_Vendor_Lov_Get).then(function (response) {
        return response.json();
    }).then(function (result) {

        $.each(result.data, function (key, val) {

            trp_vendor.push({ id: val['lov_code'], text: val['lov1'] });

        });

        $('#name_transprot').select2({
            //width: '235px',
            width: '100%',
            height: '100%',
            dropdownParent: $("#modal-frm_data"),
            placeholder: 'Select Vendor',
            allowClear: false,
            data: trp_vendor,
            templateResult: function (data) {
                return data.text;
            },
        });

    });
};

$.Route_Get = async function (lov_id) {
    let route_get_api = new URL(route_get);

    route_get_api.search = new URLSearchParams({
        lov_id: lov_id
    });

    fetch(route_get_api).then(function (response) {
        return response.json();
    }).then(function (result) {
        if (result.status === 'Error') {

            $.LoadingOverlay("hide");

            $("#global-loader").fadeOut("slow");

            swal({
                type: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
                //footer: '<a href>Why do I have this issue?</a>'
            }, function (isConfirmed) {
                if (isConfirmed) {

                    location.reload();

                }
            })


        } else {
            $.each(result.data, function (index, item) {
                $('.route')
                    .append($("<option value=''>Please select..</option>")
                        .attr("value", item.lov_code)
                        .text(item.lov1));
            });

        }
    });

}

$.SubRoute_Get = async function (parent_lov_id) {
    let route_get_api = new URL(subroute_get);

    route_get_api.search = new URLSearchParams({
        parent_lov_id: parent_lov_id
    });

    fetch(route_get_api).then(function (response) {
        return response.json();
    }).then(function (result) {
        if (result.status === 'Error') {

            $.LoadingOverlay("hide");

            $("#global-loader").fadeOut("slow");

            swal({
                type: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
                //footer: '<a href>Why do I have this issue?</a>'
            }, function (isConfirmed) {
                if (isConfirmed) {

                    location.reload();

                }
            })


        } else {

            if (result.data.length > 0) {
                $.each(result.data, function (index, item) {
                    $('.subroute')
                        .append($("<option value=''>Please select..</option>")
                            .attr("value", item.lov_code)
                            .text(item.lov1));

                });
            } else {
                $(".subroute option").remove();
                $('.subroute').append($("<option value=''>Please select..</option>"));
            }


        }
    });

}

$.List = async function () {
    $('#frm_data input').removeClass('parsley-success');

    let url = new URL(Delivery_Zone_Get);

    url.search = new URLSearchParams({
        mode: 'Search',
        lov_zone_code: $('#zone_search').val() == '' || $('#zone_search').val() == null ? '' : $('#zone_search').val(),
        lov_route_code: $('#route_search').val() == '' || $('#route_search').val() == null ? '' : $('#route_search').val(),
        name: $('#name_transprot_search').val(),
    });

    fetch(url).then(function (response) {
        return response.json();
    }).then(function (result) {
        //oTable.destroy();
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

            oTable = $('#tbl-list').DataTable({
                data: result.data,
                autoWidth: true,
                paging: true,
                info: false,
                scrollCollapse: false,
                //lengthMenu: 10,
                //responsive: true,

                columns: [
                    {
                        title: "<span style='font-size:11px;'>ลำดับ</span>",
                        //width: "70px",
                        width: "10px",
                        class: "tx-center align-middle",
                        render: function (data, type, row, meta) {
                            let i = 0;
                            return '<span style="font-size:11px;">' + (meta.row + 1) + '</span>';
                        }

                    }, //0
                    {
                        title: "<center><span style='font-size:11px;'>ชื่อบริษัทขนส่งเอกชน</span></center>",
                        data: "name",
                        width: "100px",
                        //visible: false,
                        class: "tx-center align-middle",
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">&nbsp;&nbsp;' + data + '</span>';
                        }
                    }, //1
                    {
                        title: "<span style='font-size:11px;'>เวลาทำการ</span>",
                        data: "closetime",
                        width: "70px",
                        class: "tx-center align-middle",
                        render: function (data, type, row, meta) {
                            let opening = row.opening != null ? row.opening : '';
                            let closetime = row.closetime != null ? row.closetime : '';

                            return '<span style="font-size:11px;">' + opening + " - " + closetime + '</span>';
                        }
                    }, //2
                    {
                        title: "<span style='font-size:11px;'>สายส่ง (Route)</span>",
                        data: "lov_zone_code",
                        width: "70px",
                        //visible: false,
                        class: "tx-center align-middle",
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '</span>';
                        }
                    }, //3
                    {
                        title: "<span style='font-size:11px;'> สายส่งย่อย(Sub Route)</span>",
                        data: "lov_route_code",
                        width: "70px",
                        class: "tx-center align-middle",
                        render: function (data, type, row, meta) {

                            return data != null ? '<span style="font-size:11px;">' + data + '</span>' : '-';

                        }
                    }, //4
                    {
                        title: "<span style='font-size:11px;'>สถานะ</span>",
                        data: "record_status",
                        class: "tx-center",
                        width: "60px",
                        render: function (data, type, row, meta) {
                            if (data == '1') {
                                return '<span class="label text-success">' + '<div class="dot-label bg-success mr-1"></div>' + 'ใช้งาน' + '</span >'
                            } else if (data == '0') {
                                return '<span class="label text-danger">' + '<div class="dot-label bg-danger  mr-1"></div>' + 'ไม่ใช้งาน' + '</span >'
                            } else {
                                return '-'
                            }
                        }
                    }, //5
                    {
                        title: "<span style='font-size:11px;'>จัดการ</span>",
                        class: "tx-center ",
                        data: "id",
                        width: "10px",
                        render: function (data, type, row, meta) {
                            let data_row = JSON.stringify(row)
                            //return '<a class="btn btn-info btn-sm glyphicon glyphicon-name" href=#/' + meta[0] + '>' + 'Edit' + '</a>';
                            //return "<a type='button' class='btn btn-lg action btn-circle btn-info' data-id='" + data + " 'data-toggle='dropdown'> <i style='color:#ecf0fa;' class='fas fa-edit'></i></a><div class='dropdown-menu'><a  class='dropdown-item btn-action' data-row='" + data_row + "' data-action='view'>View<input type='file' style='display: none;' multiple=''></a><a  class='dropdown-item btn-action' data-row='" + data_row + "' data-action='edit'>Edit<input type='file' style='display: none;' multiple=''></a><a  class='dropdown-item btn-action'  data-row='" + data_row + "'data-action='delete'>Delete<input type='file' style='display: none;' multiple=''></a></div></div>"
                            return "<a type='button' class='btn-sm btn action' data-id='" + data + "' data-toggle='dropdown'> <i style='color:;' class='fas fa-bars'></i></a><div class='dropdown-menu'><a  class='dropdown-item btn-action' data-row='" + data_row +
                                "'data-action='view'>View<input type='file' style='display: none;' multiple=''></a><a  class='dropdown-item btn-action' data-row='" + data_row +
                                "'data-action='edit'>Edit<input type='file' style='display: none;' multiple=''></a><a  class='dropdown-item btn-action'  data-row='" + data_row +
                                "'data-action='delete'>Delete<input type='file' style='display: none;' multiple=''></a></div></div>"
                        }
                    }, //6

                ],
                "order": [[0, "asc"]],
                "initComplete": function (settings, json) {

                    //$('#tbl-list thead tr').css({ "height": "10px" })
                    // $.LoadingOverlay("hide");

                    $.contextMenu({
                        selector: '#tbl-list tbody tr',
                        callback: function (key, options) {

                            let citem = oTable.row(this).data();

                            if (key === 'view') {

                                $.Details(citem); 

                            } else if (key === 'edit') {

                                $.Edit(citem);

                            } else if (key === 'delete') {

                                $.Delete(citem);

                            } else {

                                alert('ERROR');

                            }

                        },
                        items: {
                            "view": { name: "View", icon: "fas fa-search" },
                            "edit": { name: "Edit", icon: "edit" },
                            "delete": { name: "Delete", icon: "delete" },
                        }

                    });

                    $("#global-loader").fadeOut("slow");

                    $('#tbl-list tbody tr').hover(function () {
                        $(this).css('cursor', 'pointer');
                    });

                    $('.btn-action').click(function () {
                        let id = $().data('id');
                        let data = $(this).data('row');
                        //let data_obj = $.parseJSON(data);
                        if ($(this).data('action') == "view") {
                            $.Details(data);
                        } else if ($(this).data('action') == "edit") {
                            $.Edit(data);
                        } else if ($(this).data('action') == "delete") {
                            $.Delete(data);
                            //} else {
                            //    alert($(this).data('action'));
                        }
                    });
                },
            });



        }
    })

};

$.Create = async function () {

    //alert('start create')

    $('.record_status').eq(1).prop('checked', true);

    $('.btn-save_form').click(function (e) {

        let submit_action = $(this).data('action');

        $('#frm_data').parsley().on('form:submit', function () {

            $('.btn-save_form').prop('disabled', true);

            // Model & Repo ไปเปลี่ยนเอาเอง
            let add_data = {
                lov_zone_code: $('#emmas_eline').val(),
                lov_route_code: $('#salegrch_delivery_subroute').val(),
                name: $('#name_transprot').val().trim(),
                opening: $('#opening_time').val(),
                closetime: $('#close_time').val(),
                note: $('#remark').val(),
                record_status: $("#record_status_1").is(":checked") === true ? '1' : '0',
                created_by: user_id,
                pMessage: ''
            };

            var params = [];
            for (const i in add_data) {
                params.push(i + "=" + encodeURIComponent(add_data[i]));
            }

            fetch(Create_Delivery_Zone, {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                // mode: 'no-cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: params.join("&"),
            }).then(data => {
                return data.json();
            }).then(data => {
                if (data.status === 'Error') {
                    toastr.error(data.error_message);

                } else {

                    toastr.success('Save Successfully!', async function () {
                        oTable.destroy();

                        if (submit_action === "save_exit") {

                            $('.btn-save_form').prop('disabled', false);
                            $('#modal-frm_data').modal('hide');
                            $("#zone , #zone_search").empty();

                            $.List();

                        } else if (submit_action === "save_new") {

                            $('#frm_data').trigger('reset');
                            $("#route option").remove();
                            $('.btn-save_form').prop('disabled', false);

                            $.List();

                        } else {

                            toastr.error('Error writing document');

                        }

                    });
                }

            }).catch((error) => {
                toastr.error(error, 'Error writing document');
                console.log('Error:', error);
            });

            return false;

        });

    });
};

$.Details = async function (citem) {

    $('#modal-frm_data').modal('show');

    $('.btn-save_form').hide();
    $('#frm_data').find('input, textarea').attr('readonly', true);
    $('#frm_data').find('select, input:radio').attr('disabled', true);

    $('#emmas_eline').val(citem['lov_zone_code']).trigger("change");
    $('#salegrch_delivery_subroute').val(citem['lov_route_code']).trigger("change");
    $('#opening_time').val(citem['opening']);
    $('#close_time').val(citem['closetime']);
    $('#remark').val(citem['note']);
    $('#name_transprot').val(citem['name']).trigger('change');

    citem['record_status'] === '1'
        ? $('#record_status_1').prop('checked', true)
        : $('#record_status_0').prop('checked', true);

};

$.Edit = async function (citem) {
    $.Details(citem);

    $('#modal-frm_data').modal('show');

    $('#btn-save_exit').show();
    $('#btn-save_exit').removeClass('btn-danger').addClass('btn-primary');

    $('#frm_data').find('input, textarea').attr('readonly', false);
    $('#frm_data').find('select, input:radio').attr('disabled', false);

    $('#btn-save_exit').click(function (e) {

        $('#frm_data').parsley().on('form:submit', function () {

            $('.btn-save_form').prop('disabled', true);
            let add_data = {
                id: citem['id'],
                lov_zone_code: $('#emmas_eline').val(),
                lov_route_code: $('#salegrch_delivery_subroute').val(),
                name: $('#name_transprot').val().trim(),
                opening: $('#opening_time').val(),
                closetime: $('#close_time').val(),
                note: $('#remark').val(),
                record_status: $("#record_status_1").is(":checked") === true ? '1' : '0',
                updated_by: user_id,
            };

            var params = [];
            for (const i in add_data) {
                params.push(i + "=" + encodeURIComponent(add_data[i]));
            }

            fetch(Delivery_Zone_Update, {
                method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                // mode: 'no-cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: params.join("&"),
            }).then(data => {
                return data.json();
            }).then(data => {
                if (data.status === 'Error') {
                    toastr.error(data.error_message);

                } else {

                    toastr.success('Save Successfully!', async function () {
                        oTable.destroy();
                        $('.btn-save_form').prop('disabled', false);
                        $('#modal-frm_data').modal('hide');
                        $.List();
                        $("#route option").remove();
                        $("#route_search option").remove();
                    });
                }

            }).catch((error) => {
                toastr.error(error, 'Error writing document');
                console.log('Error:', error);
            });

            return false;

        });

    });

};

$.Delete = async function (citem) {

    swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }, function (isConfirmed) {
        if (isConfirmed) {
            let add_data = {
                id: citem['id'],
                record_status: 'delete',
                updated_by: user_id,
                pMessage: ''
            };

            var params = [];
            for (const i in add_data) {
                params.push(i + "=" + encodeURIComponent(add_data[i]));
            }

            fetch(Delivery_Zone_Delete, {
                method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                // mode: 'no-cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: params.join("&"),
            }).then(data => {
                return data.json();
            }).then(data => {
                if (data.status === 'Success') {

                    setTimeout(function () { swal("Done!", "It was succesfully deleted!", "success"); }, 500)

                    oTable.destroy();
                    $('.btn-save_form').prop('disabled', false);
                    $('#modal-frm_data').modal('hide');
                    $.List();

                } else {
                    toastr.error(data.error_message);
                }

            }).catch((error) => {
                toastr.error(error, 'Error writing document');
                console.log('Error:', error);
            });
        }
    });

    return false;

};

$(document).ready(async function () {
    await $.init();
    await $.Route_Get('');
    
});

firebase.auth().onAuthStateChanged(function (user) {

    if (user) {

        console.log(user);
        var full_mail = user.email;
        name = full_mail.replace("@vskautoparts.com", "");

    } else {

        window.location.assign('./login');

    }

});

function isNumber(evt, element) {

    var charCode = (evt.which) ? evt.which : event.keyCode

    if (
        //(charCode != 45 || $(element).val().indexOf('-') != -1) &&      // “-” CHECK MINUS, AND ONLY ONE.
        //(charCode != 46 || $(element).val().indexOf('.') != -1) &&      // “.” CHECK DOT, AND ONLY ONE.
        (charCode < 48 || charCode > 57))
        return false;

    return true;
}

