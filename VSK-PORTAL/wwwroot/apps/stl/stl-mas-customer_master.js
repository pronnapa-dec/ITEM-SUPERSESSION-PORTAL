'use strict';

let oTable;
const objProfile = JSON.parse(localStorage.getItem('objAuth'));
const user_id = objProfile[0]['username'];
const connect_url = "http://localhost:49705";

let url_api = 'http://192.168.1.247/vsk-api-acc/';
//let connect_url = 'http://192.168.1.247/intranet/acc-api';
let url_api_new = "http://192.168.1.247:8899/stl-api";

let oTable_addr;
let oTable_trp;
let oTable_delivery;
let role_code = "";
let username = "";
let lov_get = connect_url + '/v1/itemmaster_lov_get';
let acc_lov_get = 'http://192.168.1.247/vsk-api-acc/api/ACC/ACCLov_Get';
let banklist_get = 'http://192.168.1.247/vsk-api-acc/api/ACC/ACCBankList_Get';
let customer_list = connect_url + '/api/CustomerMaster_List';
let customer_detail = connect_url + '/api/CustomerMaster_Detail';
let customer_setup_get = connect_url + '/v1/Customer_Setup_Get';
let customer_contact_get = connect_url + '/api/Customer_Contact_Get';
let customer_contact_create = connect_url + '/api/Customer_Contact_Create';
//let saletarget_get = connect_url + '/api/saletarget_get';
let customer_owner_create = connect_url + '/api/Customer_Owner_Create';
let customer_owner_get = connect_url + '/api/Customer_Owner_Get';
let customer_bankaccount_create = connect_url + '/api/Customer_BankAccount_Create';
let customer_bankaccount_get = connect_url + '/api/Customer_BankAccount_Get';

//kung edit api master address (2022/01/14)
let province_get = connect_url + '/api/Glb_Province_List_Get'; //'api/ACC/ACCGlb_Province_List_Get';
let amphur_get = connect_url + '/api/Glb_Amphur_List_Get'; //'api/ACC/ACCGlb_Amphur_List_Get';
let district_get = connect_url + '/api/Glb_District_List_Get'; //'api/ACC/ACCGlb_District_List_Get';
let postcode_get = url_api + 'api/ACC/ACCGlb_Amphur_postcode_List_Get';
let customer_setup_add = connect_url + '/v1/Customer_Setup_Add';
let Priority_Type_Get = connect_url + '/api/Priority_Type_Lov_Get';
let route_get = connect_url + '/api/CustomerSetupRouteGet';
let subroute_get = connect_url + '/api/CustomerSetupSubrouteGet';
let delivery_zone_get = connect_url + '/api/TRP_Vendor_Get';
let customer_setup_trp_add = connect_url + '/api/Customer_TRP_Vendor_Add';
let Customer_Setup_Trp_Update = connect_url + '/api/Customer_TRP_Vendor_Update';
let Customer_Setup_Trp_Delete = connect_url + '/api/Customer_TRP_Vendor_Delete';
let customer_setup_trp_get = connect_url + '/api/Customer_TRP_Vendor_Get';


//>>PRODUCTION
let customer_profile_detail186_get = connect_url + '/api/CustomerProfile_Detail186_Get'; /*CustomerInfo - Get*/
//let customerprofile_vskdata_get = connect_url + '/api/CustomerProfile_VSKData_Get'; /*CustomerInfo - Get*/

let url_customer_update_186 = connect_url + '/api/CustomerMaster_186_Update'; /*CustomerInfo - Update*/
//let customerprofile_vskdata_update = connect_url + '/api/CustomerProfile_VSKData_Update'; /*CustomerInfo - Update*/


//(ยังไม่มี DB UAT)
let customer_profile_saleTarget187_get = connect_url + '/api/Customer_Profile_SaleTarget187_Get'; /*Sale Target*/
//let customerprofile_saleTarget_get = connect_url + '/api/CustomerProfile_SaleTarget_Get'; /*Sale Target*/

let url_saletarget187_update = connect_url + '/api/Customer_Profile_SaleTarget187_Update';
//let customerprofile_saletarget_update = connect_url + '/api/CustomerProfile_SaleTarget_Update';

let customer_profile_detail189_get = connect_url + '/api/CustomerProfile_Detail189_Get'; /*Metabase*/
//let customerprofile_metabase_get = connect_url + '/api/CustomerProfile_Metabase_Get'; /*Metabase*/

let customer_address187_list = connect_url + '/api/Customer_Address187_List';
//let customerprofile_emmasaddr_get = connect_url + '/api/CustomerProfile_EmmasAddr_Get';

let customer_address187_create = connect_url + '/api/Customer_Address187_Create';
//let customerprofile_emmasaddr_create = connect_url + '/api/CustomerProfile_EmmasAddr_Create';

let customer_address187_Delete = connect_url + '/api/Customer_Address187_Delete';
//let customerprofile_emmasaddr_Delete = connect_url + '/api/CustomerProfile_EmmasAddr_Delete';

let customer_address187_update = connect_url + '/api/Customer_Address187_Update';
//let customerprofile_emmasaddr_update = connect_url + '/api/CustomerProfile_EmmasAddr_Update';


//>>UAT
let customer_profile_detail187_get = connect_url + '/api/CustomerProfile_Detail187_Get';
//let customerprofile_vskdata_get = connect_url + '/uat-api/CustomerProfile_VSKData_Get';
let url_customer_update_187 = connect_url + '/api/CustomerMaster_187_Update';
//let customerprofile_vskdata_update = connect_url + '/uat-api/CustomerProfile_VSKData_Update';


let salechannel_list = [];
let salegroup_list = [];
let contactpurpose_list = [];
let routeno_list = [];
let transport_name = [];
let customerranking_list = [];
let contact_text = "";
let accounttype_list = [];
let bank_list = [];

let url_location = "";
let flex_trpdefault = 0
let cusData = [] //kung edit 2021-12-28
let current_year = new Date().getFullYear();

url_location = window.location.href;

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

    $('.date-picker').datepicker({
        showOtherMonths: true,
        selectOtherMonths: true,
        numberOfMonths: 2
    });

    fetch(lov_get + '?lov_group=CustomerProfile').then(function (response) {
        return response.json();
    }).then(function (result) {

        $.each(result.data, function (key, val) {

            if (val['lov_type'] == 'ContactPurpose' && val['active_flag'] == 'Y') {
                contactpurpose_list.push({ id: val['lov_code'], text: val['lov1'] });
            } else if (val['lov_type'] == 'CustomerRanking' && val['active_flag'] == 'Y') {
                customerranking_list.push({ id: val['lov_code'], text: val['lov1'] });
            }

        });

        $('#contact_purpose_code').select2({
            //width: '235px',
            width: '100%',
            height: '100%',
            //dropdownParent: $(".div_prodpurplan_vatdiscmargin"),
            placeholder: 'Select Purpose',
            allowClear: false,
            data: contactpurpose_list,
            templateResult: function (data) {
                return data.text;
            },
        });

    });

    fetch(lov_get + '?lov_group=MASTER&lov_type=Route_No').then(function (response) {
        return response.json();
    }).then(function (result) {

        $.each(result.data, function (key, val) {

            if (val['lov_type'] == 'Route_No') {
                routeno_list.push({ id: val['lov_code'], text: val['lov1'] });
            }

        });

        $('#emmas_eline').select2({
            //width: '235px',
            width: '100%',
            height: '100%',
            dropdownParent: $("#frm_trans .eline"),
            placeholder: 'Select Route No.',
            allowClear: false,
            data: routeno_list,
            templateResult: function (data) {
                return data.text;
            },
        });

    });


    $('#emmas_eline').on('select2:select', function (e) {
        $.Delivery_Zone_Get($(this).val())
    });



    fetch(acc_lov_get + '?lov_group=SYSTEM&lov_type=Account Type').then(function (response) {
        return response.json();
    }).then(function (result) {

        //console.log("acc_lov_get", result.data);
        $.each(result.data, function (key, val) {

            accounttype_list.push({ id: val['lov_code'], text: val['lov1'] });

        });

        //console.log("accounttype_list", accounttype_list);

        $('#frm_bankaccount').find('#customer_bac_type').select2({
            //width: '235px',
            width: '100%',
            height: '100%',
            dropdownParent: $("#frm_bankaccount"),
            placeholder: 'Select Account Type',
            allowClear: false,
            data: accounttype_list,
            templateResult: function (data) {
                return data.text;
            },
        });

    });


    fetch(banklist_get).then(function (response) {
        return response.json();
    }).then(function (result) {

        $.each(result.data, function (key, val) {

            if (val['record_status'] == '1') {
                bank_list.push({ id: val['bank_id'], text: val['bank_alias'] });
            }

        });

        console.log("bank_list", bank_list);

        $('#frm_bankaccount').find('#customer_bac_bank').select2({
            //width: '235px',
            width: '100%',
            height: '100%',
            dropdownParent: $("#frm_bankaccount"),
            placeholder: 'Select Bank',
            allowClear: false,
            data: bank_list,
            templateResult: function (data) {
                return data.text;
            },
        });

        $('#customerinfo').find('#salegrch_banklist').select2({
            //width: '235px',
            width: '100%',
            height: '100%',
            dropdownParent: $("#customerinfo"),
            //placeholder: 'Select Bank',
            allowClear: false,
            data: bank_list,
            templateResult: function (data) {
                return data.text;
            },
        });

    });
    //$('#customerinfo').find('#salegrch_banklist').append(customerbank_list);

    $.List();


    $('#modal-frm_data').off('hidden.bs.modal').on('hidden.bs.modal', async function () {


        $('#modal_addcontact').find('#tbl_addcontact').html("");

        //console.log("ssss");
        //oTable_trp.destroy();
        //oTable_addr.destroy();
        $('#frm-contact-info div,#frm-contact-info span').remove();
        $('#frm-owner-info div,#frm-owner-info span').remove();
        $('#frm-bankaccount-info div,#frm-bankaccount-info span').remove();

    });

    for (var i = current_year; i > current_year - 3; i--) {
        $('#saleinfo').find('#saletargetcsum1_salestarget_year').append('<option value="' + i + '">' + i + '</option>');
    }

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

        $('#emmas_eprovinc, #emmas_eamphur, #emmas_etumbol, #salegrch_eprovinc2, #salegrch_eamphur2, #salegrch_etumbol2').select2({
            placeholder: 'Choose one',
            width: '258px',
            searchInputPlaceholder: 'Search',
            dropdownParent: $("#modal-frm_data")

        })


        $('#customer_delivery_route, #customer_delivery_subroute, #emmasaddr_eprovinc, #emmasaddr_eamphur, #emmasaddr_etumbol').select2({
            placeholder: 'Choose one',
            width: '493px',
            searchInputPlaceholder: 'Search',
            dropdownParent: $("#frm_customer")

        })

    }, 900);

    $.Province_Get();

    $(".province").off().on('change', function (e) {
        if ($(this).attr('id') == 'emmas_eprovinc') {

            $('#emmas_eamphur').empty().append('<option label="Choose one"></option>');
            $.Amphur_Get($(this).val(), "emmas_eamphur");
            $("#emmas_etumbol").val('').trigger('change');;
            $('#emmas_ezip').val('');

        } else if ($(this).attr('id') == 'salegrch_eprovinc2') {

            $('#salegrch_eamphur2').empty().append('<option label="Choose one"></option>');
            $.Amphur_Get($(this).val(), "salegrch_eamphur2");
            $("#salegrch_etumbol2").val('').trigger('change');;
            $('#salegrch_ezip2').val('');
        } else if ($(this).attr('id') == 'emmasaddr_eprovinc') {
            $('#emmasaddr_eamphur').empty().append('<option label="Choose one"></option>');
            $.Amphur_Get($(this).val(), "emmasaddr_eamphur");
            $("#emmasaddr_etumbol").val('').trigger('change');;
            $('#emmasaddr_ezip').val('');
        }

        e.preventDefault()
    })

    $(".amphur").on('change', function () {

        if ($(this).attr('id') == 'emmas_eamphur') {

            $('#emmas_etumbol').empty().append('<option label="Choose one"></option>');
            $.District_Get($(this).val(), 'emmas_etumbol');
            $('#emmas_ezip').val($('#emmas_eamphur option:selected').attr('data_zip'))

        } else if ($(this).attr('id') == 'salegrch_eamphur2') {

            $('#salegrch_etumbol2').empty().append('<option label="Choose one"></option>');
            $.District_Get($(this).val(), 'salegrch_etumbol2');
            $('#salegrch_ezip2').val($('#salegrch_eamphur2 option:selected').attr('data_zip'))

        } else if ($(this).attr('id') == 'emmasaddr_eamphur') {

            $('#emmasaddr_etumbol').empty().append('<option label="Choose one"></option>');
            $.District_Get($(this).val(), 'emmasaddr_etumbol');
            $('#emmasaddr_ezip').val($('#emmasaddr_eamphur option:selected').attr('data_zip'))

        }


    })

    $("#customer_delivery_route").on('change', function () {
        //$("#route option").remove();
        $.SubRoute_Get($(this).val());

    })

    $.ajax({
        url: Priority_Type_Get,
        type: 'GET',
        dataType: 'json', // added data type
        success: function (result) {
            $.each(result.data, function (key, item) {
                //alert(item.lov1)
                $('#emmas_etrans').append($('<option>', {
                    value: item.lov_code,
                    text: item.lov1
                }));
            })
        }
    });

    $("input.numbers").keypress(function (event) {
        return isNumber(event, this)
    });

    $("input.numbers").focus(function () {
        let this_val = $(this).val().replaceAll(',', '')
        $(this).val(this_val);
    });

    $("input.numbers").blur(function () {
        let this_val = $(this).val()
        $(this).val(numberWithCommas(this_val));
    });


    $('#modal-addcontact #contact_purpose_code').on('change', function () {
        if ($(this).val() != 'CUSTOM') {
            $('#contact_purpose_desc').val($('#contact_purpose_code option:selected').text())
            $('.purpose_desc').addClass('d-none');
        } else {
            $('#contact_purpose_desc').val('')
            $('.purpose_desc').removeClass('d-none');
        }
    })

};

