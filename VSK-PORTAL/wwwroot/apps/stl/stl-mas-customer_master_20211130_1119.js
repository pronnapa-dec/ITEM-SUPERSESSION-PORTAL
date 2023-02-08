'use strict';

//import { isNull } from "util";
//import { isEmpty } from "underscore";

let oTable;
let inventorycode_dataset = [];
let invfrecode_dataset = [];
let objProfile = JSON.parse(localStorage.getItem('objProfile'));
//console.log("objProfile", objProfile);
//console.log("objProfile_auth_user_profile", objProfile.auth_user_profile);


//let role_code = "";
//let username = "";
//let lov_get = connect_url + '/v1/itemmaster_lov_get';
//let customer_list = connect_url + '/api/CustomerMaster_List';
//let customer_detail = connect_url + '/api/CustomerMaster_Detail';
//let url_customer_update = connect_url + '/api/CustomerMaster_Update';
//let salechannel_list = [];
//let salegroup_list = [];

//let url_location = "";

//url_location = window.location.href;


//let stmas_search = 'http://192.168.1.247/intranet/acc-api/v1/stmas_search';
//let product_purplan_get = 'http://192.168.1.247/intranet/acc-api/v2/product_purplan_stock_factor_get';
//let inventorycode_get = 'http://localhost:49705/api/InventoryCode_Get';
//let invfrecode_get = 'http://localhost:49705/api/InvfreCode_Get';
//let stmas_search = 'http://localhost:8081/vsk-portal-api/v3/stmas_search_V3';

//const connect_url = 'http://localhost:8081/vsk-portal-api';
const connect_url = "http://localhost:49705";
//let connect_url = 'http://192.168.1.247/intranet/acc-api';

let role_code = "";
let username = "";
let lov_get = connect_url + '/v1/itemmaster_lov_get';
let customer_list = connect_url + '/api/CustomerMaster_List';
//let customer_get = connect_url + '/api/customermaster_detail_get';

let customer_detail = connect_url + '/api/CustomerMaster_Detail';
let url_customer_update = connect_url + '/api/CustomerMaster_Update';

let search_gcodea = "";

let salegroup_list = [];
let salechannel_list = [];

let url_location = "";

url_location = window.location.href;
//console.log("location", url_location);


let customElement = $("<div>", {
    "css": {
        "border": "2px solid",
        "font-size": "14px",
        "text-align": "center",
        "padding": '7px'

    },
    "text": 'Please Wait...'
});

$.init = function () {

    $.LoadingOverlay("show", {
        image: '',
        custom: customElement
    });

    fetch(lov_get + '?lov_group=MasterData').then(function (response) {
        return response.json();
    }).then(function (result) {

        //console.log("lov_get", result.data);

        $.each(result.data, function (key, val) {

            if (val['lov_type'] == 'SaleGroup') {
                salegroup_list.push({ id: val['lov_code'], text: val['lov1'] });
            } else if (val['lov_type'] == 'SaleChannel') {
                salechannel_list.push({ id: val['lov_code'], text: val['lov1'] });
            }

        });

    });

    console.log("salegroup_list", salegroup_list);
    console.log("salechannel_list", salechannel_list);

    //$.addLogEvent('', 'VSM', 'visit', url_location, 'ok');

    $.List();

    setTimeout(function () {

        $('#search_salechannel').select2({
            //width: '235px',
            height: '40px',
            dropdownParent: $(".div_search_salechannel"),
            placeholder: {
                id: '0', // the value of the option
                text: 'Please select..'
            },
            allowClear: false,
            data: salechannel_list,
            templateResult: function (data) {
                return data.text;
            },
        });

        $('#search_salegroup').select2({
            //width: '235px',
            height: '40px',
            dropdownParent: $(".div_search_salegroup"),
            placeholder: {
                id: '0', // the value of the option
                text: 'Please select..'
            },
            searchable: false,
            allowClear: false,
            data: salegroup_list,
            templateResult: function (data) {
                return data.text;
            },
        });

        $.LoadingOverlay("hide");

    }, 900);

};


