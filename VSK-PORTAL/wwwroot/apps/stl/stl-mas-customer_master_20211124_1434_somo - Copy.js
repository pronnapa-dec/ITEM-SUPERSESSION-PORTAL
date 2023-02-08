'use strict';

//import { isNull } from "util";
//import { isEmpty } from "underscore";

let oTable;
let inventorycode_dataset = [];
let invfrecode_dataset = [];
let objProfile = JSON.parse(localStorage.getItem('objProfile'));
//console.log("objProfile", objProfile);
//console.log("objProfile_auth_user_profile", objProfile.auth_user_profile);


//let stmas_search = 'http://192.168.1.247/intranet/acc-api/v1/stmas_search';
//let product_purplan_get = 'http://192.168.1.247/intranet/acc-api/v2/product_purplan_stock_factor_get';
//let inventorycode_get = 'http://localhost:49705/api/InventoryCode_Get';
//let invfrecode_get = 'http://localhost:49705/api/InvfreCode_Get';
//let stmas_search = 'http://localhost:8081/vsk-portal-api/v3/stmas_search_V3';

const connect_url = 'http://localhost:8081/vsk-portal-api';
//const connect_url = "http://localhost:49705";
//let connect_url = 'http://192.168.1.247/intranet/acc-api';

let role_code = "";
let username = "";
let lov_get = connect_url + '/v1/itemmaster_lov_get';
let customer_list = connect_url + '/api/customermaster_list_get';
let customer_get = connect_url + '/api/customermaster_detail_get';

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
                            $.Edit(citem);
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


$.Create = async function () {

    $('.btn-save_form').show();
    $('.btn-save_form').prop('disabled', false);
    $('#btn-save_exit').html('Save');
    $('#btn-save_exit').removeClass('btn-danger').addClass('btn-primary');

    $('#frm_data input').val('').prop('disabled', false);
    $('#frm_data input').eq(0).focus();
    $('.record_status').eq(1).prop('checked', true);

    $('#schedule_all').on("change", function (e) {

        e.preventDefault();

        if ($(this).prop("checked") === true) {
            $('.schedule_day').prop('checked', true);
        } else {
            $('.schedule_day').prop('checked', false);
        }

    });

    $('.schedule_day').on("change", function (e) {

        e.preventDefault();

        if ($('.schedule_day:checked').length === 7) {
            $('#schedule_all').prop('checked', true);
        } else {
            $('#schedule_all').prop('checked', false);
        }

    });


    $('.btn-save_form').click(function (e) {

        let submit_action = $(this).data('action');

        $('#frm_data').parsley().on('form:submit', function () {

            $('.btn-save_form').prop('disabled', true);

            let uuid = $.uuid();

            let data_citem = {
                schedule_id: uuid,
                site_code: $('#site_code').val(),
                site_name: $('#site_code option:selected').text(),
                schedule_mon: $('#frm_data').find('#schedule_mon').prop("checked") === true ? 'Y' : 'N',
                schedule_tue: $('#frm_data').find('#schedule_tue').prop("checked") === true ? 'Y' : 'N',
                schedule_wed: $('#frm_data').find('#schedule_wed').prop("checked") === true ? 'Y' : 'N',
                schedule_thu: $('#frm_data').find('#schedule_thu').prop("checked") === true ? 'Y' : 'N',
                schedule_fri: $('#frm_data').find('#schedule_fri').prop("checked") === true ? 'Y' : 'N',
                schedule_sat: $('#frm_data').find('#schedule_sat').prop("checked") === true ? 'Y' : 'N',
                schedule_sun: $('#frm_data').find('#schedule_sun').prop("checked") === true ? 'Y' : 'N',
                schedule_note: $('#schedule_note').val(),
                record_status: $('#frm_data').find('.record_status').prop("checked") === true ? 'Y' : 'N',
                created_by: "SYSTEM",
                created_date: new Date(),
                updated_by: "SYSTEM",
                updated_date: new Date()
            };

            fs.collection(collection).doc(uuid).set(data_citem).then(function () {

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

                        oTable.destroy();
                        $.List();

                        $("#frm_data").parsley().reset();

                        if (submit_action === "save_exit") {

                            $('.btn-save_form').prop('disabled', false);
                            //$('#modal-frm_data').modal('hide');
                            $('#modal-frm_search').modal('hide');

                        } else if (submit_action === "save_new") {

                            $('#site_code').val('').trigger('change');
                            $('#schedule_note').val('').prop('disabled', false);
                            $('.schedule_day').prop('checked', false);
                            $('#schedule_all').prop('checked', false);

                            $('#frm_data input').val('').prop('disabled', false);
                            $('#frm_data input').eq(0).focus();
                            $('.record_status').eq(1).prop('checked', true);

                            $('.btn-save_form').prop('disabled', false);

                        } else {

                            toastr.error('Error writing document');

                        }

                    }, 900);

                    //$.addLogEvent(collection);

                });

            }).catch(function (error) {

                toastr.error(error, 'Error writing document');
                console.error("Error writing document: ", error);

            });

            return false;

        });

    });

};