$.List_cus_addr_187 = async function (cusitem) {
    cusData = []
    cusData = cusitem

    $('#modal-addr').on('hide.bs.modal', function () {
        $('#frm_customer').find('input, select').val('')
        $('#frm_customer').find('.default-switches').removeClass('on');
    });



    let url = new URL(customer_address187_list);

    url.search = new URLSearchParams({
        emmas_code: cusData['code'],
        mode: 'Search'
    });

    fetch(url).then(function (response) {
        return response.json();
    }).then(function (result) {
        //oTable.destroy();
        if (result.status === 'Error') {

            $.LoadingOverlay("hide");

            $("#global-loader").fadeOut("slow");

            swal({
                type: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
            }, function (isConfirmed) {
                if (isConfirmed) {

                    location.reload();

                }
            })


        } else {

            oTable_addr = $('#tbl-cus-list').DataTable({
                data: result.data,
                //scrollY: 700,
                //scrollX: true,
                autoWidth: false,
                scrollCollapse: true,
                paging: false,
                searching: false,
                info: false,
                destroy: true,
                columns: [
                    {
                        title: "<span style='font-size:11px;'>ลำดับ</span>",
                        width: "30px",
                        class: "tx-center",
                        //data: 'id',
                        render: function (data, type, row, meta) {
                            return (meta.row + 1);
                        }
                    },
                    {
                        title: "<span style='font-size:11px;'>ชื่อสถานที่จัดส่ง</span>",
                        width: "60px",
                        class: "tx-center",
                        data: "emmasaddr_location_name",
                        render: function (data, type, row, meta) {
                            return '<span style="font-size:11px;">' + data + '<span>'
                        }

                    },
                    {
                        title: "<div  class='tx-center'><span style='font-size:11px;'>ที่อยู่</span></div>",
                        width: "190px",
                        class: "tx-left",
                        data: "emmasaddr_eaddress",
                        render: function (data, type, row, meta) {

                            let subdistrict = row.emmasaddr_eprovinc_id == '1' ? ' แขวง' + row.emmasaddr_etumbol : ' ตำบล ' + row.emmasaddr_etumbol
                            let district = row.emmasaddr_eprovinc_id == '1' ? ' เขต' + row.emmasaddr_eamphur : ' อำเภอ ' + row.emmasaddr_eamphur
                            let provinc = row.emmasaddr_eprovinc_id == '1' ? ' ' + row.emmasaddr_eprovinc : ' จังหวัด' + row.emmasaddr_eprovinc
                            return '<span style="font-size:11px;">' + data + subdistrict + district + provinc + ' ' + row.emmasaddr_ezip + '</span>';
                        }
                    },
                    //{
                    //    title: "<span style='font-size:11px;'>จังหวัด</span>",
                    //    width: "80px",
                    //    class: "tx-center",
                    //    data: "eprovinc",
                    //    render: function (data, type, row, meta) {
                    //        if (data != '' && data != null) {

                    //            return '<span style="font-size:11px;">' + data + '</span>';

                    //        } else {
                    //            return '<span style="font-size:11px;">' + '-' + '</span>';

                    //        }
                    //    }
                    //},
                    //{
                    //    title: "<span style='font-size:11px;'>รหัสไปษณีย์</span>",
                    //    width: "80px",
                    //    class: "tx-center",
                    //    data: "ezip",
                    //    render: function (data, type, row, meta) {
                    //        return '<span style="font-size:11px;">' + data + '</span>';
                    //    }

                    //},
                    {
                        title: "<span style='font-size:11px;'>เรื่มต้น</span>",
                        width: "50px",
                        class: "tx-center",
                        data: "emmasaddr_edefault",
                        render: function (data, type, row, meta) {
                            if (data == 1) {
                                return "<span style='font-size: 15px;'><i class='tx-primary fas fa-check-square'></i></span>";
                            } else if (data == 0) {
                                return "<span style='font-size: 15px;'><i class='tx-primary far fa-square'></i></span>";

                            }
                        }

                    },
                    {
                        title: "<span style='font-size:11px;'>ขนส่งเอกชน</span>",
                        width: "50px",
                        class: "tx-center ",
                        orderable: false,
                        data: "item_trp",
                        render: function (data, type, row, meta) {
                            return data > 0 ? '<i style="font-size: 18px;" class="si si si-plus show-detail tx-primary dt-control"></i>' : '<i style="font-size: 18px;" class="si si si-plus show-detail tx-secondary"></i>';
                        }

                    },
                    //{
                    //    title: "<span style='font-size:11px;'>จัดการ</span>",
                    //    width: "50px",
                    //    class: "tx-center",
                    //    data: "id",
                    //    visible: false,
                    //    render: function (data, type, row, meta) {
                    //        let data_row = JSON.stringify(row)
                    //        if (row.record_status == '1') {
                    //            return "<a type='button' style='margin: 0 5px 0 5px;' class='btn btn-lg action btn-circle btn-info' data-id='" + data + " 'data-toggle='dropdown'> <i style='color:#ecf0fa;' class='fas fa-edit'></i></a><div class='dropdown-menu'><a  class='dropdown-item btn-action' data-row='" + data_row + "' data-action='view' style='cursor: pointer;'>View<input type='file' style='display: none;' multiple=''></a><a  class='dropdown-item btn-action' data-row='" + data_row + "' data-action='edit' style='cursor: pointer;'>Edit<input type='file' style='display: none;' multiple=''></a></div></div><a style='margin: 0 5px 0 5px;' type='button' class='btn btn-lg action btn-circle btn-danger btn-action' data-row='" + data_row + "'data-action='delete'><i style='color:#ecf0fa;' class='fa fa-trash'></i></a>"
                    //        } else if (row.record_status == 'delete') {
                    //            return "<a type='button' style='margin: 0 5px 0 5px;' class='btn btn-lg action btn-circle btn-info' data-id='" + data + " 'data-toggle='dropdown'> <i style='color:#ecf0fa;' class='fas fa-edit'></i></a><div class='dropdown-menu'><a  class='dropdown-item btn-action' data-row='" + data_row + "' data-action='view' style='cursor: pointer;'>View<input type='file' style='display: none;' multiple=''></a><a  class='dropdown-item btn-action' data-row='" + data_row + "' data-action='edit' style='cursor: pointer;'>Edit<input type='file' style='display: none;' multiple=''></a></div></div>"
                    //        }
                    //    }
                    //}

                ],

                "order": [[0, "asc"]],
                "initComplete": function (settings, json) {

                    $("#global-loader").fadeOut("slow");

                    $.contextMenu({
                        selector: '#tbl-cus-list tbody tr',
                        callback: function (key, options) {

                            let addrcitem = oTable_addr.row(this).data();

                            if (key === 'view') {

                                $.DetailsAddr_187(addrcitem, cusData);  //kung edit 2021-12-28

                            } else if (key === 'edit') {

                                $.EditAddr(addrcitem, cusData); //kung edit 2021-12-28

                            } else if (key === 'delete') {

                                $.DeleteAddr(addrcitem, cusData);  //kung edit 2021-12-28

                            } else if (key === 'trp') {

                                $.List_Delivery(addrcitem, cusData);  //kung edit 2021-12-28

                            } else {

                                alert('ERROR');

                            }

                        },
                        items: {
                            "view": { name: "View", icon: "fas fa-search" },
                            "edit": { name: "Edit", icon: "edit" },
                            "delete": { name: "Delete", icon: "delete" },
                            "sep1": "---------",
                            "trp": { name: "ขนส่งเอกชน", icon: "fas fa-truck" }
                        }

                    });

                    $('.dt-control').hover(function () {
                        $(this).css('cursor', 'pointer');
                    });

                    $('#tbl-cus-list tbody').off('click').on('click', 'td i.dt-control', function () {
                        var tr = $(this).closest('tr');
                        var row = oTable_addr.row(tr);

                        //alert(row.child.isShown())
                        if (row.child.isShown()) {
                            // This row is already open - close it
                            row.child.hide();
                            tr.removeClass('shown');
                        } else {
                            // Open this row
                            //let Tabletwo = Tabletwo(row.data())

                            let data = row.data();

                            var thead = '<tr class="table-primary">' + "<th class='tx-center border-bottom-0'>#</th>" +
                                "<th class='border-bottom-0 tx-center'>ชื่อขนส่งเอกชน</th>" +
                                "<th class='border-bottom-0 tx-center'>ชำระค่าขนส่ง</th>" +
                                "<th class='border-bottom-0 tx-center'>สายส่ง (Route)</th>" +
                                "<th class='border-bottom-0 tx-center'>สายส่งย่อย (Sub Route)</th>" +
                                "<th class='border-bottom-0 tx-center'>เรื่มต้น</th>" + "</tr>";

                            fetch(customer_setup_trp_get + '?emmas_addr_id=' + data.emmasaddr_id + '&emmas_code=' + data.emmasaddr_emmas_code + '&mode=Search&record_status=1').then(function (response) {
                                return response.json();
                            }).then(function (result) {

                                var tbody = '';
                                var tdefault = '';
                                var lov_deliverycost_code = '';



                                $.each(result.data, function (key, val) {

                                    tdefault = val.tdefault == 1 ? "<span style='font-size: 15px;'><i class='tx-primary fas fa-check-square'></i></span>" : "<span style='font-size: 15px;'><i class='tx-primary far fa-square'></i></span>";
                                    lov_deliverycost_code = val.tdefault == 1 ? '<span style="font-size:11px;"> ต้นทาง </span>' : '<span style="font-size:11px;"> ปลายทาง </span>';
                                    let lov_route_name = val.lov_route_name != null ? val.lov_route_name : '-'
                                    tbody += '<tr class="table-secondary">' +
                                        "<td class='tx-center'>" + (key + 1) + "</td>" +
                                        "<td>" + val.name + "</td>" +
                                        "<td>" + lov_deliverycost_code + "</td>" +
                                        "<td>" + val.lov_zone_code + "</td>" +
                                        "<td>" + lov_route_name + "</td>" +
                                        "<td class='tx-center'>" + tdefault + "</td>" +
                                        "</tr>";

                                    //    tbody += '<tr>' +
                                    //        '<td>ชื่อขนส่งเอกชน:</td>' +
                                    //        '<td>' + val.name + '</td>' +
                                    //        '</tr>' +
                                    //        '<tr>' +
                                    //        '<td>ชำระค่าขนส่ง:</td>' +
                                    //        '<td>' + val.lov_deliverycost_code + '</td>' +
                                    //        '</tr>' +
                                    //        '<tr>' +
                                    //        '<td>Zone:</td>' +
                                    //        '<td>' + val.lov_zone_code + '</td>' +
                                    //        '</tr>' +
                                    //        '<tr>' +
                                    //        '<td>พื้นที่:</td>' +
                                    //        '<td>' + val.lov_route_name + '</td>' +
                                    //        '</tr>' +
                                    //        '<tr>' +
                                    //        '<td>เรื่มต้น:</td>' +
                                    //        '<td>' + val.tdefault + '</td>' +
                                    //        '</tr>';

                                })

                                row.child('<div class="table-responsive"><table class="table table-bordered">' + thead + tbody + '</table></div>').show();
                                tr.addClass('shown');
                                //return '<table class="table text-md-nowrap">' + thead + tbody + '</table>'

                                $('#tbl-cus-list table').bind("contextmenu", function () {
                                    return false;
                                });

                            })



                            //console.log('row.data',row.data())

                        }
                    });

                },

            });

        }
    })

};


$.List_TRP = async function (cusitem) {  //kung edit 2021-12-28

    let url = new URL(customer_setup_trp_get);

    url.search = new URLSearchParams({
        emmas_code: cusitem['code'],  //kung edit 2021-12-28
        record_status: '1',
        mode: 'Search'

    });

    fetch(url).then(function (response) {
        return response.json();
    }).then(function (result) {
        //oTable.destroy();
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
            }) //kung edit 2021-12-28



        } else {

            //$('#tbl-trp-list').destroy();

            oTable_trp = $('#tbl-trp-list').DataTable({
                data: result.data,
                //scrollY: 700,
                //scrollX: true,
                autoWidth: false,
                scrollCollapse: false,
                paging: false,
                searching: false,
                info: false,
                destroy: true,
                columns: [
                    {
                        title: "<span style='font-size:11px;'>ลำดับ</span>",
                        width: "30px",
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            return (meta.row + 1);
                        }

                    }, //0

                    {
                        title: "<span style='font-size:11px;'>ชื่อขนส่งเอกชน</span>",
                        data: "name",
                        width: "150px",
                        //visible: false,
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            if (data != null) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            } else {
                                return '<span style="font-size:11px;">' + '-' + '</span>';
                            }
                        }
                    }, //1

                    {
                        title: "<span style='font-size:11px;'>ชำระค่าขนส่ง</span>",
                        data: "lov_deliverycost_code",
                        width: "70px",
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            if (data == 1) {
                                return '<span style="font-size:11px;"> ต้นทาง </span>';
                            } else if (data == 2) {
                                return '<span style="font-size:11px;"> ปลายทาง </span>';

                            }
                        }
                    }, //2
                    {
                        title: "<span style='font-size:11px;'>Zone</span>",
                        data: "lov_zone_code",
                        width: "70px",
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            if (data != null) {
                                return '<span style="font-size:11px;">' + data.replace("Z0", ""); + '</span>';
                            } else {
                                return '<span style="font-size:11px;">' + '-'; + '</span>';
                            }
                        }
                    }, //3
                    {
                        title: "<span style='font-size:11px;'>พื้นที่</span>",
                        data: "lov_route_name",
                        width: "50px",
                        class: "tx-center",
                        render: function (data, type, row, meta) {

                            return '<span style="font-size:11px;">' + data != null ? data : '' + '</span>';

                        }
                    }, //4
                    {
                        title: "<span style='font-size:11px;'>เริ่มต้น</span>",
                        data: "tdefault",
                        width: "50px",
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            if (data == 1) {
                                return '<input type="checkbox" class="editor-active" checked>';
                            } else if (data == 0) {
                                return '<input type="checkbox" class="editor-active">';

                            }
                            //return '<span style="font-size:11px;">' + data + '</span>';

                        }, //5
                    },

                    //{
                    //    title: "<span style='font-size:11px;'>จัดการ</span>",
                    //    class: "tx-center",
                    //    css: 'style="border-top-width: auto;',
                    //    data: "id",
                    //    width: "50px",
                    //    visible: false,
                    //    render: function (data, type, row, meta) {
                    //        let data_row = JSON.stringify(row)
                    //        if (row.record_status == '1') {
                    //            return "<a type='button' style='margin: 0 5px 0 5px;'  class='btn btn-lg action btn-circle btn-info' data-id='" + data + " 'data-toggle='dropdown'> <i style='color:#ecf0fa;' class='fas fa-edit'></i></a><div class='dropdown-menu'><a  class='dropdown-item btn-action' data-row='" + data_row + "' data-action='view'>View<input type='file' style='display: none;' multiple=''></a><a  class='dropdown-item btn-action' data-row='" + data_row + "' data-action='edit'>Edit<input type='file' style='display: none;' multiple=''></a></div></div><a type='button' class='btn btn-lg btn-circle btn-danger btn-action' data-row='" + data_row + "'data-action='delete' style='color:red'><i style='color:#ecf0fa;' class='fa fa-trash'></i></a>"
                    //        } else if (row.record_status == 'delete') {
                    //            return "<a type='button' style='margin: 0 5px 0 5px;'  class='btn btn-lg action btn-circle btn-info' data-id='" + data + " 'data-toggle='dropdown'> <i style='color:#ecf0fa;' class='fas fa-edit'></i></a><div class='dropdown-menu'><a  class='dropdown-item btn-action' data-row='" + data_row + "' data-action='view'>View<input type='file' style='display: none;' multiple=''></a><a  class='dropdown-item btn-action' data-row='" + data_row + "' data-action='edit'>Edit<input type='file' style='display: none;' multiple=''></a></div></div>"
                    //        }
                    //    }
                    //}, //6
                ],


                "order": [[0, "asc"]],
                "initComplete": function (settings, json) {

                    // $.LoadingOverlay("hide");

                    $("#global-loader").fadeOut("slow");

                    //$('#tbl-trp-list tbody tr').hover(function () {
                    //    $(this).css('cursor', 'pointer');
                    //});
                    //$('#tbl-trp-list .btn-action').click(function () {
                    //    let id = $().data('id');
                    //    let data = $(this).data('row');
                    //    //let data_obj = $.parseJSON(data);

                    //    if ($(this).data('action') == "view") {
                    //        $.Details_Trp(data);
                    //    } else if ($(this).data('action') == "edit") {
                    //        $.Edit_Trp(data);
                    //    } else if ($(this).data('action') == "delete") {
                    //        $.Delete_Trp(data);
                    //        //} else {
                    //        //    alert($(this).data('action'));
                    //    }
                    //});

                },
            });
        }
    })
}