$.List = async function (mode) {

    //console.log('Index function Start', new Date());

    let url = new URL(customer_list);

    //url.search = new URLSearchParams({
    //    search_item_code3_2: isEmpty($('#frm_search2').find('#search_item_code3_2').val()) ? '' : $('#frm_search2').find('#search_item_code3_2').val(),
    //    mode: mode
    //});

    fetch(url).then(function (response) {
        return response.json();
        //alert("1");
    }).then(function (result) {

        //alert("2");
        //if (mode === 'search') { $('#tbl-list').show(); } else { $('#tbl-list').hide(); }

        if (mode === 'search' && result.length === 0) {

            toastr.error('ไม่พบข้อมูลค้นหา !');
            $("#global-loader").fadeOut("slow");

            //$.addLogError('', 'VSM', 'search', url_location, 'error');

        } else if (mode === 'search' && result.length > 0) {
            //$.addLogEvent('', 'VSM', 'search', url_location, 'ok');
        }

        console.log("oTable", result.data);

        //oTable.destroy();
        oTable = $('#tbl-list').DataTable({
            data: result.data,
            scrollY: "394px",
            scrollX: true,
            scrollCollapse: true,
            autoWidth: true,
            paging: true,
            dom: 'Bfrtip',
            colReorder: true,
            stateSave: true,
            lengthMenu: [
                [10, 25, 50, -1],
                ['10 rows', '25 rows', '50 rows', 'Show all']
            ],
            buttons: [
                'pageLength', 'copy', 'excel'/*, 'colvis'*/
            ],
            //fixedColumns: {
            //    rightColumns: 2
            //},
            columns: [
                {
                    title: "<center>รหัสลูกค้า</center>",
                    data: "code",
                    width: "60px",
                },
                {
                    title: "<center>ชื่อลูกค้า</center>",
                    data: "lname",
                    width: "250px",

                },
                {
                    title: "<center>Sale Group</center>",
                    data: "SaleGroup",
                    width: "80px",
                    class: "tx-center",

                },
                {
                    title: "<center>Channel</center>",
                    data: "Channel",
                    width: "80px",
                    class: "tx-center",

                },
                {
                    title: "<center>Sale person</center>",
                    data: "Saleperson",
                    width: "100px",

                },
                {
                    title: "<center>ชื่อลูกค้า (ไม่แยกสาขา)</center>",
                    data: "CustomernameWithNoBranch",
                    width: "250px",
                },
                {
                    title: "<center>ที่อยู่</center>",
                    data: "eaddress",
                    width: "330px",
                },
                {
                    title: "<center>แขวง/ตำบล</center>",
                    data: "etumbol",
                    width: "100px",
                },
                {
                    title: "<center>เขต/อำเภอ</center>",
                    data: "eamphur",
                    width: "100px",
                },
                {
                    title: "<center>จังหวัด</center>",
                    data: "Provinc",
                    width: "100px",
                },
                {
                    title: "<center>รหัสไปรษณีย์</center>",
                    data: "ezip",
                    width: "80px",
                },
            ],
            "order": [[0, "desc"]],
            "initComplete": function (settings, json) {

                $("#global-loader").fadeOut("slow");
                mode = '';

                $.contextMenu({
                    selector: '#tbl-list tbody tr',
                    callback: function (key, options) {

                        let citem = oTable.row(this).data();

                        $('#modal-frm_data').modal({

                            keyboard: false,
                            backdrop: 'static'

                        });

                        if (key === 'view') {

                            $.LoadingOverlay("show", {
                                image: '',
                                custom: customElement
                            });

                            $('#information').find('input').prop("disabled", true);
                            $('#information').find('select').prop("disabled", true);
                            $('#information').find('textarea').prop("disabled", true);
                            $('#information').find('.not_use').prop("disabled", true);
                            $('#information').find('#prodpurplan_cartype').show();
                            //$('#information').find('#prodpurplan_cartype').prop("disabled", true);

                            $('#stockprice').find('input').prop("disabled", true);
                            $('#stockprice').find('select').prop("disabled", true);
                            $('#stockprice').find('textarea').prop("disabled", true);
                            $('#stockprice').find('.not_use').prop("disabled", true);

                            $('#inventory1').find('input').prop("disabled", true);
                            $('#inventory1').find('select').prop("disabled", true);
                            $('#inventory1').find('textarea').prop("disabled", true);
                            $('#inventory1').find('.not_use').prop("disabled", true);

                            $('#inventory2').find('input').prop("disabled", true);
                            $('#inventory2').find('select').prop("disabled", true);
                            $('#inventory2').find('textarea').prop("disabled", true);
                            $('#inventory2').find('.not_use').prop("disabled", true);

                            $.Details(citem);
                            //$.addLogEvent(citem['code'], 'VSM', 'view', url_location, 'ok');

                            setTimeout(function () {
                                $.LoadingOverlay("hide");
                            }, 100);

                        } else if (key === 'edit') {

                            $.LoadingOverlay("show", {
                                image: '',
                                custom: customElement
                            });

                            $('#information').find('input').prop("disabled", true);
                            $('#information').find('select').prop("disabled", true);
                            $('#information').find('textarea').prop("disabled", true);
                            $('#information').find('.not_use').prop("disabled", true);
                            //$('#information').find('#prodpurplan_cartype').hide();
                            //$('#information').find('#prodpurplan_cartype').prop("disabled", false);
                            //$('#information').find('#prodpurplan_usagepercar').prop("disabled", false);
                            //$('#information').find('#prodpurplan_serviceyear').prop("disabled", false);

                            $('#stockprice').find('input').prop("disabled", true);
                            $('#stockprice').find('select').prop("disabled", true);
                            $('#stockprice').find('textarea').prop("disabled", true);
                            $('#stockprice').find('.not_use').prop("disabled", true);

                            $('#inventory1').find('input').prop("disabled", false);
                            $('#inventory1').find('select').prop("disabled", false);
                            $('#inventory1').find('textarea').prop("disabled", false);
                            $('#inventory1').find('.not_use').prop("disabled", true);

                            $('#inventory2').find('input').prop("disabled", false);
                            $('#inventory2').find('select').prop("disabled", false);
                            $('#inventory2').find('textarea').prop("disabled", false);
                            $('#inventory2').find('.not_use').prop("disabled", true);

                            $.Details(citem);
                            $.Update(citem);
                            //$.addLogEvent(citem['code'], 'VSM', 'view', url_location, 'ok');

                            setTimeout(function () {
                                $.LoadingOverlay("hide");
                            }, 100);

                            //$('#salesinfo').find('#prodpurplan_countofinvoiceorderlines_vsm').hide();

                        } else if (key === 'delete') {

                            $.Details(citem);
                            $.Delete(citem);

                        }
                        else if (key === 'create') {

                            $.Create();

                        } else {

                            alert('ERROR');

                        }

                    },
                    items: {
                        "view": { name: "View", icon: "fas fa-search" },
                        "edit": { name: "Edit", icon: "edit" },

                        // "delete": { name: "Delete", icon: "delete" },
                        // "sep1": "---------",
                        // "create": { name: "New Item", icon: "add" }
                    }

                });
            },
        });

        $('#modal-frm_search').modal('hide');

        setTimeout(function () {
            $.LoadingOverlay("hide");
        }, 100);
        //}, 900);

    });

};