$.Details = async function (citem) {

    //console.log(citem);

    $.LoadingOverlay("show", {
        image: '',
        custom: customElement
    });



    $('#frm_data').find('.modal-title').html("Customer Profile : " + citem['code'] + ' ' + citem['lname']);
    //$('#frm_data').find('.modal-title').html("Sales Profile : SaleB2B - SMG - คุณสาโรจน์  ตินพ (TD-บอล)");

    $('.btn-save_form').hide();

    $('#btn-addnewqty').click(function () {

        $('#modal-frm_data_addnewqty').modal({

            keyboard: false,
            backdrop: 'static'

        });

        return false;
    });

    $('#btn-addnewstmaswh').click(function () {

        $('#modal-frm_data_addnewstmaswh').modal({

            keyboard: false,
            backdrop: 'static'

        });

        return false;
    });

    console.log("Code", citem['code']);

    fetch(customer_get + '?code=' + citem['code']).then(function (response) {

        return response.json();

    }).then(function (result) {

        if (result.length > 0) {
            $.each(result.data, function (key, val) {

                //#Tab1 - 
                $('#information').find('#stmas_code').val(val['code']);
                $('#information').find('#stmas_gamountv').val($.addCommas(val['gamountv']));


                //#Tab2 - 


                setTimeout(function () {
                    $.LoadingOverlay("hide");
                }, 900);
                
            });
        } else if (result.length == 0) {
            $.LoadingOverlay("hide");
            $('#modal-frm_data').modal('hide');
            setTimeout(function () {
                toastr.error('ไม่พบข้อมูลรายการสินค้านี้ในตารางข้อมูลสินค้าหลัก');
            }, 100);
        }
    });

    $('#btn-export_goodprice').off('click').on('click', function (evt) {

        evt.preventDefault();

        $(this).on('click', function (evt) {
            evt.preventDefault();
        });

        window.location = connect_url + '/Export/ItemMaster_Goodprice_Get' + '?code=' + citem['code'];

        return false;

    });

};