$.List = async function (mode) {

    $.LoadingOverlay("show", {
        image: '',
        custom: customElement
    });

    let url = new URL(customer_list);

    url.search = new URLSearchParams({

        salechannel: '',

    });

    fetch(url).then(function (response) {
        return response.json();
    }).then(function (result) {

        if (mode === 'search' && result.length === 0) {

            toastr.error('ไม่พบข้อมูลค้นหา !');

            //$.addLogError('', 'VSM', 'search', url_location, 'error');

        } else if (mode === 'search' && result.length > 0) {

            //$.addLogEvent('', 'VSM', 'search', url_location, 'ok');
        }

        oTable = $('#tbl-list').DataTable({
            data: result.data,
            scrollY: "394px",
            scrollX: true,
            scrollCollapse: true,
            autoWidth: true,
            paging: true,
            dom: 'Bfrtip',
            colReorder: true,
            //stateSave: true,
            bDestroy: true,
            lengthMenu: [
                [10, 25, 50, -1],
                ['10 rows', '25 rows', '50 rows', 'Show all']
            ],
            buttons: [
                'pageLength', 'copy', 'excel'
            ],
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
                    data: "salegroup",
                    width: "80px",
                    class: "tx-center",

                },
                {
                    title: "<center>Channel</center>",
                    data: "salechannel",
                    width: "80px",
                    class: "tx-center",

                },
                {
                    title: "<center>Sale person</center>",
                    data: "salerepresentative",
                    width: "100px",

                },
                {
                    title: "<center>ชื่อลูกค้า (ไม่แยกสาขา)</center>",
                    data: "customername_with_no_branch",
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
                    data: "eprovinc",
                    width: "100px",
                },
                {
                    title: "<center>รหัสไปรษณีย์</center>",
                    data: "ezip",
                    width: "80px",
                },
            ],
            "order": [[0, "asc"]],
            "initComplete": function (settings, json) {

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

                            $.Details(citem);

                            $('#customerinfo').find('input').prop("disabled", true);
                            $('#customerinfo').find('select').prop("disabled", true);
                            $('#customerinfo').find('textarea').prop("disabled", true);
                            $('#customerinfo').find('.not_use').prop("disabled", true);

                            $('#saleinfo').find('input, select, textarea, .not_use').prop("disabled", true);

                            $('#accountinfo').find('input, select, textarea, .not_use').prop("disabled", true);

                            $('#deliveryinfo').find('input').prop("disabled", true);
                            $('#deliveryinfo').find('select').prop("disabled", true);
                            $('#deliveryinfo').find('textarea').prop("disabled", true);
                            $('#deliveryinfo').find('.not_use').prop("disabled", true);

                            $('#contactinfo').find('input').prop("disabled", true);
                            $('#contactinfo').find('select').prop("disabled", true);
                            $('#contactinfo').find('textarea').prop("disabled", true);
                            $('#contactinfo').find('.not_use').prop("disabled", true);


                            $('.btn-save_form').hide();
                            $('.btn-save_form').prop('disabled', true);
                            //$.addLogEvent(citem['code'], 'VSM', 'view', url_location, 'ok');

                        } else if (key === 'edit') {

                            $.Details(citem);
                            $.CreateContact(citem);
                            $.CreateOwner(citem);
                            $.CreateBankAccount(citem);
                            //$('#Purpose_code').select2();


                            $('#customerinfo').find('input').prop("disabled", false);
                            $('#customerinfo').find('select').prop("disabled", false);
                            $('#customerinfo').find('textarea').prop("disabled", false);
                            $('#customerinfo').find('.not_use').prop("disabled", false);

                            $('#saleinfo .sale-info').find('input, select, textarea, .not_use').prop("disabled", true);
                            $('#saleinfo .sale-traget').find('input, select, textarea, .not_use').prop("disabled", false);

                            $('#accountinfo').find('input, select, textarea, .not_use').prop("disabled", true);

                            $('#deliveryinfo').find('input').prop("disabled", false);
                            $('#deliveryinfo').find('select').prop("disabled", false);
                            $('#deliveryinfo').find('textarea').prop("disabled", false);
                            $('#deliveryinfo').find('.not_use').prop("disabled", false);

                            $('#contactinfo').find('input').prop("disabled", false);
                            $('#contactinfo').find('select').prop("disabled", false);
                            $('#contactinfo').find('textarea').prop("disabled", false);
                            $('#contactinfo').find('.not_use').prop("disabled", false);


                            $('.btn-save_form').show();
                            $('.btn-save_form').prop('disabled', false);

                            setTimeout(function () {
                                $.Update(citem);
                            }, 300);

                            //$.addLogEvent(citem['code'], 'VSM', 'view', url_location, 'ok');

                        } else if (key === 'delete') {

                            //$.Details(citem);
                            //$.Delete(citem);

                        }
                        else if (key === 'create') {

                            /* $.Create();*/

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

        $.LoadingOverlay("hide");
        //$('#tbl-trp-list').destroy();

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

    $(".modal-body").LoadingOverlay("show", {
        image: '',
        custom: customElement
    });

    $.List_TRP(citem); //kung edit 2021-12-28
    $.List_cus_addr_187(citem);
    $.CreateAddr_187(citem);


    //$('#customerinfo').find('input').prop("disabled", true);
    //$('#customerinfo').find('select').prop("disabled", true);
    //$('#customerinfo').find('textarea').prop("disabled", true);
    //$('#customerinfo').find('.not_use').prop("disabled", true);

    $('#saleinfo').find('input').prop("disabled", true);
    $('#saleinfo').find('select').prop("disabled", true);
    $('#saleinfo').find('textarea').prop("disabled", true);
    $('#saleinfo').find('.not_use').prop("disabled", true);

    //$('#deliveryinfo').find('input').prop("disabled", true);
    //$('#deliveryinfo').find('select').prop("disabled", true);
    //$('#deliveryinfo').find('textarea').prop("disabled", true);
    //$('#deliveryinfo').find('.not_use').prop("disabled", true);

    $('#saletargetcsum1_salestarget_year').off('change').on('change', function (e) {
        e.preventDefault();
        $.SaleTarget_187_Get(citem['code'], $(this).val())
    })

    $('#frm_data').find('.modal-title').html("Customer Profile : " + citem['code'] + ' ' + citem['lname']);

    $('#contactinfo').find('#btn_addcontact').on('click', function () {

        $('#modal-addcontact').modal({

            keyboard: false,
            backdrop: 'static'

        });

        $('#btn-item-create').removeClass('d-none')
        $('#btn-edit').addClass('d-none')

        return false;
    });

    $('#deliveryinfo').find('#btn_addaddress').on('click', function () {

        $('#modal-addr').modal({

            keyboard: false,
            backdrop: 'static'

        });

        $('#btn-item-create').removeClass('d-none')
        $('#btn-edit').addClass('d-none')

        $('#frm_customer').val('').trigger('change')
        $('#frm_customer').find('.default-switches').removeClass('on');
        $('#frm_customer select').val('').trigger('change')

        return false;

    });

    $('#customerinfo').find('#btn_addowner').on('click', function () {

        $('#frm_owner input').trigger('change').val('');
        $('#frm_owner input').removeClass('parsley-success');

        $('#modal-owner').modal({
            keyboard: false,
            backdrop: 'static'
        });

        $('#btn-owner-create').removeClass('d-none')
        $('#btn-owner-edit').addClass('d-none')

        //$('#frm_owner').val('').trigger('change')
        //$('#frm_owner').find('.default-switches').removeClass('on');
        //$('#frm_owner select').val('').trigger('change')

        return false;

    });

    $('#accountinfo').find('#btn_addbankaccount').on('click', function () {

        $('#frm_bankaccount input').trigger('change').val('');
        $('#frm_bankaccount input').removeClass('parsley-success');

        $('#modal-bankaccount').modal({
            keyboard: false,
            backdrop: 'static'
        });

        $('#btn-bankaccount-create').removeClass('d-none')
        $('#btn-bankaccount-edit').addClass('d-none')

        //$('#frm_owner').val('').trigger('change')
        //$('#frm_owner').find('.default-switches').removeClass('on');
        //$('#frm_owner select').val('').trigger('change')

        return false;

    });

    $('.btn-save_form').hide();

    fetch(customer_contact_get + '?item_code=' + citem['code']).then(function (response) {
        return response.json();
    }).then(function (result) {
        if (result.data.length == 0) {
            $('#frm-contact-info').html('<span tx-center>ไม่พบข้อมูลในระบบ </span>')
        } else {

            $.Contact_Detail_Get(result.data);
        }
    });

    $.Customer_Get(citem['code']);
    $.SaleTarget_187_Get(citem['code'], current_year);
    $.Customer_189_Get(citem['code']);

    fetch(customer_owner_get + '?item_code=' + citem['code']).then(function (response) {
        return response.json();
    }).then(function (result) {
        if (result.data.length == 0) {
            $('#frm-owner-info').html('<span tx-center>ไม่พบข้อมูลในระบบ </span>')
        } else {
            $.Owner_Detail_Get(result.data);
        }
    });

    fetch(customer_bankaccount_get + '?item_code=' + citem['code']).then(function (response) {
        return response.json();
    }).then(function (result) {
        if (result.data.length == 0) {
            $('#frm-bankaccount-info').html('<span tx-center>ไม่พบข้อมูลในระบบ </span>')
        } else {
            $.BankAccount_Detail_Get(result.data);
        }
    });

};


$.Update = async function (citem) {

    $("#btn-save_exit").show()

    $(".btn-save_form").on('click', async function (e) {

        let submit_action = $(this).data('action');

        e.preventDefault();

        //$('#frm_data').parsley().validate();

        //if ($('#frm_data').parsley().isValid()) {

        swal({
            title: "Are you sure?",
            text: "This information will be saved immediately.",
            type: "warning",
            showCancelButton: true,
            canceButtonClass: "btn-danger",
            confirmButtonText: "Confirm saved!",
            cancelButtonText: "Cancel!",
            cancelButtonColor: '#ee335e',
            closeOnConfirm: false,
            closeOnCancel: true

        }, function (isConfirm) {

            if (isConfirm) {


                $.Customer_Update(citem['code']);
                $.SaleTarget_Update(citem['code']);

                if (submit_action === "save_exit") {

                    $('#modal-frm_data').modal('hide');

                } else if (submit_action === "save_new") {

                    $.Details(citem);
                    $.CreateContact(citem);
                    $.CreateOwner(citem);
                    $.CreateBankAccount(citem);

                    $('#customerinfo').find('input').prop("disabled", false);
                    $('#customerinfo').find('select').prop("disabled", false);
                    $('#customerinfo').find('textarea').prop("disabled", false);
                    $('#customerinfo').find('.not_use').prop("disabled", false);

                    $('#saleinfo .sale-info').find('input, select, textarea, .not_use').prop("disabled", true);
                    $('#saleinfo .sale-traget').find('input, select, textarea, .not_use').prop("disabled", false);

                    $('#accountinfo').find('input, select, textarea, .not_use').prop("disabled", true);

                    $('#deliveryinfo').find('input').prop("disabled", false);
                    $('#deliveryinfo').find('select').prop("disabled", false);
                    $('#deliveryinfo').find('textarea').prop("disabled", false);
                    $('#deliveryinfo').find('.not_use').prop("disabled", false);

                    $('#contactinfo').find('input').prop("disabled", false);
                    $('#contactinfo').find('select').prop("disabled", false);
                    $('#contactinfo').find('textarea').prop("disabled", false);
                    $('#contactinfo').find('.not_use').prop("disabled", false);

                    $('.btn-save_form').show();
                    $('.btn-save_form').prop('disabled', false);


                } else {

                    toastr.error('Error writing document');

                }


            }
            //else {

            //    swal("Cancelled", "Your imaginary file is safe :)", "error");

            //}

        });

        //}
    });

}

$.Customer_Update = async function (emmas_code) {

    var citem_customerbankaccount_list = [];
    $.each($('#salegrch_banklist').find("option:selected"), function () {
        citem_customerbankaccount_list.push($(this).val());
    });
    var salegrch_banklist = citem_customerbankaccount_list.join(",");

    console.log("salegrch_banklist", salegrch_banklist);

    let update_data = {

        emmas_code: emmas_code,
        //>>Tab 1 - Customer Info
        //salegrch_grouprank: $('#customerinfo').find('#salegrch_grouprank').val(),
        emmas_etel: $('#customerinfo').find('#emmas_etel').val(),
        emmas_efax: $('#customerinfo').find('#emmas_efax').val(),
        emmas_etran: $('#customerinfo').find('#emmas_etran').val(),
        emmas_edescript: $('#customerinfo').find('#emmas_edescript').val(),
        emmas_eregdate: $.DateToDB($('#customerinfo').find('#emmas_eregdate').val()),
        emmas_eOwn3: $('#customerinfo').find('#emmas_eOwn3').val(), /*ทุนจดทะเบียน*/
        //emmas_eOwn0: $('#customerinfo').find('#emmas_eOwn0').val(), 
        //salegrch_idcardno: $('#customerinfo').find('#salegrch_idcardno').val(),

        //emmas_eaddress: $('#customerinfo').find('#emmas_eaddress').val(),
        salegrch_customer_houseno: $('#customerinfo').find('#salegrch_customer_houseno').val(),
        salegrch_customer_villageno: $('#customerinfo').find('#salegrch_customer_villageno').val(),
        salegrch_customer_village: $('#customerinfo').find('#salegrch_customer_village').val(),
        salegrch_customer_lane: $('#customerinfo').find('#salegrch_customer_lane').val(),
        salegrch_customer_streetname: $('#customerinfo').find('#salegrch_customer_streetname').val(),
        emmas_etumbol: $('#customerinfo').find('#emmas_etumbol :selected').text(),
        emmas_eamphur: $('#customerinfo').find('#emmas_eamphur :selected').text(),
        emmas_eprovinc: $('#customerinfo').find('#emmas_eprovinc :selected').text(),
        emmas_ezip: $('#customerinfo').find('#emmas_ezip').val(),

        //salegrch_eaddress2: $('#customerinfo').find('#salegrch_eaddress2').val(),
        salegrch_customer_houseno2: $('#customerinfo').find('#salegrch_customer_houseno2').val(),
        salegrch_customer_villageno2: $('#customerinfo').find('#salegrch_customer_villageno2').val(),
        salegrch_customer_village2: $('#customerinfo').find('#salegrch_customer_village2').val(),
        salegrch_customer_lane2: $('#customerinfo').find('#salegrch_customer_lane2').val(),
        salegrch_customer_streetname2: $('#customerinfo').find('#salegrch_customer_streetname2').val(),
        salegrch_etumbol2: $('#customerinfo').find('#salegrch_etumbol2 :selected').text(),
        salegrch_eamphur2: $('#customerinfo').find('#salegrch_eamphur2 :selected').text(),
        salegrch_eprovinc2: $('#customerinfo').find('#salegrch_eprovinc2 :selected').text(),
        salegrch_ezip2: $('#customerinfo').find('#salegrch_ezip2').val(),

        emmas_etrans: $('#deliveryinfo').find('#emmas_etrans').val(), /*Priority_Type*/
        salegrch_delivery_stdtime: $('#deliveryinfo').find('#salegrch_delivery_stdtime').val().replaceAll(',', ''),
        salegrch_banklist: salegrch_banklist,
        created_by: user_id,

    };

    var params = [];
    for (const i in update_data) {
        params.push(i + "=" + encodeURIComponent(update_data[i]));
    }

    //187 ใช้เทสระบบ
    //production ใช้ 186 เปลี่ยนเป็น url url_customer_update_186

    fetch(url_customer_update_187, {
        method: 'PUT', // *GET, POST, PUT, DELETE, etc.
        // mode: 'no-cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: params.join("&"),
    }).then(result => {
        return result.json();
    }).then(result => {

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



        }

    }).catch(error => {

        toastr.error('Error, Please contact administrator.');

    });
}

$.SaleTarget_Update = async function (emmas_code) {

    let update_data = {

        emmas_code: emmas_code,
        saletargetcsum1_salestarget_year: $('#saleinfo').find('#saletargetcsum1_salestarget_year').val().replaceAll(',', ''),
        saletargetc_salestarget_m01_input: $('#saleinfo').find('#saletargetc_salestarget_m01_input').val().replaceAll(',', ''),
        saletargetc_salestarget_m02_input: $('#saleinfo').find('#saletargetc_salestarget_m02_input').val().replaceAll(',', ''),
        saletargetc_salestarget_m03_input: $('#saleinfo').find('#saletargetc_salestarget_m03_input').val().replaceAll(',', ''),
        saletargetc_salestarget_m04_input: $('#saleinfo').find('#saletargetc_salestarget_m04_input').val().replaceAll(',', ''),
        saletargetc_salestarget_m05_input: $('#saleinfo').find('#saletargetc_salestarget_m05_input').val().replaceAll(',', ''),
        saletargetc_salestarget_m06_input: $('#saleinfo').find('#saletargetc_salestarget_m06_input').val().replaceAll(',', ''),
        saletargetc_salestarget_m07_input: $('#saleinfo').find('#saletargetc_salestarget_m07_input').val().replaceAll(',', ''),
        saletargetc_salestarget_m08_input: $('#saleinfo').find('#saletargetc_salestarget_m08_input').val().replaceAll(',', ''),
        saletargetc_salestarget_m09_input: $('#saleinfo').find('#saletargetc_salestarget_m09_input').val().replaceAll(',', ''),
        saletargetc_salestarget_m10_input: $('#saleinfo').find('#saletargetc_salestarget_m10_input').val().replaceAll(',', ''),
        saletargetc_salestarget_m11_input: $('#saleinfo').find('#saletargetc_salestarget_m11_input').val().replaceAll(',', ''),
        saletargetc_salestarget_m12_input: $('#saleinfo').find('#saletargetc_salestarget_m12_input').val().replaceAll(',', ''),

        saletargetc_rebatestarget_q1_input: $('#saleinfo').find('#saletargetc_rebatestarget_q1_input').val().replaceAll(',', ''),
        saletargetc_rebatestarget_q2_input: $('#saleinfo').find('#saletargetc_rebatestarget_q2_input').val().replaceAll(',', ''),
        saletargetc_rebatestarget_q3_input: $('#saleinfo').find('#saletargetc_rebatestarget_q3_input').val().replaceAll(',', ''),
        saletargetc_rebatestarget_q4_input: $('#saleinfo').find('#saletargetc_rebatestarget_q4_input').val().replaceAll(',', ''),

        created_by: user_id,

    };

    var params = [];
    for (const i in update_data) {
        params.push(i + "=" + encodeURIComponent(update_data[i]));
    }

    fetch(url_saletarget187_update, {
        method: 'PUT', // *GET, POST, PUT, DELETE, etc.
        // mode: 'no-cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: params.join("&"),
    }).then(result => {
        return result.json();
    }).then(result => {

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



        }

    }).catch(error => {

        toastr.error('Error, Please contact administrator.');

    });
}

$.CreateContact = async function (citem) {

    $('#frm_addcontact').parsley().on('form:submit', function () {

        $('.btn-save_form').prop('disabled', true);

        let add_data = {
            code: citem['code'],
            contactnumber: $('#contact_number').val(),
            contactname: $('#contact_name').val(),
            extension: $('#contact_extension').val(),
            purpose_code: $('#contact_purpose_code').val(),
            purpose_desc: $('#contact_purpose_desc').val(),
            description: $('#contact_description').val(),
            record_status: 1,
            created_by: user_id,
            pMessage: ''
        };

        var params = [];
        for (const i in add_data) {
            params.push(i + "=" + encodeURIComponent(add_data[i]));
        }

        fetch(customer_contact_create, {
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
                    $('.btn-save_form').prop('disabled', false);

                    $('#frm-contact-info div, #frm-contact-info span').remove();

                    $.Contact_Detail_Get(data.data);

                    //$.each(data.data, function (key, val) {

                    //    let classShow = key > 0 ? 'd-none' : 'show'
                    //    let margin = key > 0 ? 'mg-t-15' : 'mg-t-20'

                    //    $('#frm-contact-info').append('<div class="row row-sm ' + margin + '"><div class="col-lg col-lg-2">'
                    //        + '<label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Contact number</label>'
                    //        + '<input class="form-control form-control-sm" placeholder="Contact number" type="text" id="" style="margin-top: -3px;" value="' + val['contactnumber'] + '" readonly></div>'
                    //        + '<div class="col-lg col-lg-1 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Extension</label>'
                    //        + '<input class="form-control form-control-sm" placeholder="Extension" type="text" id="" style="margin-top: -3px;" value="' + val['extension'] + '" readonly></div>'
                    //        + '<div class="col-lg col-lg-3 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Purpose</label>'
                    //        + '<input class="form-control form-control-sm" placeholder="Purpose" type="text" id="" style="margin-top: -3px;" value="' + val['purpose_code'] + '" readonly></div>'
                    //        + '<div class="col-lg col-lg-6 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Description</label>'
                    //        + '<input class="form-control form-control-sm" placeholder="Description" type="text" id="" style="margin-top: -3px;" value="' + val['description'] + '" readonly></div></div>');

                    //})

                    $('#modal-addcontact').modal('hide');

                });
            }

        }).catch((error) => {
            toastr.error(error, 'Error writing document');
            console.log('Error:', error);
        });


        return false;

    });


};