$.Details = async function (citem) {

    //console.log(citem);

    $.LoadingOverlay("show", {
        image: '',
        custom: customElement
    });


    $('#customerinfo').find('input').prop("disabled", true);
    $('#customerinfo').find('select').prop("disabled", true);
    $('#customerinfo').find('textarea').prop("disabled", true);
    $('#customerinfo').find('.not_use').prop("disabled", true);

    $('#saleinfo').find('input').prop("disabled", true);
    $('#saleinfo').find('select').prop("disabled", true);
    $('#saleinfo').find('textarea').prop("disabled", true);
    $('#saleinfo').find('.not_use').prop("disabled", true);

    $('#deliveryinfo').find('input').prop("disabled", true);
    $('#deliveryinfo').find('select').prop("disabled", true);
    $('#deliveryinfo').find('textarea').prop("disabled", true);
    $('#deliveryinfo').find('.not_use').prop("disabled", true);


    $('#frm_data').find('.modal-title').html("Customer Profile : " + citem['code'] + ' ' + citem['lname']);
    //$('#frm_data').find('.modal-title').html("Sales Profile : SaleB2B - SMG - คุณสาโรจน์  ตินพ (TD-บอล)");

    $('.btn-save_form').hide();

    fetch(customer_detail + '?code=' + citem['code']).then(function (response) {

        return response.json();

    }).then(function (result) {

        if (result.length > 0) {

            $.each(result.data, function (key, val) {

                //#Tab1 - 
                $('#information').find('#stmas_code').val(val['code']);
                $('#information').find('#stmas_gamountv').val($.addCommas(val['gamountv']));

                //#Tab2 - 
                $('#emmas_code').val(val['code']).prop('disabled', true);
                $('#emmas_lname').val(val['lname']).prop('disabled', true);

                $('#emmas_eaddress').val(val['eaddress']).prop('disabled', true);
                $('#emmas_etumbol').val(val['etumbol']).prop('disabled', true);
                $('#emmas_eamphur').val(val['eamphur']).prop('disabled', true);
                $('#emmas_eprovinc').val(val['eprovinc']).prop('disabled', true);
                $('#emmas_ezip').val(val['ezip']).prop('disabled', true);
                $('#emmas_etel').val(val['etel']).prop('disabled', true);
                $('#emmas_efax').val(val['efax']).prop('disabled', true);
                $('#emmas_grouprank').val(val['rank']).prop('disabled', true);

                $('#salegrch_salechannel').val(val['salechannel']).prop('disabled', true);
                $('#salegrch_salegroup').val(val['salegroup']).prop('disabled', true);
                $('#salegrch_salerepresentative').val(val['salerepresentative']).prop('disabled', true);

                $('#saletarget_year').val(val['year']);
                $('#saletarget_m01').val(val['M01']);
                $('#saletarget_m02').val(val['M02']);
                $('#saletarget_m03').val(val['M03']);
                $('#saletarget_m04').val(val['M04']);
                $('#saletarget_m05').val(val['M05']);
                $('#saletarget_m06').val(val['M06']);
                $('#saletarget_m07').val(val['M07']);
                $('#saletarget_m08').val(val['M08']);
                $('#saletarget_m09').val(val['M09']);
                $('#saletarget_m10').val(val['M10']);
                $('#saletarget_m11').val(val['M11']);
                $('#saletarget_m12').val(val['M12']);

            });

            $(".modal-body").LoadingOverlay("hide", true);

        } else if (result.length == 0) {

            $('#modal-frm_data').modal('hide');

            setTimeout(function () {
                toastr.error('ไม่พบข้อมูลรายการสินค้านี้ในตารางข้อมูลสินค้าหลัก');
            }, 100);

            $(".modal-body").LoadingOverlay("hide", true);

        }
    });

};