$.Edit = async function (citem) {

    //console.log("edit - citem - code", citem);

    /*$('#btn-save_exit').html('Update').show();
    $('#btn-save_exit').removeClass('btn-danger').addClass('btn-primary');

    $('#btn-save_exit').click(function (e) {

        //alert(prodpurplan_plantype);
        //alert(prodpurplan_sourcetype);

        //return false;

        //=> Tab1 - Information
        var prodpurplan_cartype = $('#information').find('#prodpurplan_cartype').val();
        var prodpurplan_usagepercar = $('#information').find('#prodpurplan_usagepercar').val();
        var prodpurplan_serviceyear = $('#information').find('#prodpurplan_serviceyear').val();


        //=> Tab2 - Stock Price
        var prodrepplan_klh_stockstatus = $('#stockprice').find('#prodrepplan_klh_stockstatus').val();
        var prodrepplan_klh_minqty = $('#stockprice').find('#prodrepplan_klh_minqty').val();
        var prodrepplan_klh_maxqty = $('#stockprice').find('#prodrepplan_klh_maxqty').val();
        var prodpurplan_productsize = $('#stockprice').find('#prodpurplan_productsize').val();
        var prodpurplan_productqtyperpack = $('#stockprice').find('#prodpurplan_productqtyperpack').val();
        var prodpurplan_maxdiscountpercent = $('#stockprice').find('#prodpurplan_maxdiscountpercent').val();
        var prodpurplan_minmarginpercent = $('#stockprice').find('#prodpurplan_minmarginpercent').val();
        var prodpurplan_vatdiscmargin = $('#stockprice').find('#prodpurplan_vatdiscmargin').val();


        //=> Tab3 - Inventory#1
        var prodpurplan_stockstatus = $('#inventory1').find('#prodpurplan_stockstatus').val();
        var prodpurplan_remarkbypm = $('#inventory1').find('#prodpurplan_remarkbypm').val();
        var prodpurplan_skufocus = $('#inventory1').find('#prodpurplan_skufocus').val();

        //console.log("stmas_donotpur_1", $('#inventory1').find('#stmas_donotpur').val());
        //console.log("stmas_donotsale_1", $('#inventory1').find('#stmas_donotsale').val());
        //console.log("stmas_ginactive_1", $('#inventory1').find('#stmas_ginactive').val());
        //console.log("stmas_custconfirm_1", $('#inventory1').find('#stmas_custconfirm').val());
        //if ($('#inventory1').find('#stmas_donotpur').val() == 'on') { var stmas_donotpur = 1; } else { var stmas_donotpur = 0; }
        //if ($('#inventory1').find('#stmas_donotsale').val() == 'on') { var stmas_donotsale = 1; } else { var stmas_donotsale = 0; }
        //if ($('#inventory1').find('#stmas_ginactive').val() == 'on') { var stmas_ginactive = 1; } else { var stmas_ginactive = 0; }
        //if ($('#inventory1').find('#stmas_custconfirm').val() == 'on') { var stmas_custconfirm = 1; } else { var stmas_custconfirm = 0; }

        if ($('#inventory1').find('#stmas_donotpur').is(':checked')) { var stmas_donotpur = 1; } else { var stmas_donotpur = 0; }
        if ($('#inventory1').find('#stmas_donotsale').is(':checked')) { var stmas_donotsale = 1; } else { var stmas_donotsale = 0; }
        if ($('#inventory1').find('#stmas_ginactive').is(':checked')) { var stmas_ginactive = 1; } else { var stmas_ginactive = 0; }
        if ($('#inventory1').find('#stmas_custconfirm').is(':checked')) { var stmas_custconfirm = 1; } else { var stmas_custconfirm = 0; }
        //console.log("stmas_donotpur_2", stmas_donotpur);
        //console.log("stmas_donotsale_2", stmas_donotsale);
        //console.log("stmas_ginactive_2", stmas_ginactive);
        //console.log("stmas_custconfirm_2", stmas_custconfirm);

        //var prodpurplan_lifecycleaction = $('#inventory1').find('#prodpurplan_lifecycleaction').val();
        var prodpurplan_lifecyclereviewdate = $('#inventory1').find('#prodpurplan_lifecyclereviewdate').val();
        //var prodpurplan_certificationstatus = $('#inventory1').find('#prodpurplan_certificationstatus').val();
        var prodpurplan_supersessionbarcode = $('#inventory1').find('#prodpurplan_supersessionbarcode').val();
        //var prodpurplan_relationshiptype = $('#inventory1').find('#prodpurplan_relationshiptype').val();
        //var prodpurplan_lockcode = $('#inventory1').find('#prodpurplan_lockcode').val();


        //=> Tab4 - Inventory#2
        //var prodpurplan_plantype = $('input[name=prodpurplan_plantype]:checked', '.plantype').val()
        ////var prodpurplan_plantype = $('#inventory2').find('.plantype:checked').val();
        //console.log("1.prodpurplan_plantype", prodpurplan_plantype);
        ////alert(prodpurplan_plantype);
        //if (prodpurplan_plantype !== "Purchase" && prodpurplan_plantype !== "Inhouse") {
        //    prodpurplan_plantype = "Purchase";
        //    console.log("-------1");
        //}

        //var prodpurplan_sourcetype = $('input[name=prodpurplan_sourcetype]:checked', '.sourcetype').val()
        ////var prodpurplan_sourcetype = $('#inventory2').find('.sourcetype:checked').val();
        //console.log("1.prodpurplan_sourcetype", prodpurplan_sourcetype);
        ////alert(prodpurplan_sourcetype);
        //if (prodpurplan_sourcetype !== "Local" && prodpurplan_sourcetype !== "Import") {
        //    prodpurplan_sourcetype = "Local";
        //    console.log("-------2");
        //}

        //console.log("2.prodpurplan_plantype", prodpurplan_plantype);
        //console.log("2.prodpurplan_sourcetype", prodpurplan_sourcetype);

        var prodpurplan_manualsafetystock = $('#inventory2').find('#prodpurplan_manualsafetystock').val();
        var prodpurplan_moq = $('#inventory2').find('#prodpurplan_moq').val();
        var prodpurplan_leadtimesupplier = $('#inventory2').find('#prodpurplan_leadtimesupplier').val();
        var prodpurplan_leadtimeitem = $('#inventory2').find('#prodpurplan_leadtimeitem').val();
        var prodpurplan_minqtyconst = $('#inventory2').find('#prodpurplan_minqtyconst').val();
        var prodpurplan_maxqtyconst = $('#inventory2').find('#prodpurplan_maxqtyconst').val();
        var prodpurplan_purchase = $('#inventory2').find('#prodpurplan_purchase').val();
        var prodpurplan_purcon = $('#inventory2').find('#prodpurplan_purcon').val();

        var prodpurplan_prefsuppliercode = $('#inventory2').find('#prodpurplan_prefsuppliercode').val();
        var prodpurplan_prefsupplierdisc = $('#inventory2').find('#prodpurplan_prefsupplierdisc').val();
        var prodpurplan_discgroup = $('#inventory2').find('#prodpurplan_discgroup').val();
        var prodpurplan_purdiscgroup = $('#inventory2').find('#prodpurplan_purdiscgroup').val();
        var prodpurplan_salediscgroup = $('#inventory2').find('#prodpurplan_salediscgroup').val();

        var prodpurplan_transferunit = $('#inventory2').find('#prodpurplan_transferunit').val();
        var prodpurplan_minqtywarehouse = $('#inventory2').find('#prodpurplan_minqtywarehouse').val();
        var prodpurplan_maxqtywarehouse = $('#inventory2').find('#prodpurplan_maxqtywarehouse').val();

        //console.log("before change");
        //$('.div_prodrepplan_stockstatus').find('.prodrepplan_stockstatus').on("change", function (e) {

        //    e.preventDefault();
        //    console.log("change");

        //});

        $('#frm_data').parsley().on('form:submit', function () {

            $('.btn-save_form').prop('disabled', true);

            var data = {
                'stmas_code': citem['code'],
                'prodpurplan_cartype': prodpurplan_cartype,
                'prodpurplan_usagepercar': prodpurplan_usagepercar,
                'prodpurplan_serviceyear': prodpurplan_serviceyear,
                'prodrepplan_klh_stockstatus': prodrepplan_klh_stockstatus,
                'prodrepplan_klh_minqty': prodrepplan_klh_minqty,
                'prodrepplan_klh_maxqty': prodrepplan_klh_maxqty,
                'prodpurplan_productsize': prodpurplan_productsize,
                'prodpurplan_productqtyperpack': prodpurplan_productqtyperpack,
                'prodpurplan_maxdiscountpercent': prodpurplan_maxdiscountpercent,
                'prodpurplan_minmarginpercent': prodpurplan_minmarginpercent,
                'prodpurplan_vatdiscmargin': prodpurplan_vatdiscmargin,
                'prodpurplan_stockstatus': prodpurplan_stockstatus,
                'prodpurplan_remarkbypm': prodpurplan_remarkbypm,
                'prodpurplan_skufocus': prodpurplan_skufocus,
                'stmas_donotpur': isEmpty(stmas_donotpur) ? 0 : stmas_donotpur,
                'stmas_donotsale': isEmpty(stmas_donotsale) ? 0 : stmas_donotsale,
                'stmas_ginactive': isEmpty(stmas_ginactive) ? 0 : stmas_ginactive,
                'stmas_custconfirm': isEmpty(stmas_custconfirm) ? 0 : stmas_custconfirm,
                //'prodpurplan_lifecycleaction': prodpurplan_lifecycleaction,
                'prodpurplan_lifecyclereviewdate': $.DateToDB(prodpurplan_lifecyclereviewdate),
                //'prodpurplan_certificationstatus': prodpurplan_certificationstatus,
                'prodpurplan_supersessionbarcode': prodpurplan_supersessionbarcode,
                //'prodpurplan_relationshiptype': prodpurplan_relationshiptype,
                //'prodpurplan_lockcode': prodpurplan_lockcode,
                //'prodpurplan_plantype': prodpurplan_plantype,
                //'prodpurplan_sourcetype': prodpurplan_sourcetype,
                'prodpurplan_plantype': $('#inventory2').find('#prodpurplan_plantype_pur').prop("checked") === true ? 'Purchase' : 'Inhouse',
                'prodpurplan_sourcetype': $('#inventory2').find('#prodpurplan_sourcetype_loc').prop("checked") === true ? 'Local' : 'Import',
                'prodpurplan_manualsafetystock': prodpurplan_manualsafetystock,
                'prodpurplan_moq': prodpurplan_moq,
                'prodpurplan_leadtimesupplier': prodpurplan_leadtimesupplier,
                'prodpurplan_leadtimeitem': prodpurplan_leadtimeitem,
                'prodpurplan_minqtyconst': isEmpty(prodpurplan_minqtyconst) ? 0 : prodpurplan_minqtyconst,
                'prodpurplan_maxqtyconst': isEmpty(prodpurplan_maxqtyconst) ? 0 : prodpurplan_maxqtyconst,
                'prodpurplan_purchase': prodpurplan_purchase,
                'prodpurplan_purcon': prodpurplan_purcon,
                'prodpurplan_prefsuppliercode': prodpurplan_prefsuppliercode,
                'prodpurplan_prefsupplierdisc': prodpurplan_prefsupplierdisc,
                'prodpurplan_discgroup': isEmpty(prodpurplan_discgroup) ? null : prodpurplan_discgroup,
                //'prodpurplan_discgroup': prodpurplan_discgroup,
                'prodpurplan_purdiscgroup': prodpurplan_purdiscgroup,
                'prodpurplan_salediscgroup': prodpurplan_salediscgroup,
                'prodpurplan_transferunit': prodpurplan_transferunit,
                'prodpurplan_minqtywarehouse': isEmpty(prodpurplan_minqtywarehouse) ? 0 : prodpurplan_minqtywarehouse,
                'prodpurplan_maxqtywarehouse': isEmpty(prodpurplan_maxqtywarehouse) ? 0 : prodpurplan_maxqtywarehouse,
                'prodpurplan_updatedby': prodpurplan_updatedby,
                'prodpurplan_updatedby2': prodpurplan_updatedby2,
            };

            var params = [];
            for (const i in data) {
                params.push(i + "=" + encodeURIComponent(data[i]));
            }

            fetch(itemmaster_update, {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'no-cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: params.join("&"),
            }).then(data => {

                toastr.success('Save Successfully!', function () {

                    $.addLogEvent(citem['code'], 'VSM', 'edit', url_location, 'ok');

                    //oTable.destroy();
                    //$.List();

                    setTimeout(function () {

                        $('.btn-save_form').prop('disabled', false);
                        $("#frm_data").parsley().reset();
                        $('#modal-frm_data').modal('hide');

                    }, 900);

                });

            }).catch((error) => {
                console.error('Error:', error);
                $.addLogError(citem['code'], 'VSM', 'edit', url_location, 'error');
            });

            return false;

        });

    });*/

};


$.Delete = async function (citem) {

    /*$('#btn-save_exit').html('Delete').show();
    $('#btn-save_exit').removeClass('btn-primary').addClass('btn-danger');

    $('#btn-save_exit').click(function (e) {

        let submit_action = $(this).data('action');

        $('#frm_data').parsley().on('form:submit', function () {

            $('.btn-save_form').prop('disabled', true);

            let data_citem = {
                record_status: 'D',
                updated_by: "SYSTEM",
                updated_date: new Date()
            };

            fs.collection(collection).doc(citem['schedule_id']).update(data_citem).then(function () {

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

                        $('#modal-frm_data').modal('hide');
                        location.reload();

                    }, 900);

                });

            }).catch(function (error) {

                toastr.error(error, 'Error writing document');
                console.error("Error writing document: ", error);

            });

            return false;

        });

    });*/

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