$.CreateAddr_187 = async function (cusitem) {

    $('#btn-item-create').off().on('click', function (e) {
        e.preventDefault();

        let submit_action = $(this).data('action');

        $('#frm_customer').parsley().validate();

        if ($('#frm_customer').parsley().isValid()) {
            $("#global-loader").fadeIn("slow");

            $('.btn-save_form').prop('disabled', true);

            // Model & Repo ไปเปลี่ยนเอาเอง
            let add_data = {
                emmasaddr_emmas_code: cusitem['code'],
                emmasaddr_location_name: $('#emmasaddr_location_name').val(),
                emmasaddr_eaddress: $('#emmasaddr_eaddress').val(),
                emmasaddr_etumbol: $('#emmasaddr_etumbol').val(),
                emmasaddr_eamphur: $('#emmasaddr_eamphur').val(),
                emmasaddr_eprovinc: $('#emmasaddr_eprovinc').val(),
                emmasaddr_ezip: $('#emmasaddr_ezip').val(),
                emmasaddr_edefault: $('#frm_customer .default-switches').hasClass("on") == true ? 1 : 0,
                //record_status: $("#record_status_1").is(":checked") === true ? '1' : '0',
                record_status: '1',
                created_by: user_id,
                pMessage: '',
            };

            var params = [];
            for (const i in add_data) {
                params.push(i + "=" + encodeURIComponent(add_data[i]));
            }

            fetch(customer_address187_create, {
                method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                // mode: 'no-cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: params.join("&"),
            }).then(data => {
                return data.json();
            }).then(data => {
                $("#global-loader").fadeOut("slow");

                if (data.status === 'Error') {
                    toastr.error(data.error_message);

                } else {

                    toastr.success('Save Successfully!', async function () {
                        $('#frm_customer').find('input,select').val('');
                        $('#frm_customer').find('.parsley-success').removeClass('parsley-success');
                        $('#frm_customer').find('.default-switches').removeClass('on');
                        //$('#frm_customer').find('select, input:radio').attr('disabled', true);
                        //$(".province option").remove();
                        //$(".amphur option").remove();
                        //$(".district option").remove();
                        $.List_cus_addr_187(cusitem);
                        $('#modal-addr').modal('hide')
                        $('.btn-save_form').prop('disabled', false) //kung edit 2021-12-28

                    });
                }

            }).catch((error) => {
                toastr.error(error, 'Error writing document');
                console.log('Error:', error);
            });

            return false;

        }

    });

};

$.DetailsAddr_187 = async function (citem, cusitem) {

    $('#modal-addr').modal({

        keyboard: false,
        backdrop: 'static'

    });

    $('.btn-save-addr').prop('disabled', true);
    $('#btn-item-create').removeClass('d-none');
    $('#btn-edit').addClass('d-none');

    $('#frm_customer').find('input, textarea').attr('readonly', true);
    $('#frm_customer').find('select, input:radio').attr('disabled', true);

    $('#emmasaddr_eaddress').val(citem['emmasaddr_eaddress']);
    $('#emmasaddr_eprovinc').val(citem['emmasaddr_eprovinc_id']).trigger('change');

    $('#emmasaddr_location_name').val(citem['emmasaddr_location_name']);

    setTimeout(function () {
        $('#emmasaddr_eamphur').val(citem['emmasaddr_eamphur_id']).trigger('change');

        setTimeout(function () {
            $('#emmasaddr_etumbol').val(citem['emmasaddr_etumbol_id']).trigger('change');
        }, 100);
    }, 300);

    $('#emmasaddr_ezip').val(citem['emmasaddr_ezip']);
    citem['emmasaddr_edefault'] == '1' ? $('#frm_customer .default-switches').addClass('on') : $('#frm_customer .default-switches').removeClass('on');


};

$.EditAddr = async function (citem, cusitem) {
    $.DetailsAddr_187(citem, cusitem);

    $('.btn-save-addr').prop('disabled', false);
    $('#btn-item-create').addClass('d-none');
    $('#btn-edit').removeClass('d-none');


    $('#frm_customer').find('input, textarea').removeAttr('readonly');
    $('#frm_customer').find('select, input:radio').removeAttr('disabled');
    $('#frm_customer').find('.default-switches').removeClass('not-active');

    $('#btn-edit').off().on('click', function (e) {  //kung edit 2021-12-28
        $('#frm_customer').parsley().validate();

        //if ($('#frm_customer').parsley().isValid()) {

        ////$('#frm_customer').parsley().on('form:submit', function () {
        if ($('#cus_code').val() == '') {
            $("#global-loader").fadeOut("slow");

            swal(
                'กรุณากรอกข้อมูลให้ถูกต้อง!',
                'กรุณากรอกรหัสลูกค้า!',
                'info'
            )
        } else {
            $("#global-loader").fadeIn("slow");
            let add_data = {
                emmasaddr_id: citem['emmasaddr_id'],
                emmasaddr_emmas_code: cusitem['code'],
                emmasaddr_location_name: $('#emmasaddr_location_name').val(),
                emmasaddr_eaddress: $('#emmasaddr_eaddress').val(),
                emmasaddr_etumbol: $('#emmasaddr_etumbol').val(),
                emmasaddr_eamphur: $('#emmasaddr_eamphur').val(),
                emmasaddr_eprovinc: $('#emmasaddr_eprovinc').val(),
                emmasaddr_ezip: $('#emmasaddr_ezip').val(),
                emmasaddr_edefault: $('#frm_customer .default-switches').hasClass("on") == true ? 1 : 0,
                record_status: '1',
                updated_by: user_id,
                pMessage: '',

            };

            var params = [];
            for (const i in add_data) {
                params.push(i + "=" + encodeURIComponent(add_data[i]));
            }

            fetch(customer_address187_update, {
                method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                // mode: 'no-cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: params.join("&"),
            }).then(data => {
                return data.json();
            }).then(data => {
                $("#global-loader").fadeOut("slow");

                if (data.status === 'Error') {
                    toastr.error(data.error_message);

                } else {

                    toastr.success('Save Successfully!', async function () {
                        $('#modal-addr').modal('hide')
                        oTable_addr.destroy();
                        $.List_cus_addr_187(cusitem);
                    });
                }

            }).catch((error) => {
                toastr.error(error, 'Error writing document');
                console.log('Error:', error);
            });

        }
        return false;
        //}
        //});
        e.preventDefault();  //kung edit 2021-12-28

    });

};

$.DeleteAddr = async function (citem, cusitem) {

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
            $.LoadingOverlay("show", {
                image: '',
                custom: customElement
            });

            let add_data = {
                emmasaddr_id: citem['emmasaddr_id'],
                record_status: '0',
                pMessage: '',
                updated_by: user_id,
            };

            var params = [];
            for (const i in add_data) {
                params.push(i + "=" + encodeURIComponent(add_data[i]));
            }

            fetch(customer_address187_Delete, {
                method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                // mode: 'no-cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: params.join("&"),
            }).then(data => {
                return data.json();
            }).then(data => {
                $.LoadingOverlay("hide");

                if (data.status === 'Error') {
                    toastr.error(data.error_message);

                } else {

                    oTable_addr.destroy();
                    $.List_cus_addr_187(cusitem);

                    setTimeout(function () { swal("Done!", "It was succesfully deleted!", "success"); }, 500)
                }

            }).catch((error) => {
                //toastr.error(error, 'Error writing document');
                console.log('Error:', error);
                setTimeout(function () { swal("Error deleting!" + error, "Please try again", "error"); }, 500)
            });
        }
    });
    return false;

};

$.Province_Get = async function () {

    let province_get_api = new URL(province_get);

    fetch(province_get_api).then(function (response) {
        return response.json();
    }).then(function (result) {
        $("#global-loader").fadeOut("slow");

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
            }) //kung edit 2021-12-28


        } else {

            $.each(result.data, function (index, item) {
                $('.province')
                    .append($("<option value=''>Please select..</option>") //kung edit 2021-12-28
                        .attr("value", item.glb_province_id)
                        .text(item.glb_province_name));
            });

        }
    });

    return false;
}