$.Update = async function (citem) {

    $("#btn-save_exit").show()
    $('#saletarget_year').prop("disabled", false);
    $('#saletarget_m01').prop("disabled", false);
    $('#saletarget_m02').prop("disabled", false);
    $('#saletarget_m03').prop("disabled", false);
    $('#saletarget_m04').prop("disabled", false);
    $('#saletarget_m05').prop("disabled", false);
    $('#saletarget_m06').prop("disabled", false);
    $('#saletarget_m07').prop("disabled", false);
    $('#saletarget_m08').prop("disabled", false);
    $('#saletarget_m09').prop("disabled", false);
    $('#saletarget_m10').prop("disabled", false);
    $('#saletarget_m11').prop("disabled", false);
    $('#saletarget_m12').prop("disabled", false);

    $("#btn-save_exit").on('click', async function (e) {

        e.preventDefault();

        //$('#frm_data').parsley().validate();

        //if ($('#frm_data').parsley().isValid()) {

        swal({
            title: "Are you sure?",
            text: "This information will be saved immediately.",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn-danger",
            confirmButtonText: "Yes, saved it!",
            cancelButtonText: "No, cancel plx!",
            cancelButtonColor: '#d33',
            closeOnConfirm: false,
            closeOnCancel: false
        }, function (isConfirm) {

            if (isConfirm) {

                let val_code = citem['code'];
                let val_saletarget_year = $('#frm_data').find('#saletarget_year').val();
                let val_saletarget_m01 = $('#frm_data').find('#saletarget_m01').val();
                let val_saletarget_m02 = $('#frm_data').find('#saletarget_m02').val();
                let val_saletarget_m03 = $('#frm_data').find('#saletarget_m03').val();
                let val_saletarget_m04 = $('#frm_data').find('#saletarget_m04').val();
                let val_saletarget_m05 = $('#frm_data').find('#saletarget_m05').val();
                let val_saletarget_m06 = $('#frm_data').find('#saletarget_m06').val();
                let val_saletarget_m07 = $('#frm_data').find('#saletarget_m07').val();
                let val_saletarget_m08 = $('#frm_data').find('#saletarget_m08').val();
                let val_saletarget_m09 = $('#frm_data').find('#saletarget_m09').val();
                let val_saletarget_m10 = $('#frm_data').find('#saletarget_m10').val();
                let val_saletarget_m11 = $('#frm_data').find('#saletarget_m11').val();
                let val_saletarget_m12 = $('#frm_data').find('#saletarget_m12').val();

                let update_data = {

                    temp_id: $.uuid(),
                    code: val_code,
                    year: val_saletarget_year,
                    M01: val_saletarget_m01,
                    M02: val_saletarget_m02,
                    M03: val_saletarget_m03,
                    M04: val_saletarget_m04,
                    M05: val_saletarget_m05,
                    M06: val_saletarget_m06,
                    M07: val_saletarget_m07,
                    M08: val_saletarget_m08,
                    M09: val_saletarget_m09,
                    M10: val_saletarget_m10,
                    M11: val_saletarget_m11,
                    M12: val_saletarget_m12,
                    created_by: user_id,

                };

                var params = [];
                for (const i in update_data) {
                    params.push(i + "=" + encodeURIComponent(update_data[i]));
                }

                fetch(url_customer_update, {
                    method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                    // mode: 'no-cors', // no-cors, *cors, same-origin
                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                    credentials: 'same-origin', // include, *same-origin, omit
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                    body: params.join("&"),
                }).then(result => {
                    return result.json();
                }).then(result => {

                    console.log(result.data)

                    if (result.status === 'Error') {

                        toastr.error('Oops! An Error Occurred');

                    } else {

                        swal({
                            title: "Saved!",
                            text: "Successfully!",
                            type: 'success',
                            timer: 300,
                            showConfirmButton: false
                        });

                        $('#modal-frm_data').modal('hide');

                        //oTable.destroy();

                        //$.List();

                        //toastr.success('Save Successfully!', async function () {

                        //    $('#modal-frm_data').modal('hide');
                        //    oTable.destroy();

                        //    $.List();
                        //}, 300);


                        //}
                    }

                }).catch(error => {

                    toastr.error('Error, Please contact administrator.');

                });

            } else {

                swal("Cancelled", "Your imaginary file is safe :)", "error");

            }

        });

        //}
    });

};



$(document).ready(async function () {

    await $.init();

});


firebase.auth().onAuthStateChanged(function (user) {

    if (user) {

        //console.log(user);

    } else {

        window.location.assign('./login');

    }

});