$.Amphur_Get = async function (province_id, amphurAttr_id) {

    let amphur_get_api = new URL(amphur_get);

    amphur_get_api.search = new URLSearchParams({
        glb_province_id: province_id
    });

    fetch(amphur_get_api).then(function (response) {

        return response.json();

    }).then(function (result) {

        $("#global-loader").fadeOut("slow");

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
                let text_amphur_name = province_id == 1 ? "เขต" + item.glb_amphur_name : "อำเภอ" + item.glb_amphur_name //kung edit 2022-01-14
                $('#' + amphurAttr_id)
                    .append($("<option value=''>Please select..</option>") //kung edit 2021-12-28
                        .attr({ value: item.glb_amphur_id, data_zip: item.glb_amphur_postcode })
                        .text(text_amphur_name));//kung edit 2022-01-14


            });

        }
    });

}

$.District_Get = async function (amphur_id, tumbolAttr_id) {
    let district_get_api = new URL(district_get);

    district_get_api.search = new URLSearchParams({
        glb_amphur_id: amphur_id
    });

    fetch(district_get_api).then(function (response) {
        return response.json();
    }).then(function (result) {
        $("#global-loader").fadeOut("slow");

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
                let text_district_name = item.glb_province_id == 1 ? "แขวง" + item.glb_district_name : "ตำบล" + item.glb_district_name //kung edit 2022-01-14

                $('#' + tumbolAttr_id)
                    .append($("<option value=''>Please select..</option>") //kung edit 2021-12-28
                        .attr("value", item.glb_district_id)
                        .text(text_district_name)); //kung edit 2022-01-14

            });
        }
    });

}

$.List_Delivery = async function (addrcitem, cusitem) {

    $('#trpModal').modal('show')

    console.log('addrcitem', addrcitem)

    $('#trpModalLabel').text('บริษัทเอกชน ' + addrcitem.emmasaddr_eaddress + " จ." + addrcitem.emmasaddr_eprovinc + " " + addrcitem.emmasaddr_ezip);

    let url = new URL(customer_setup_trp_get);

    url.search = new URLSearchParams({
        emmas_addr_id: addrcitem['emmasaddr_id'],
        emmas_code: cusitem['code'],
        record_status: '1',
        mode: 'Search'
    });

    fetch(url).then(function (response) {
        return response.json();
    }).then(function (result) {
        //oTable.destroy();
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

            let item_trp = 0;
            flex_trpdefault = 0;

            $.each(result.data, function (key, value) {
                item_trp = result.data[0]['item_trp']
            });

            //if (item_trp >= 3) { //สร้าง
            //    $('#btn-item-trp-create, #btn-item-trp-cancle, #frm_trans select,  #frm_trans input').prop('disabled', true)
            //} else {
            //    $('#btn-item-trp-create, #btn-item-trp-cancle, #frm_trans select,  #frm_trans input').prop('disabled', false)
            //}

            oTable_delivery = $('#tbl-trp-list').DataTable({
                data: result.data,
                searching: false,
                scrollCollapse: false,
                paging: false,
                destroy: true,
                //scrollX: false,
                //scrollY: "410px",
                info: false,
                columns: [

                    {
                        title: "<span style='font-size:11px;'>ลำดับ</span>",
                        width: "70px",
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            return (meta.row + 1);
                        }

                    }, //0

                    {
                        title: "<span style='font-size:11px;'>ชื่อขนส่งเอกชน</span>",
                        data: "name",
                        width: "100px",
                        //visible: false,
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            if (data != null) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            } else {
                                return '<span style="font-size:11px;">' + '-' + '</span>';
                            }
                        }
                    }, //1

                    {
                        title: "<span style='font-size:11px;'>ชำระค่าขนส่ง</span>",
                        data: "lov_deliverycost_code",
                        width: "70px",
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            if (data == 1) {
                                return '<span style="font-size:11px;"> ต้นทาง </span>';
                            } else if (data == 2) {
                                return '<span style="font-size:11px;"> ปลายทาง </span>';

                            }
                        }
                    }, //2
                    {
                        title: "<span style='font-size:11px;'>Zone</span>",
                        data: "lov_zone_code",
                        width: "70px",
                        class: "tx-center",
                        render: function (data, type, row, meta) {
                            if (data != null) {
                                return '<span style="font-size:11px;">' + data.replace("Z0", ""); + '</span>';
                            } else {
                                return '<span style="font-size:11px;">' + '-'; + '</span>';
                            }
                        }
                    }, //3
                    {
                        title: "<span style='font-size:11px;'>พื้นที่</span>",
                        data: "lov_route_name",
                        width: "50px",
                        class: "tx-center",
                        render: function (data, type, row, meta) {

                            return '<span style="font-size:11px;">' + data != null ? data : '' + '</span>';

                        }
                    }, //4
                    {
                        title: "<span style='font-size:11px;'>เริ่มต้น</span>",
                        data: "tdefault",
                        width: "50px",
                        class: "tx-center pt-1 pb-1",
                        render: function (data, type, row, meta) {
                            if (data == 1) {
                                return "<span style='font-size: 15px;'><i class='tx-primary fas fa-check-square'></i></span>";
                            } else if (data == 0) {
                                return "<span style='font-size: 15px;'><i class='tx-primary far fa-square'></i></span>";

                            }
                        },
                    },//5
                    //    {
                    //        title: "<span style='font-size:11px;'>จัดการ</span>",
                    //        class: "tx-center",
                    //        css: 'style="border-top-width: auto;',
                    //        data: "id",
                    //        width: "50px",
                    //        visible: false,
                    //        render: function (data, type, row, meta) {
                    //            let data_row = JSON.stringify(row)
                    //            if (row.record_status == '1') {
                    //                return "<a type='button' style='margin: 0 5px 0 5px;'  class='btn btn-lg action btn-circle btn-info' data-id='" + data + " 'data-toggle='dropdown'> <i style='color:#ecf0fa;' class='fas fa-edit'></i></a><div class='dropdown-menu'><a  class='dropdown-item btn-action' data-row='" + data_row + "' data-action='view'>View<input type='file' style='display: none;' multiple=''></a><a  class='dropdown-item btn-action' data-row='" + data_row + "' data-action='edit'>Edit<input type='file' style='display: none;' multiple=''></a></div></div><a type='button' class='btn btn-lg btn-circle btn-danger btn-action' data-row='" + data_row + "'data-action='delete' style='color:red'><i style='color:#ecf0fa;' class='fa fa-trash'></i></a>"
                    //            } else if (row.record_status == 'delete') {
                    //                return "<a type='button' style='margin: 0 5px 0 5px;'  class='btn btn-lg action btn-circle btn-info' data-id='" + data + " 'data-toggle='dropdown'> <i style='color:#ecf0fa;' class='fas fa-edit'></i></a><div class='dropdown-menu'><a  class='dropdown-item btn-action' data-row='" + data_row + "' data-action='view'>View<input type='file' style='display: none;' multiple=''></a><a  class='dropdown-item btn-action' data-row='" + data_row + "' data-action='edit'>Edit<input type='file' style='display: none;' multiple=''></a></div></div>"
                    //            }
                    //        }
                    //    }, //6
                ],


                "order": [[0, "asc"]],
                "initComplete": function (settings, json) {

                    // $.LoadingOverlay("hide");

                    $("#global-loader").fadeOut("slow");

                    $.contextMenu({
                        selector: '#tbl-trp-list tbody tr',
                        callback: function (key, options) {

                            let trpitem = oTable_delivery.row(this).data();


                            if (key === 'view') {

                                $.Details_Trp(trpitem);

                            } else if (key === 'edit') {

                                $.Edit_Trp(trpitem, addrcitem, cusitem);

                            } else if (key === 'delete') {

                                $.Delete_Trp(trpitem, addrcitem, cusitem);

                            } else {

                                alert('ERROR');

                            }

                        },
                        items: {
                            "view": { name: "View", icon: "fas fa-search" },
                            "edit": { name: "Edit", icon: "edit" },
                            "delete": { name: "Delete", icon: "delete" },
                            // "sep1": "---------",
                            // "create": { name: "New Item", icon: "add" }
                        }

                    });


                    //$('#tbl-trp-list tbody tr').hover(function () {
                    //    $(this).css('cursor', 'pointer');
                    //});
                    //$('#tbl-trp-list .btn-action').click(function () {
                    //    let id = $().data('id');
                    //    let data = $(this).data('row');
                    //    //let data_obj = $.parseJSON(data);

                    //    if ($(this).data('action') == "view") {
                    //        $.Details_Trp(data);
                    //    } else if ($(this).data('action') == "edit") {
                    //        $.Edit_Trp(data);
                    //    } else if ($(this).data('action') == "delete") {
                    //        $.Delete_Trp(data);
                    //        //} else {
                    //        //    alert($(this).data('action'));
                    //    }
                    //});

                },
            });
        }
    })

    $.Create_trp(addrcitem, cusitem)

    $('#trpModal').on('hide.bs.modal', function () {
        $('#frm_trans select').val('').trigger('change');
    });
}

$.Create_trp = async function (addrcitem, cusitem) {

    $('#btn-item-trp-create').off().on('click', function (e) {
        e.preventDefault();

        $('#frm_trans').parsley().validate();

        if ($('#frm_trans').parsley().isValid()) {
            let add_data = {
                emmas_addr_id: addrcitem['emmasaddr_id'],
                emmas_code: cusitem['code'],
                tdefault: $('#frm_trans .default-switches').hasClass("on") === true ? 1 : 0,
                vendor_id: $('#tran_name').val(),
                lov_deliverycost_code: $("#lov_deliverycost_code_1").is(":checked") === true ? '1' : '2',
                record_status: '1',
                created_by: user_id,
                pMessage: ''
            };

            var params = [];
            for (const i in add_data) {
                params.push(i + "=" + encodeURIComponent(add_data[i]));
            }

            fetch(customer_setup_trp_add, {
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
                        $('#frm_trans').find('input,select').val('');
                        $('#frm_trans').find('.parsley-success').removeClass('parsley-success');
                        $('#frm_trans').find('.default-switches').removeClass('on');
                        $("#lov_deliverycost_code").removeClass("checked");
                        $("#tran_name option").remove();
                        $('#tran_name').append($("<option>Please select..</option>"));
                        $('#emmas_eline').val('')

                        oTable_delivery.destroy();
                        $.List_Delivery(addrcitem, cusitem);
                        $.List_cus_addr_187(cusitem); //kung edit 2021-12-28

                    });
                }

            }).catch((error) => {
                toastr.error(error, 'Error writing document');
                console.log('Error:', error);
            });

            return false;

        }

    });

};

$.Edit_Trp = async function (citem, addrcitem, cusitem) {
    $.Details_Trp(citem);

    $('#btn-item-trp-create').prop('disabled', false);
    $('#btn-edit-trp, #btn-item-trp-cancle').prop('disabled', false);

    $('.btn-create-trp').addClass('hide');
    $('.btn-edit-trp').removeClass('hide');

    $('#frm_trans').find('input, textarea').removeAttr('readonly');
    $('#frm_trans').find('select, input:radio').removeAttr('disabled');
    $('#frm_trans').find('.default-switches').removeClass('not-active');

    $('#btn-edit-trp').off().on('click', function (e) {
        $('#frm_trans').parsley().validate();
        if ($('#frm_trans').parsley().isValid()) {

            if ($('#cus_code').val() == '') {
                if ($('#cus_code').val() == '') {
                    swal(
                        'กรุณากรอกข้อมูลให้ถูกต้อง!',
                        'กรุณากรอกรหัสลูกค้า!',
                        'info'
                    )
                }
            } else {
                let add_data = {
                    id: citem['id'],
                    emmas_addr_id: citem['emmasaddr_id'],
                    emmas_code: cusitem['code'],
                    tdefault: $('#frm_trans .default-switches').hasClass("on") === true ? 1 : 0,
                    vendor_id: $('#tran_name').val(),
                    lov_deliverycost_code: $("#lov_deliverycost_code_1").is(":checked") === true ? '1' : '2',
                    record_status: '1',
                    updated_by: name,
                };

                var params = [];
                for (const i in add_data) {
                    params.push(i + "=" + encodeURIComponent(add_data[i]));
                }

                fetch(Customer_Setup_Trp_Update, {
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
                            $('#frm_trans').find('input,select').val('');
                            $('#frm_trans').find('.parsley-success').removeClass('parsley-success');
                            $('#frm_trans').find('.default-switches').removeClass('on');
                            $("#lov_deliverycost_code").removeClass("checked");
                            $("#tran_name option").remove();
                            $('#tran_name').append($("<option value=''>Please select..</option>"));
                            $.List_Delivery(addrcitem, cusitem);
                            $('.btn-create-trp').removeClass('hide');
                            $('.btn-edit-trp').addClass('hide');
                            $.List_cus_addr_187(cusitem); //kung edit 2021-12-28

                        });
                    }

                }).catch((error) => {
                    toastr.error(error, 'Error writing document');
                    console.log('Error:', error);
                });

            }
            return false;
        }

        e.preventDefault();
    });

};

$.Details_Trp = async function (citem) {
    $('#btn-item-trp-create').prop('disabled', true);
    $('#btn-edit-trp').prop('disabled', true);

    $('.btn-create-trp').removeClass('hide');
    $('.btn-edit-trp').addClass('hide');

    $('#frm_trans').find('input, textarea').attr('readonly', true);
    $('#frm_trans').find('select, input:radio').attr('disabled', true);
    $('#frm_trans').find('.main-toggle').addClass('not-active');
    $('#tran_name').val(citem['vendor_id']).trigger('change');
    citem['tdefault'] == 1 ? $('#frm_trans .default-switches').addClass('on') : $('#frm_trans .default-switches').removeClass('on');
    if (citem['lov_deliverycost_code'] == '1') {
        $("#lov_deliverycost_code_1").prop('checked', true);
    } else if (citem['lov_deliverycost_code'] == '2') {
        $("#lov_deliverycost_code_2").prop('checked', true);

    }
};

$.Delete_Trp = async function (trpcitem, addrcitem, cusitem) {
    swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }, function (isConfirm) {
        if (isConfirm) {

            let add_data = {
                id: trpcitem['id'],
                record_status: '0',
                pMessage: '',
                updated_by: name,
            };

            var params = [];
            for (const i in add_data) {
                params.push(i + "=" + encodeURIComponent(add_data[i]));
            }

            fetch(Customer_Setup_Trp_Delete, {
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

                    setTimeout(function () { swal("Done!", "It was succesfully deleted!", "success"); }, 500)
                    oTable_delivery.destroy();
                    $.List_Delivery(addrcitem, cusitem);
                    $.List_cus_addr_187(cusitem);


                }

            }).catch((error) => {
                //toastr.error(error, 'Error writing document');
                console.log('Error:', error);

                setTimeout(function () { swal("Error deleting!" + error, "Please try again", "error"); }, 500)

            });
        }
    });

};

$.Delivery_Zone_Get = async function (lov_zone_code) {

    let zone_get_api = new URL(delivery_zone_get);

    zone_get_api.search = new URLSearchParams({
        mode: 'Search',
        lov_zone_code: lov_zone_code,
        record_status: '1'
    });

    fetch(zone_get_api).then(function (response) {
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
            transport_name = []

            $('#tran_name option').remove()
            $('#tran_name').append('Select Transport Name');

            if (result.length > 0) {
                $.each(result.data, function (key, val) {
                    transport_name.push({ id: val['id'], text: val['name'] });
                });
            } else {

                transport_name = []

            }


            setTimeout(function () {
                $('#tran_name').select2({
                    //width: '235px',
                    width: '100%',
                    height: '100%',
                    dropdownParent: $("#frm_trans .transport_name"),
                    placeholder: 'Select Transport Name',
                    allowClear: false,
                    data: transport_name,
                    templateResult: function (data) {
                        return data.text;
                    },
                });

                $('#tran_name').val('').trigger('change')
            }, 500);

        }
    });

}

$.Contact_Detail_Get = async function (ContactData) {

    let classShow
    let margin

    $.each(ContactData, function (key, val) {
        classShow = key > 0 ? 'd-none' : 'show'
        margin = key > 0 ? 'mg-t-15' : 'mg-t-20'

        let description = val['description'] != null ? val['description'] : ''
        let extension = val['extension'] != null ? val['extension'] : ''
        let contactnumber = val['contactnumber'] != null ? val['contactnumber'] : ''
        let contactname = val['contactname'] != null ? val['contactname'] : ''
        let purpose_code

        if (val['purpose_code'] == 'PUR') {
            purpose_code = 'ฝ่ายจัดซื้อ'
        } else if (val['purpose_code'] == 'TRP') {
            purpose_code = 'ฝ่ายขนส่ง'
        } else if (val['purpose_code'] == 'ACC') {
            purpose_code = 'ฝ่ายบัญชีและการเงิน'
        } else if (val['purpose_code'] == 'CUSTOM') {
            purpose_code = val['purpose_desc']
        }

        if (val['record_status'] == '1') {
            $('#frm-contact-info').append('<div class="row row-sm ' + margin + '"><div class="col-lg col-lg-2">'
                + '<label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Contact number</label>'
                + '<input class="form-control form-control-sm" placeholder="Contact number" type="text" id="" style="margin-top: -3px;" value="' + contactnumber + '" readonly></div>'
                + '<div class="col-lg col-lg-1 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Extension</label>'
                + '<input class="form-control form-control-sm" placeholder="Extension" type="text" id="" style="margin-top: -3px;" value="' + extension + '" readonly></div>'
                + '<div class="col-lg col-lg-2 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Contact name</label>'
                + '<input class="form-control form-control-sm" placeholder="Contact name" type="text" id="" style="margin-top: -3px;" value="' + contactname + '" readonly></div>'
                + '<div class="col-lg col-lg-2 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Purpose</label>'
                + '<input class="form-control form-control-sm" placeholder="Purpose" type="text" id="" style="margin-top: -3px;" value="' + purpose_code + '" readonly></div>'
                + '<div class="col-lg col-lg-5 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Description</label>'
                + '<input class="form-control form-control-sm" placeholder="Description" type="text" id="" style="margin-top: -3px;" value="' + description + '" readonly></div></div>');
        }
    });
}

$.Customer_Get = async function (emmas_code) {
    //UAT => customer_profile_detail187_get, PROD => customer_profile_detail186_get
    fetch(customer_profile_detail187_get + '?code=' + emmas_code).then(function (response) {

        return response.json();

    }).then(function (result) {

        if (result.length > 0) {

            $.each(result.data, function (key, val) {

                //#Tab1 - ข้อมูลลูกค้า
                $('#customerinfo').find('#emmas_code').val(val['emmas_code']).prop('disabled', true);
                $('#customerinfo').find('#salegrch_grouprank').val(val['salegrch_grouprank']).prop('disabled', true);/*ใช้อันไหน??*/
                $('#customerinfo').find('#emmas_ebranch').val(val['emmas_ebranch']).prop('disabled', true);
                $('#customerinfo').find('#emmas_ebgservice').val(moment(val['emmas_ebgservice']).format('DD/MM/YYYY')).prop('disabled', true);
                $('#customerinfo').find('#emmas_lname').val(val['emmas_lname']).prop('disabled', true);
                $('#customerinfo').find('#emmas_ecodechr').val(val['emmas_ecodechr']).prop('disabled', true);
                $('#customerinfo').find('#emmas_etel').val(val['emmas_etel']);
                $('#customerinfo').find('#emmas_efax').val(val['emmas_efax']);
                $('#customerinfo').find('#emmas_etran').val(val['emmas_etran']);
                //$('#customerinfo').find('#emmas_eregdate').val(val['emmas_eregdate']);
                $('#customerinfo').find('#emmas_eregdate').val(val['emmas_eregdate'] === null ? '' : moment(val['emmas_eregdate'], 'MM/DD/YYYY').format('DD/MM/YYYY'));
                $('#customerinfo').find('#emmas_eOwn3').val(val['emmas_eOwn3']);
                $('#customerinfo').find('#emmas_eOwn0').val(val['emmas_eOwn0']);
                $('#customerinfo').find('#salegrch_idcardno').val(val['salegrch_idcardno']);
                $('#customerinfo').find('#emmas_edescript').val(val['emmas_edescript']);
                $('#customerinfo').find('#emmas_eaddress').val(val['emmas_eaddress']);
                $('#customerinfo').find('#salegrch_eaddress2').val(val['salegrch_eaddress2']);


                let emmas_eprovinc = val['emmas_eprovinc'] != null ? val['emmas_eprovinc'].replace(/\s/g, '').replace('จังหวัด', '') : '';
                let salegrch_eprovinc2 = val['salegrch_eprovinc2'] != null ? val['salegrch_eprovinc2'].replace(/\s/g, '').replace('จังหวัด', '') : '';
                let emmas_eamphur = val['emmas_eamphur'] != null ? val['emmas_eamphur'].replace(/\s/g, '') : '';
                let salegrch_eamphur2 = val['salegrch_eamphur2'] != null ? val['salegrch_eamphur2'].replace(/\s/g, '') : '';
                let emmas_etumbol = val['emmas_etumbol'] != null ? val['emmas_etumbol'].replace(/\s/g, '') : '';
                let salegrch_etumbol2 = val['salegrch_etumbol2'] != null ? val['salegrch_etumbol2'].replace(/\s/g, '') : '';

                emmas_eprovinc == '' ? $("#emmas_eprovinc").val('').trigger('change') : $("#customerinfo").find("#emmas_eprovinc option:contains(" + emmas_eprovinc + ")").attr('selected', true).trigger('change');
                salegrch_eprovinc2 == '' ? $("#salegrch_eprovinc2").val('').trigger('change') : $("#customerinfo").find("#salegrch_eprovinc2 option:contains(" + salegrch_eprovinc2 + ")").attr('selected', true).trigger('change');

                var banklist_val = val['banklist'];
                var arr_banklist = banklist_val.split(',');
                //$('#customerinfo').find('#salegrch_banklist').selectpicker('val', arr_banklist).selectpicker('refresh');
                $('#customerinfo').find('#salegrch_banklist').selectpicker('val', arr_banklist);

                setTimeout(function () {
                    emmas_eamphur == '' ? $("#emmas_eamphur").val('').trigger('change') : $("#customerinfo").find("#emmas_eamphur option:contains(" + emmas_eamphur + ")").attr('selected', true).trigger('change');
                    salegrch_eamphur2 == '' ? $("#salegrch_eamphur2").val('').trigger('change') : $("#customerinfo").find("#salegrch_eamphur2 option:contains(" + salegrch_eamphur2 + ")").attr('selected', true).trigger('change');
                    setTimeout(function () {
                        emmas_etumbol == '' ? $("#emmas_etumbol").val('').trigger('change') : $("#customerinfo").find("#emmas_etumbol option:contains(" + emmas_etumbol + ")").attr('selected', true).trigger('change');
                        salegrch_etumbol2 == '' ? $("#salegrch_etumbol2").val('').trigger('change') : $("#customerinfo").find("#salegrch_etumbol2 option:contains(" + salegrch_etumbol2 + ")").attr('selected', true).trigger('change');
                    }, 200)

                }, 600)

                $('#customerinfo').find('#emmas_ezip').val(val['emmas_ezip']);
                $('#customerinfo').find('#salegrch_ezip2').val(val['salegrch_ezip2']);


                //#Tab2 - ข้อมูลด้านการขาย
                $('#saleinfo').find('#samas_salecode').val(val['samas_salecode']);
                $('#saleinfo').find('#samas_salename').val(val['samas_salename']);
                $('#saleinfo').find('#emmas_egdis').val(val['emmas_egdis']);
                $('#saleinfo').find('#emmas_netprice').val(val['emmas_netprice']);
                $('#saleinfo').find('#samas_storemanager').val(val['samas_storemanager']);
                $('#saleinfo').find('#samas_salechannel').val(val['samas_salechannel']);
                $('#saleinfo').find('#salegrch_branch').val(val['salegrch_branch']);
                $('#saleinfo').find('#samas_salegroup').val(val['samas_salegroup']);
                $('#saleinfo').find('#salegrch_area').val(val['salegrch_area']);
                $('#saleinfo').find('#salegrch_salearea').val(val['salegrch_salearea']);
                $('#saleinfo').find('#samas_salemanager').val(val['samas_salemanager']);
                $('#saleinfo').find('#samas_salesupervisor').val(val['samas_salesupervisor']);
                $('#saleinfo').find('#samas_saleexecutive').val(val['samas_saleexecutive']);
                $('#saleinfo').find('#samas_salesupervisorsupport').val(val['samas_salesupervisorsupport']);
                $('#saleinfo').find('#samas_partspecialist').val(val['samas_partspecialist']);


                //#Tab3 - ข้อมูลด้านบัญชีและการเงิน
                $('#accountinfo').find('#emmas_taxid').val(val['emmas_taxid']);
                $('#accountinfo').find('#emmas_edue').val(val['emmas_edue']);
                $('#accountinfo').find('#emmas_euserid').val(val['emmas_euserid']);
                $('#accountinfo').find('#emmas_evat').val(val['emmas_evat']);
                $('#accountinfo').find('#emmas_egroup').val(val['emmas_egroup']);
                $('#accountinfo').find('#emmas_ekcust').val(val['emmas_ekcust']);
                $('#accountinfo').find('#emmas_egroupkE').val(val['emmas_egroupkE']);
                $('#accountinfo').find('#emmas_egroupk').val(val['emmas_egroupk']);
                $('#accountinfo').find('#emmas_ekbill').val(val['emmas_ekbill']);
                $('#accountinfo').find('#emmas_ecrcut').val(val['emmas_ecrcut']);
                $('#accountinfo').find('#emmas_ekcheck').val(val['emmas_ekcheck']);
                $('#accountinfo').find('#emmas_eamount').val(val['emmas_eamount']);
                $('#accountinfo').find('#emmas_eamountvat').val(val['emmas_eamountvat']);
                //$('#accountinfo').find('#emmas_ecredit').val(val['emmas_ecredit']);
                //$('#accountinfo').find('#emmas_ecredit2').val(val['emmas_ecredit2']);

                //#Tab4 - ข้อมูลการขนส่ง
                $('#deliveryinfo').find('#salegrch_delivery_stdtime').val(val['salegrch_delivery_stdtime']);
                $('#deliveryinfo').find('#emmas_etrans').val(val['emmas_etrans']);

            });

            $(".modal-body").LoadingOverlay("hide", true);

            //$('#frm-contact-info').append(contact_text);

        } else if (result.length == 0) {

            $('#modal-frm_data').modal('hide');

            setTimeout(function () {
                toastr.error('ไม่พบข้อมูลรายการสินค้านี้ในตารางข้อมูลสินค้าหลัก');
            }, 100);

            $(".modal-body").LoadingOverlay("hide", true);

        }

    });


}

$.Customer_189_Get = async function (emmas_code) {
    fetch(customer_profile_detail189_get + '?code=' + emmas_code).then(function (response) {

        return response.json();

    }).then(function (result) {

        if (result.length > 0) {

            $.each(result.data, function (key, val) {

                //#Tab3 - 189 accountinfo Metabase
                $('#accountinfo').find('#emmasmtb_sumcreditlimit').val(val['emmasmtb_sumcreditlimit']).prop('disabled', true);
                $('#accountinfo').find('#emmasmtb_sumeamount').val(val['emmasmtb_sumeamount']).prop('disabled', true);
                $('#accountinfo').find('#emmasmtb_balanceofcredit').val(val['emmasmtb_balanceofcredit']).prop('disabled', true);

            });

            $(".modal-body").LoadingOverlay("hide", true);

            //$('#frm-contact-info').append(contact_text);

        } else if (result.length == 0) {

            $('#modal-frm_data').modal('hide');

            setTimeout(function () {
                toastr.error('ไม่พบข้อมูลรายการสินค้านี้ในตารางข้อมูลสินค้าหลัก');
            }, 100);

            $(".modal-body").LoadingOverlay("hide", true);

        }

    });


}

$.SaleTarget_187_Get = async function (emmas_code, year) {

    fetch(customer_profile_saleTarget187_get + '?code=' + emmas_code + '&target_year=' + year).then(function (response) {

        return response.json();

    }).then(function (result) {

        if (result.length > 0) {

            $.each(result.data, function (key, val) {


                //#Tab2 - ข้อมูลด้านการขาย
                $('#saleinfo').find('#saletargetcsum1_salestarget_year').val(val['saletargetcsum1_salestarget_year']);


                let saletargetc_rebatestarget_q1 = (Math.round(val['saletargetc_rebatestarget_q1'] * 100) / 100).toFixed(2)
                let saletargetc_salestarget_m01 = (Math.round(val['saletargetc_salestarget_m01'] * 100) / 100).toFixed(2)
                let saletargetc_salestarget_m02 = (Math.round(val['saletargetc_salestarget_m02'] * 100) / 100).toFixed(2)
                let saletargetc_salestarget_m03 = (Math.round(val['saletargetc_salestarget_m03'] * 100) / 100).toFixed(2)
                let saletargetc_rebatestarget_q2 = (Math.round(val['saletargetc_rebatestarget_q2'] * 100) / 100).toFixed(2)
                let saletargetc_salestarget_m04 = (Math.round(val['saletargetc_salestarget_m04'] * 100) / 100).toFixed(2)
                let saletargetc_salestarget_m05 = (Math.round(val['saletargetc_salestarget_m05'] * 100) / 100).toFixed(2)
                let saletargetc_salestarget_m06 = (Math.round(val['saletargetc_salestarget_m06'] * 100) / 100).toFixed(2)
                let saletargetc_rebatestarget_q3 = (Math.round(val['saletargetc_rebatestarget_q3'] * 100) / 100).toFixed(2)
                let saletargetc_salestarget_m07 = (Math.round(val['saletargetc_salestarget_m07'] * 100) / 100).toFixed(2)
                let saletargetc_salestarget_m08 = (Math.round(val['saletargetc_salestarget_m08'] * 100) / 100).toFixed(2)
                let saletargetc_salestarget_m09 = (Math.round(val['saletargetc_salestarget_m09'] * 100) / 100).toFixed(2)
                let saletargetc_rebatestarget_q4 = (Math.round(val['saletargetc_rebatestarget_q4'] * 100) / 100).toFixed(2)
                let saletargetc_salestarget_m10 = (Math.round(val['saletargetc_salestarget_m10'] * 100) / 100).toFixed(2)
                let saletargetc_salestarget_m11 = (Math.round(val['saletargetc_salestarget_m11'] * 100) / 100).toFixed(2)
                let saletargetc_salestarget_m12 = (Math.round(val['saletargetc_salestarget_m12'] * 100) / 100).toFixed(2)



                let saletargetcsum1_salesactual_year = (Math.round(val['saletargetcsum1_salesactual_year'] * 100) / 100).toFixed(2)
                let saletargetc_saletarget_year = (Math.round(val['saletargetc_saletarget_year'] * 100) / 100).toFixed(2)
                let saletargetcsum2_saletarget_year_per = (Math.round(val['saletargetcsum2_saletarget_year_per'] * 100) / 100).toFixed(2)
                let saletargetcsum1_rebatesactual_year = (Math.round(val['saletargetcsum1_rebatesactual_year'] * 100) / 100).toFixed(2)
                let saletargetc_rebatestarget_year = (Math.round(val['saletargetc_rebatestarget_year'] * 100) / 100).toFixed(2)
                let saletargetc_rebatestarget_year_per = (Math.round(val['saletargetc_rebatestarget_year_per'] * 100) / 100).toFixed(2)
                let saletargetcsum1_salesactual_q1 = (Math.round(val['saletargetcsum1_salesactual_q1'] * 100) / 100).toFixed(2)
                let saletargetc_salestarget_q1 = (Math.round(val['saletargetc_salestarget_q1'] * 100) / 100).toFixed(2)
                let saletargetcsum2_salestarget_q1_per = (Math.round(val['saletargetcsum2_salestarget_q1_per'] * 100) / 100).toFixed(2)
                let saletargetcsum1_rebatesactual_q1 = (Math.round(val['saletargetcsum1_rebatesactual_q1'] * 100) / 100).toFixed(2)
                let saletargetcsum2_rebatestarget_q1_per = (Math.round(val['saletargetcsum2_rebatestarget_q1_per'] * 100) / 100).toFixed(2)
                let saletargetcsum2_salestarget_m01_per = (Math.round(val['saletargetcsum2_salestarget_m01_per'] * 100) / 100).toFixed(2)
                let saletargetcsum1_salesactual_m02 = (Math.round(val['saletargetcsum1_salesactual_m02'] * 100) / 100).toFixed(2)
                let saletargetcsum2_salestarget_m02_per = (Math.round(val['saletargetcsum2_salestarget_m02_per'] * 100) / 100).toFixed(2)
                let saletargetcsum1_salesactual_m03 = (Math.round(val['saletargetcsum1_salesactual_m03'] * 100) / 100).toFixed(2)
                let saletargetcsum2_salestarget_m03_per = (Math.round(val['saletargetcsum2_salestarget_m03_per'] * 100) / 100).toFixed(2)
                let saletargetcsum1_salesactual_q2 = (Math.round(val['saletargetcsum1_salesactual_q2'] * 100) / 100).toFixed(2)
                let saletargetc_salestarget_q2 = (Math.round(val['saletargetc_salestarget_q2'] * 100) / 100).toFixed(2)
                let saletargetcsum2_salestarget_q2_per = (Math.round(val['saletargetcsum2_salestarget_q2_per'] * 100) / 100).toFixed(2)
                let saletargetcsum1_rebatesactual_q2 = (Math.round(val['saletargetcsum1_rebatesactual_q2'] * 100) / 100).toFixed(2)
                let saletargetcsum2_rebatestarget_q2_per = (Math.round(val['saletargetcsum2_rebatestarget_q2_per'] * 100) / 100).toFixed(2)
                let saletargetcsum1_salesactual_m04 = (Math.round(val['saletargetcsum1_salesactual_m04'] * 100) / 100).toFixed(2)
                let saletargetcsum2_salestarget_m04_per = (Math.round(val['saletargetcsum2_salestarget_m04_per'] * 100) / 100).toFixed(2)
                let saletargetcsum1_salesactual_m05 = (Math.round(val['saletargetcsum1_salesactual_m05'] * 100) / 100).toFixed(2)
                let saletargetcsum2_salestarget_m05_per = (Math.round(val['saletargetcsum2_salestarget_m05_per'] * 100) / 100).toFixed(2)
                let saletargetcsum1_salesactual_m06 = (Math.round(val['saletargetcsum1_salesactual_m06'] * 100) / 100).toFixed(2)
                let saletargetcsum2_salestarget_m06_per = (Math.round(val['saletargetcsum2_salestarget_m06_per'] * 100) / 100).toFixed(2)
                let saletargetcsum1_salesactual_q3 = (Math.round(val['saletargetcsum1_salesactual_q3'] * 100) / 100).toFixed(2)
                let saletargetc_salestarget_q3 = (Math.round(val['saletargetc_salestarget_q3'] * 100) / 100).toFixed(2)
                let saletargetcsum2_salestarget_q3_per = (Math.round(val['saletargetcsum2_salestarget_q3_per'] * 100) / 100).toFixed(2)
                let saletargetcsum1_rebatesactual_q3 = (Math.round(val['saletargetcsum1_rebatesactual_q3'] * 100) / 100).toFixed(2)
                let saletargetcsum2_rebatestarget_q3_per = (Math.round(val['saletargetcsum2_rebatestarget_q3_per'] * 100) / 100).toFixed(2)
                let saletargetcsum1_salesactual_m07 = (Math.round(val['saletargetcsum1_salesactual_m07'] * 100) / 100).toFixed(2)
                let saletargetcsum2_salestarget_m07_per = (Math.round(val['saletargetcsum2_salestarget_m07_per'] * 100) / 100).toFixed(2)
                let saletargetcsum1_salesactual_m08 = (Math.round(val['saletargetcsum1_salesactual_m08'] * 100) / 100).toFixed(2)
                let saletargetcsum2_salestarget_m08_per = (Math.round(val['saletargetcsum2_salestarget_m08_per'] * 100) / 100).toFixed(2)
                let saletargetcsum1_salesactual_m09 = (Math.round(val['saletargetcsum1_salesactual_m09'] * 100) / 100).toFixed(2)
                let saletargetcsum2_salestarget_m09_per = (Math.round(val['saletargetcsum2_salestarget_m09_per'] * 100) / 100).toFixed(2)
                let saletargetcsum1_salesactual_q4 = (Math.round(val['saletargetcsum1_salesactual_q4'] * 100) / 100).toFixed(2)
                let saletargetc_salestarget_q4 = (Math.round(val['saletargetc_salestarget_q4'] * 100) / 100).toFixed(2)
                let saletargetcsum2_salestarget_q4_per = (Math.round(val['saletargetcsum2_salestarget_q4_per'] * 100) / 100).toFixed(2)
                let saletargetcsum1_rebatesactual_q4 = (Math.round(val['saletargetcsum1_rebatesactual_q4'] * 100) / 100).toFixed(2)
                let saletargetcsum2_rebatestarget_q4_per = (Math.round(val['saletargetcsum2_rebatestarget_q4_per'] * 100) / 100).toFixed(2)
                let saletargetcsum1_salesactual_m10 = (Math.round(val['saletargetcsum1_salesactual_m10'] * 100) / 100).toFixed(2)
                let saletargetcsum2_salestarget_m10_per = (Math.round(val['saletargetcsum2_salestarget_m10_per'] * 100) / 100).toFixed(2)
                let saletargetcsum1_salesactual_m11 = (Math.round(val['saletargetcsum1_salesactual_m11'] * 100) / 100).toFixed(2)
                let saletargetcsum2_salestarget_m11_per = (Math.round(val['saletargetcsum2_salestarget_m11_per'] * 100) / 100).toFixed(2)
                let saletargetcsum1_salesactual_m12 = (Math.round(val['saletargetcsum1_salesactual_m12'] * 100) / 100).toFixed(2)
                let saletargetcsum2_salestarget_m12_per = (Math.round(val['saletargetcsum2_salestarget_m12_per'] * 100) / 100).toFixed(2)


                $('#saleinfo').find('#saletargetc_rebatestarget_q1_input').val(numberWithCommas(saletargetc_rebatestarget_q1));
                $('#saleinfo').find('#saletargetc_salestarget_m01_input').val(numberWithCommas(saletargetc_salestarget_m01));
                $('#saleinfo').find('#saletargetc_salestarget_m02_input').val(numberWithCommas(saletargetc_salestarget_m02));
                $('#saleinfo').find('#saletargetc_salestarget_m03_input').val(numberWithCommas(saletargetc_salestarget_m03));
                $('#saleinfo').find('#saletargetc_rebatestarget_q2_input').val(numberWithCommas(saletargetc_rebatestarget_q2));
                $('#saleinfo').find('#saletargetc_salestarget_m04_input').val(numberWithCommas(saletargetc_salestarget_m04));
                $('#saleinfo').find('#saletargetc_salestarget_m05_input').val(numberWithCommas(saletargetc_salestarget_m05));
                $('#saleinfo').find('#saletargetc_salestarget_m06_input').val(numberWithCommas(saletargetc_salestarget_m06));
                $('#saleinfo').find('#saletargetc_rebatestarget_q3_input').val(numberWithCommas(saletargetc_rebatestarget_q3));
                $('#saleinfo').find('#saletargetc_salestarget_m07_input').val(numberWithCommas(saletargetc_salestarget_m07));
                $('#saleinfo').find('#saletargetc_salestarget_m08_input').val(numberWithCommas(saletargetc_salestarget_m08));
                $('#saleinfo').find('#saletargetc_salestarget_m09_input').val(numberWithCommas(saletargetc_salestarget_m09));
                $('#saleinfo').find('#saletargetc_rebatestarget_q4_input').val(numberWithCommas(saletargetc_rebatestarget_q4));
                $('#saleinfo').find('#saletargetc_salestarget_m10_input').val(numberWithCommas(saletargetc_salestarget_m10));
                $('#saleinfo').find('#saletargetc_salestarget_m11_input').val(numberWithCommas(saletargetc_salestarget_m11));
                $('#saleinfo').find('#saletargetc_salestarget_m12_input').val(numberWithCommas(saletargetc_salestarget_m12));


                $('#saleinfo').find('#saletargetc_rebatestarget_q1').text(numberWithCommas(saletargetc_rebatestarget_q1));
                $('#saleinfo').find('#saletargetcsum1_salesactual_year').text(numberWithCommas(saletargetcsum1_salesactual_year));
                $('#saleinfo').find('#saletargetc_saletarget_year').text(numberWithCommas(saletargetc_saletarget_year));
                $('#saleinfo').find('#saletargetcsum2_saletarget_year_per').text(numberWithCommas(saletargetcsum2_saletarget_year_per));
                $('#saleinfo').find('#saletargetcsum1_rebatesactual_year').text(numberWithCommas(saletargetcsum1_rebatesactual_year));
                $('#saleinfo').find('#saletargetc_rebatestarget_year').text(numberWithCommas(saletargetc_rebatestarget_year));
                $('#saleinfo').find('#saletargetc_rebatestarget_year_per').text(numberWithCommas(saletargetc_rebatestarget_year_per));
                $('#saleinfo').find('#saletargetcsum1_salesactual_q1').text(numberWithCommas(saletargetcsum1_salesactual_q1));
                $('#saleinfo').find('#saletargetc_salestarget_q1').text(numberWithCommas(saletargetc_salestarget_q1));
                $('#saleinfo').find('#saletargetcsum2_salestarget_q1_per').text(numberWithCommas(saletargetcsum2_salestarget_q1_per));
                $('#saleinfo').find('#saletargetcsum1_rebatesactual_q1').text(numberWithCommas(saletargetcsum1_rebatesactual_q1));
                $('#saleinfo').find('#saletargetcsum1_salesactual_m01').text(numberWithCommas(saletargetcsum2_rebatestarget_q1_per));
                $('#saleinfo').find('#saletargetc_salestarget_m01').text(numberWithCommas(saletargetc_salestarget_m01));
                $('#saleinfo').find('#saletargetcsum2_salestarget_m01_per').text(numberWithCommas(saletargetcsum2_salestarget_m01_per));
                $('#saleinfo').find('#saletargetcsum1_salesactual_m02').text(numberWithCommas(saletargetcsum1_salesactual_m02));
                $('#saleinfo').find('#saletargetc_salestarget_m02').text(numberWithCommas(saletargetc_salestarget_m02));
                $('#saleinfo').find('#saletargetcsum2_salestarget_m02_per').text(numberWithCommas(saletargetcsum2_salestarget_m02_per));
                $('#saleinfo').find('#saletargetcsum1_salesactual_m03').text(numberWithCommas(saletargetcsum1_salesactual_m03));
                $('#saleinfo').find('#saletargetc_salestarget_m03').text(numberWithCommas(saletargetc_salestarget_m03));
                $('#saleinfo').find('#saletargetcsum2_salestarget_m03_per').text(numberWithCommas(saletargetcsum2_salestarget_m03_per));
                $('#saleinfo').find('#saletargetcsum1_salesactual_q2').text(numberWithCommas(saletargetcsum1_salesactual_q2));
                $('#saleinfo').find('#saletargetc_salestarget_q2').text(numberWithCommas(saletargetc_salestarget_q2));
                $('#saleinfo').find('#saletargetcsum2_salestarget_q2_per').text(numberWithCommas(saletargetcsum2_salestarget_q2_per));
                $('#saleinfo').find('#saletargetcsum1_rebatesactual_q2').text(numberWithCommas(saletargetcsum1_rebatesactual_q2));
                $('#saleinfo').find('#saletargetc_rebatestarget_q2').text(numberWithCommas(saletargetc_rebatestarget_q2));
                $('#saleinfo').find('#saletargetcsum2_rebatestarget_q2_per').text(numberWithCommas(saletargetcsum2_rebatestarget_q2_per));
                $('#saleinfo').find('#saletargetcsum1_salesactual_m04').text(numberWithCommas(saletargetcsum1_salesactual_m04));
                $('#saleinfo').find('#saletargetc_salestarget_m04').text(numberWithCommas(saletargetc_salestarget_m04));
                $('#saleinfo').find('#saletargetcsum2_salestarget_m04_per').text(numberWithCommas(saletargetcsum2_salestarget_m04_per));
                $('#saleinfo').find('#saletargetcsum1_salesactual_m05').text(numberWithCommas(saletargetcsum1_salesactual_m05));
                $('#saleinfo').find('#saletargetc_salestarget_m05').text(numberWithCommas(saletargetc_salestarget_m05));
                $('#saleinfo').find('#saletargetcsum2_salestarget_m05_per').text(numberWithCommas(saletargetcsum2_salestarget_m05_per));
                $('#saleinfo').find('#saletargetcsum1_salesactual_m06').text(numberWithCommas(saletargetcsum1_salesactual_m06));
                $('#saleinfo').find('#saletargetc_salestarget_m06').text(numberWithCommas(saletargetc_salestarget_m06));
                $('#saleinfo').find('#saletargetcsum2_salestarget_m06_per').text(numberWithCommas(saletargetcsum2_salestarget_m06_per));
                $('#saleinfo').find('#saletargetcsum1_salesactual_q3').text(numberWithCommas(saletargetcsum1_salesactual_q3));
                $('#saleinfo').find('#saletargetc_salestarget_q3').text(numberWithCommas(saletargetc_salestarget_q3));
                $('#saleinfo').find('#saletargetcsum2_salestarget_q3_per').text(numberWithCommas(saletargetcsum2_salestarget_q3_per));
                $('#saleinfo').find('#saletargetcsum1_rebatesactual_q3').text(numberWithCommas(saletargetcsum1_rebatesactual_q3));
                $('#saleinfo').find('#saletargetc_rebatestarget_q3').text(numberWithCommas(saletargetc_rebatestarget_q3));
                $('#saleinfo').find('#saletargetcsum2_rebatestarget_q3_per').text(numberWithCommas(saletargetcsum2_rebatestarget_q3_per));
                $('#saleinfo').find('#saletargetcsum1_salesactual_m07').text(numberWithCommas(saletargetcsum1_salesactual_m07));
                $('#saleinfo').find('#saletargetc_salestarget_m07').text(numberWithCommas(saletargetcsum1_salesactual_m07));
                $('#saleinfo').find('#saletargetcsum2_salestarget_m07_per').text(numberWithCommas(saletargetcsum2_salestarget_m07_per));
                $('#saleinfo').find('#saletargetcsum1_salesactual_m08').text(numberWithCommas(saletargetcsum1_salesactual_m08));
                $('#saleinfo').find('#saletargetc_salestarget_m08').text(numberWithCommas(saletargetcsum1_salesactual_m08));
                $('#saleinfo').find('#saletargetcsum2_salestarget_m08_per').text(numberWithCommas(saletargetcsum2_salestarget_m08_per));
                $('#saleinfo').find('#saletargetcsum1_salesactual_m09').text(numberWithCommas(saletargetcsum1_salesactual_m09));
                $('#saleinfo').find('#saletargetc_salestarget_m09').text(numberWithCommas(saletargetc_salestarget_m09));
                $('#saleinfo').find('#saletargetcsum2_salestarget_m09_per').text(numberWithCommas(saletargetcsum2_salestarget_m09_per));
                $('#saleinfo').find('#saletargetcsum1_salesactual_q4').text(numberWithCommas(saletargetcsum1_salesactual_q4));
                $('#saleinfo').find('#saletargetc_salestarget_q4').text(numberWithCommas(saletargetc_salestarget_q4));
                $('#saleinfo').find('#saletargetcsum2_salestarget_q4_per').text(numberWithCommas(saletargetcsum2_salestarget_q4_per));
                $('#saleinfo').find('#saletargetcsum1_rebatesactual_q4').text(numberWithCommas(saletargetcsum1_rebatesactual_q4));
                $('#saleinfo').find('#saletargetc_rebatestarget_q4').text(numberWithCommas(saletargetc_rebatestarget_q4));
                $('#saleinfo').find('#saletargetcsum2_rebatestarget_q4_per').text(numberWithCommas(saletargetcsum2_rebatestarget_q4_per));
                $('#saleinfo').find('#saletargetcsum1_salesactual_m10').text(numberWithCommas(saletargetcsum1_salesactual_m10));
                $('#saleinfo').find('#saletargetc_salestarget_m10').text(numberWithCommas(saletargetc_salestarget_m10));
                $('#saleinfo').find('#saletargetcsum2_salestarget_m10_per').text(numberWithCommas(saletargetcsum2_salestarget_m10_per));
                $('#saleinfo').find('#saletargetcsum1_salesactual_m11').text(numberWithCommas(saletargetcsum1_salesactual_m11));
                $('#saleinfo').find('#saletargetc_salestarget_m11').text(numberWithCommas(saletargetcsum1_salesactual_m11));
                $('#saleinfo').find('#saletargetcsum2_salestarget_m11_per').text(numberWithCommas(saletargetcsum2_salestarget_m11_per));
                $('#saleinfo').find('#saletargetcsum1_salesactual_m12').text(numberWithCommas(saletargetcsum1_salesactual_m12));
                $('#saleinfo').find('#saletargetc_salestarget_m12').text(numberWithCommas(saletargetc_salestarget_m12));
                $('#saleinfo').find('#saletargetcsum2_salestarget_m12_per').text(numberWithCommas(saletargetcsum2_salestarget_m12_per));


                ////#Tab3 - ข้อมูลด้านบัญชีและการเงิน
                //$('#accountinfo').find('#').val(val['']);


                ////#Tab4 - ข้อมูลการขนส่ง
                //$('#deliveryinfo').find('#').val(val['']);

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


}

$.CreateOwner = async function (citem) {

    //console.log("CreateOwner - Call");

    $('#frm_owner').parsley().on('form:submit', function () {

        //console.log("CreateOwner - Start");
        //alert("CreateOwner - Start");
        //return false;

        $('.btn-save_form').prop('disabled', true);

        let add_data = {
            code: citem['code'],
            owner_name: $('#customer_owner_name').val(),
            owner_idno: $('#customer_owner_idno').val(),
            record_status: 1,
            created_by: user_id,
            pMessage: ''
        };

        var params = [];
        for (const i in add_data) {
            params.push(i + "=" + encodeURIComponent(add_data[i]));
        }

        fetch(customer_owner_create, {
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

                //alert("customer_owner_create - status Error");
                toastr.error(data.error_message);

            } else {

                //alert("customer_owner_create - status Successfully");
                toastr.success('Save Successfully!', async function () {
                    $('.btn-save_form').prop('disabled', false);

                    $('#frm-owner-info div, #frm-owner-info span').remove();

                    console.log("customer_owner_create", data.data);
                    $.Owner_Detail_Get(data.data);

                    //$.each(data.data, function (key, val) {

                    //    let classShow = key > 0 ? 'd-none' : 'show'
                    //    let margin = key > 0 ? 'mg-t-15' : 'mg-t-20'

                    //    $('#frm-contact-info').append('<div class="row row-sm ' + margin + '"><div class="col-lg col-lg-2">'
                    //        + '<label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Contact number</label>'
                    //        + '<input class="form-control form-control-sm" placeholder="Contact number" type="text" id="" style="margin-top: -3px;" value="' + val['contactnumber'] + '" readonly></div>'
                    //        + '<div class="col-lg col-lg-1 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Extension</label>'
                    //        + '<input class="form-control form-control-sm" placeholder="Extension" type="text" id="" style="margin-top: -3px;" value="' + val['extension'] + '" readonly></div>'
                    //        + '<div class="col-lg col-lg-3 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Purpose</label>'
                    //        + '<input class="form-control form-control-sm" placeholder="Purpose" type="text" id="" style="margin-top: -3px;" value="' + val['purpose_code'] + '" readonly></div>'
                    //        + '<div class="col-lg col-lg-6 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Description</label>'
                    //        + '<input class="form-control form-control-sm" placeholder="Description" type="text" id="" style="margin-top: -3px;" value="' + val['description'] + '" readonly></div></div>');

                    //})

                    return false;

                    $('#modal-owner').modal('hide');

                });
            }

        }).catch((error) => {
            //alert("customer_owner_create - Error");
            toastr.error(error, 'Error writing document');
            console.log('Error:', error);
        });


        return false;

    });


};

$.Owner_Detail_Get = async function (OwnerData) {

    let classShow
    let margin

    $.each(OwnerData, function (key, val) {
        classShow = key > 0 ? 'd-none' : 'show'
        margin = key > 0 ? 'mg-t-5' : 'mg-t-5'

        let owner_name = val['owner_name'] != null ? val['owner_name'] : ''
        let owner_idno = val['owner_idno'] != null ? val['owner_idno'] : ''

        if (val['record_status'] == '1') {
            $('#frm-owner-info').append('<div class="row row-sm ' + margin + '"><div class="col-lg col-lg-6">'
                + '<label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">ชื่อผู้มีอำนาจ</label>'
                + '<input class="form-control form-control-sm" placeholder="ชื่อผู้มีอำนาจ" type="text" id="" style="margin-top: -3px;" value="' + owner_name + '" readonly></div>'
                + '<div class="col-lg col-lg-5 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">หมายเลขบัตรประชาชนผู้มีอำนาจ</label>'
                + '<input class="form-control form-control-sm" placeholder="หมายเลขบัตรประชาชนผู้มีอำนาจ" type="text" id="" style="margin-top: -3px;" value="' + owner_idno + '" readonly></div><div class="col-lg col-lg-1"></div></div>');
        }
    });
}

$.CreateBankAccount = async function (citem) {

    //console.log("CreateOwner - Call");

    $('#frm_bankaccount').parsley().on('form:submit', function () {

        //console.log("Createbankaccount - Start");
        //alert("Createbankaccount - Start");
        //return false;

        $('.btn-save_form').prop('disabled', true);

        let add_data = {
            code: citem['code'],
            customer_bac_bank: $('#customer_bac_bank option:selected').val(),
            customer_bac_bankname: $('#customer_bac_bankname').val(),
            customer_bac_bankno: $('#customer_bac_bankno').val(),
            customer_bac_type: $('#customer_bac_type option:selected').val(),
            customer_bac_comment: $('#customer_bac_comment').val(),
            record_status: 1,
            created_by: user_id,
            pMessage: ''
        };

        var params = [];
        for (const i in add_data) {
            params.push(i + "=" + encodeURIComponent(add_data[i]));
        }

        fetch(customer_bankaccount_create, {
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

                //alert("customer_bankaccount_create - status Error");
                toastr.error(data.error_message);

            } else {

                //alert("customer_bankaccount_create - status Successfully");
                toastr.success('Save Successfully!', async function () {

                    $('.btn-save_form').prop('disabled', false);

                    $('#frm-bankaccount-info div, #frm-bankaccount-info span').remove();

                    console.log("customer_bankaccount_create", data.data);
                    $.BankAccount_Detail_Get(data.data);

                    //$.each(data.data, function (key, val) {

                    //    let classShow = key > 0 ? 'd-none' : 'show'
                    //    let margin = key > 0 ? 'mg-t-15' : 'mg-t-20'

                    //    $('#frm-contact-info').append('<div class="row row-sm ' + margin + '"><div class="col-lg col-lg-2">'
                    //        + '<label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Contact number</label>'
                    //        + '<input class="form-control form-control-sm" placeholder="Contact number" type="text" id="" style="margin-top: -3px;" value="' + val['contactnumber'] + '" readonly></div>'
                    //        + '<div class="col-lg col-lg-1 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Extension</label>'
                    //        + '<input class="form-control form-control-sm" placeholder="Extension" type="text" id="" style="margin-top: -3px;" value="' + val['extension'] + '" readonly></div>'
                    //        + '<div class="col-lg col-lg-3 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Purpose</label>'
                    //        + '<input class="form-control form-control-sm" placeholder="Purpose" type="text" id="" style="margin-top: -3px;" value="' + val['purpose_code'] + '" readonly></div>'
                    //        + '<div class="col-lg col-lg-6 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Description</label>'
                    //        + '<input class="form-control form-control-sm" placeholder="Description" type="text" id="" style="margin-top: -3px;" value="' + val['description'] + '" readonly></div></div>');

                    //})

                    return false;

                    $('#modal-bankaccount').modal('hide');

                });
            }

        }).catch((error) => {
            //alert("customer_bankaccount_create - Error");
            toastr.error(error, 'Error writing document');
            console.log('Error:', error);
        });


        return false;

    });


};

$.BankAccount_Detail_Get = async function (BankAccountData) {

    let classShow
    let margin

    $.each(BankAccountData, function (key, val) {
        classShow = key > 0 ? 'd-none' : 'show'
        margin = key > 0 ? 'mg-t-5' : 'mg-t-5'

        let customer_bac_bank = val['customer_bac_bank'] != null ? val['customer_bac_bank'] : ''
        let customer_bac_bankname = val['customer_bac_bankname'] != null ? val['customer_bac_bankname'] : ''
        let customer_bac_bankno = val['customer_bac_bankno'] != null ? val['customer_bac_bankno'] : ''
        let customer_bac_type = val['customer_bac_type'] != null ? val['customer_bac_type'] : ''
        let customer_bac_comment = val['customer_bac_comment'] != null ? val['customer_bac_comment'] : ''

        if (val['record_status'] == '1') {
            $('#frm-bankaccount-info').append('<div class="row row-sm ' + margin + '"><div class="col-lg col-lg-3">'
                + '<label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">ธนาคาร</label>'
                + '<input class="form-control form-control-sm" placeholder="ธนาคาร" type="text" id="" style="margin-top: -3px;" value="' + customer_bac_bank + '" readonly></div>'

                + '<div class="col-lg col-lg-3 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">ชื่อบัญชีธนาคาร</label>'
                + '<input class="form-control form-control-sm" placeholder="ชื่อบัญชีธนาคาร" type="text" id="" style="margin-top: -3px;" value="' + customer_bac_bankname + '" readonly></div>'

                + '<div class="col-lg col-lg-2 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">เลขที่บัญชีธนาคาร</label>'
                + '<input class="form-control form-control-sm" placeholder="เลขที่บัญชีธนาคาร" type="text" id="" style="margin-top: -3px;" value="' + customer_bac_bankno + '" readonly></div>'

                + '<div class="col-lg col-lg-2 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">ประเภทบัญชีธนาคาร</label>'
                + '<input class="form-control form-control-sm" placeholder="ประเภทบัญชีธนาคาร" type="text" id="" style="margin-top: -3px;" value="' + customer_bac_type + '" readonly></div>'

                + '<div class="col-lg col-lg-2 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">หมายเหตุ</label>'
                + '<input class="form-control form-control-sm" placeholder="หมายเหตุ" type="text" id="" style="margin-top: -3px;" value="' + customer_bac_comment + '" readonly></div>'
                + '<div class= "col-lg col-lg-1" ></div></div>');
        }
    });
}


function isNumber(evt, element) {

    var charCode = (evt.which) ? evt.which : event.keyCode

    if (
        //(charCode != 45 || $(element).val().indexOf('-') != -1) &&      // “-” CHECK MINUS, AND ONLY ONE.
        (charCode != 46 || $(element).val().indexOf('.') != -1) &&      // “.” CHECK DOT, AND ONLY ONE.
        (charCode < 48 || charCode > 57))
        return false;

    return true;
}

function numberWithCommas(x) {

    return x != null ? parseFloat(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0;
}

$(document).ready(async function () {

    await $.init();
    //await $.Route_Get('');
    //await $.SubRoute_Get('');

});


firebase.auth().onAuthStateChanged(function (user) {

    if (user) {

        //console.log(user);
        //var full_mail = user.email;
        //username = full_mail.replace("@vskautoparts.com", "");

    } else {

        window.location.assign('./login');

    }

});