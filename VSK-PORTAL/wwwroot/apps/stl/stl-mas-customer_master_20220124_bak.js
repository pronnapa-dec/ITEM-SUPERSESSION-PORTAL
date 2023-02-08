'use strict';

let oTable;
const objProfile = JSON.parse(localStorage.getItem('objAuth'));
const user_id = objProfile[0]['username'];
const connect_url = "http://localhost:49705";

let url_api = 'http://192.168.1.247/vsk-api-acc/'; //let connect_url = 'http://192.168.1.247/intranet/acc-api'; //let url_api_new = "http://192.168.1.247:8899/stl-api";

let oTable_addr;
let oTable_trp;
let oTable_delivery;
let role_code = "";
let username = "";
let lov_get = connect_url + '/api/MasterCustomer_Lov_Get';
let customer_list = connect_url + '/api/CustomerMaster_List';
let customer_detail = connect_url + '/api/CustomerMaster_Detail';
let CustomerProfile_Detail186_Get = connect_url + '/api/CustomerProfile_Detail186_Get';
let CustomerProfile_Detail187_Get = connect_url + '/api/CustomerProfile_Detail187_Get';
let CustomerProfile_Detail189_Get = connect_url + '/api/CustomerProfile_Detail189_Get';
let url_customer_update = connect_url + '/api/CustomerMaster_Update';
let customer_setup_get = connect_url + '/v1/Customer_Setup_Get';
let customer_setup_trp_get = connect_url + '/v1/Customer_Setup_Trp_Get';
let customer_contact_get = connect_url + '/api/Customer_Contact_Get';
let customer_contact_create = connect_url + '/api/Customer_Contact_Create';
let saletarget_get = connect_url + '/api/saletarget_get';

let province_get = url_api + 'api/ACC/ACCGlb_Province_List_Get';
let amphur_get = url_api + 'api/ACC/ACCGlb_Amphur_List_Get';
let district_get = url_api + 'api/ACC/ACCGlb_District_List_Get';
let postcode_get = url_api + 'api/ACC/ACCGlb_Amphur_postcode_List_Get';

let Customer_Setup_Update = connect_url + '/v1/Customer_Setup_Update';
let customer_setup_add = connect_url + '/v1/Customer_Setup_Add';
let Customer_Setup_Delete = connect_url + '/v1/Customer_Setup_Delete';
let customer_setup_trp_add = connect_url + '/v1/Customer_Setup_Trp_Add';
let delivery_zone_get = connect_url + '/v1/Delivery_Zone_Get';
let Customer_Setup_Trp_Update = connect_url + '/v1/Customer_Setup_Trp_Update';
let Customer_Setup_Trp_Delete = connect_url + '/v1/Customer_Setup_Trp_Delete';

let salechannel_list = [];
let salegroup_list = [];
let contactpurpose_list = [];
let customerranking_list = [];
let contact_text = "";

let url_location = "";
let flex_trpdefault = 0
let cusData = [] //kung edit 2021-12-28
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
            placeholder: {
                id: '0', // the value of the option
                text: 'Please select..'
            },
            allowClear: false,
            data: contactpurpose_list,
            templateResult: function (data) {
                return data.text;
            },
        });

    });


    $.List();


    $('#modal-frm_data').off('hidden.bs.modal').on('hidden.bs.modal', async function () {


        $('#modal_addcontact').find('#tbl_addcontact').html("");

        //console.log("ssss");
        //oTable_trp.destroy();
        //oTable_addr.destroy();
        $('#frm-contact-info div,#frm-contact-info span').remove();

    });

    //let tdate = new Date();

    //for (let i = 3; i >= 0; i++) {
    //    console.log(moment().subtract(i, 'years').format('DD/MM/YYYY'));
    //}

    for (var i = 3; i >= 0; i--) {
        $('#saleinfo').find('#target_year').append('<option value="' + moment().subtract(i, 'years').format('YYYY') + '">' + moment().subtract(i, 'years').format('YYYY') + '</option>')

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

    }, 900);

    $(".province").on('change', function () {
        $(".amphur option").remove();
        $(".amphur").append('<option value="">Please select..</option>').attr("value", ''); //kung edit 2021-12-28
        $.Amphur_Get($(this).val());
        $(".district").val('').trigger('change');;
        $('#postcode').val('');
    })

    $(".amphur").on('change', function () {
        $(".district option").remove();
        $(".district").append('<option value="">Please select..</option>').attr("value", ''); //kung edit 2021-12-28
        $.District_Get($(this).val());
        $.Postcode_Get($(this).val());

    })


};


$.List_cus_addr = async function (cusitem) {
    cusData = [] //kung edit 2021-12-28
    cusData = cusitem //kung edit 2021-12-28

    $('#modal-addr').on('hide.bs.modal', function () {
        $('#frm_customer').find('input').val('')
    });

    let url = new URL(customer_setup_get);

    url.search = new URLSearchParams({
        emmas_code: cusData['code'],  //kung edit 2021-12-28
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
                        title: "<div  class='tx-center'><span style='font-size:11px;'>ที่อยู่</span></div>",
                        width: "200px",
                        class: "tx-left",
                        data: "eaddress",
                        render: function (data, type, row, meta) {
                            let subdistrict = row.eprovinc_id == '1' ? ' แขวง' + row.etumbol : ' ตำบล ' + row.etumbol
                            let district = row.eprovinc_id == '1' ? ' เขต' + row.eamphur : ' อำเภอ ' + row.eamphur
                            let provinc = row.eprovinc_id == '1' ? ' ' + row.eprovinc : ' จังหวัด' + row.eprovinc
                            return '<span style="font-size:11px;">' + data + subdistrict + district + provinc + ' ' + row.ezip + '</span>';
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
                        data: "edefault",
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
                            return data == 0 ? '<i style="font-size: 18px;" class="si si si-plus show-detail tx-secondary"></i>' : '<i style="font-size: 18px;" class="si si si-plus show-detail tx-primary dt-control"></i>';
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

                                $.DetailsAddr(addrcitem, cusData);  //kung edit 2021-12-28

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
                                "<th class='border-bottom-0 tx-center'>Zone</th>" +
                                "<th class='border-bottom-0 tx-center'>พื้นที่</th>" +
                                "<th class='border-bottom-0 tx-center'>เรื่มต้น</th>" + "</tr>";

                            fetch(customer_setup_trp_get + '?emmas_addr_id=' + data.id + '&emmas_code=' + data.emmas_code + '&mode=Search&record_status=1').then(function (response) {
                                return response.json();
                            }).then(function (result) {

                                var tbody = '';
                                var tdefault = '';
                                var lov_deliverycost_code = '';



                                $.each(result.data, function (key, val) {

                                    tdefault = val.tdefault == 1 ? "<span style='font-size: 15px;'><i class='tx-primary fas fa-check-square'></i></span>" : "<span style='font-size: 15px;'><i class='tx-primary far fa-square'></i></span>";
                                    lov_deliverycost_code = val.tdefault == 1 ? '<span style="font-size:11px;"> ต้นทาง </span>' : '<span style="font-size:11px;"> ปลายทาง </span>';

                                    tbody += '<tr class="table-secondary">' +
                                        "<td class='tx-center'>" + (key + 1) + "</td>" +
                                        "<td>" + val.name + "</td>" +
                                        "<td>" + lov_deliverycost_code + "</td>" +
                                        "<td>" + val.lov_zone_code + "</td>" +
                                        "<td>" + val.lov_route_name + "</td>" +
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

                            $('#saleinfo').find('input').prop("disabled", true);
                            $('#saleinfo').find('select').prop("disabled", true);
                            $('#saleinfo').find('textarea').prop("disabled", true);
                            $('#saleinfo').find('.not_use').prop("disabled", true);

                            $('#accountinfo').find('input').prop("disabled", true);
                            $('#accountinfo').find('select').prop("disabled", true);
                            $('#accountinfo').find('textarea').prop("disabled", true);
                            $('#accountinfo').find('.not_use').prop("disabled", true);

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
                            //$('#Purpose_code').select2();


                            $('#customerinfo').find('input').prop("disabled", false);
                            $('#customerinfo').find('select').prop("disabled", false);
                            $('#customerinfo').find('textarea').prop("disabled", false);
                            $('#customerinfo').find('.not_use').prop("disabled", false);

                            $('#saleinfo').find('input').prop("disabled", false);
                            $('#saleinfo').find('select').prop("disabled", false);
                            $('#saleinfo').find('textarea').prop("disabled", false);
                            $('#saleinfo').find('.not_use').prop("disabled", false);

                            $('#accountinfo').find('input').prop("disabled", false);
                            $('#accountinfo').find('select').prop("disabled", false);
                            $('#accountinfo').find('textarea').prop("disabled", false);
                            $('#accountinfo').find('.not_use').prop("disabled", false);

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
    $.List_cus_addr(citem);
    $.CreateAddr(citem);


    $('#target_year').off('change').on('change', function (e) {
        e.preventDefault();
        $.saletargetGet(citem['code'], $(this).val())
    })

    $('#frm_data').find('.modal-title').html("Customer Profile : " + citem['code'] + ' ' + citem['lname']);

    $('#contactinfo').find('#btn_addcontact').click(function () {

        $('#modal-addcontact').modal({

            keyboard: false,
            backdrop: 'static'

        });

        return false;
    });

    $('.btn-save_form').hide();


    fetch(CustomerProfile_Detail186_Get + '?code=' + citem['code']).then(function (response) {

        return response.json();

    }).then(function (result) {

        if (result.length > 0) {

            $.each(result.data, function (key, val) {

                //#Tab1 - ข้อมูลลูกค้า
                $('#customerinfo').find('#emmas_code').val(val['emmas_code']).prop('disabled', true);
                $('#customerinfo').find('#salegrch_grouprank').val(val['salegrch_grouprank']).prop('disabled', true);
                $('#customerinfo').find('#emmas_ebranch').val(val['emmas_ebranch']).prop('disabled', true);
                $('#customerinfo').find('#emmas_ebgservice').val(val['emmas_ebgservice']).prop('disabled', true);
                $('#customerinfo').find('#emmas_lname').val(val['emmas_lname']).prop('disabled', true);
                $('#customerinfo').find('#emmas_ecodechr').val(val['emmas_ecodechr']).prop('disabled', true);
                $('#customerinfo').find('#emmas_etel').val(val['emmas_etel']).prop('disabled', true);
                $('#customerinfo').find('#emmas_etran').val(val['emmas_etran']).prop('disabled', true);
                $('#customerinfo').find('#emmas_efax').val(val['emmas_efax']).prop('disabled', true);

                $('#customerinfo').find('#emmas_eregdate').val(val['emmas_eregdate']).prop('disabled', true);
                $('#customerinfo').find('#emmas_eOwn3').val(val['emmas_eOwn3']).prop('disabled', true);
                $('#customerinfo').find('#emmas_eOwn0').val(val['emmas_eOwn0']).prop('disabled', true);
                $('#customerinfo').find('#salegrch_idcardno').val(val['salegrch_idcardno']).prop('disabled', true);
                $('#customerinfo').find('#emmas_edescript').val(val['emmas_edescript']).prop('disabled', true);

                $('#customerinfo').find('#emmas_eaddress').val(val['emmas_eaddress']).prop('disabled', true);
                $('#customerinfo').find('#emmas_etumbol').val(val['emmas_etumbol']).prop('disabled', true);
                $('#customerinfo').find('#emmas_eamphur').val(val['emmas_eamphur']).prop('disabled', true);
                $('#customerinfo').find('#emmas_eprovinc').val(val['emmas_eprovinc']).prop('disabled', true);
                $('#customerinfo').find('#emmas_ezip').val(val['emmas_ezip']).prop('disabled', true);

                $('#customerinfo').find('#salegrch_eaddress2').val(val['salegrch_eaddress2']).prop('disabled', true);
                $('#customerinfo').find('#salegrch_etumbol2').val(val['salegrch_etumbol2']).prop('disabled', true);
                $('#customerinfo').find('#salegrch_eamphur2').val(val['salegrch_eamphur2']).prop('disabled', true);
                $('#customerinfo').find('#salegrch_eprovinc2').val(val['salegrch_eprovinc2']).prop('disabled', true);
                $('#customerinfo').find('#salegrch_ezip2').val(val['salegrch_ezip2']).prop('disabled', true);


                //#Tab2 - ข้อมูลด้านการขาย
                $('#saleinfo').find('#samas_salecode').val(val['samas_salecode']).prop('disabled', true);
                $('#saleinfo').find('#samas_salename').val(val['samas_salename']).prop('disabled', true);
                $('#saleinfo').find('#emmas_egdis').val(val['emmas_egdis']).prop('disabled', true);
                $('#saleinfo').find('#emmas_netprice').val(val['emmas_netprice']).prop('disabled', true);
                $('#saleinfo').find('#samas_storemanager').val(val['samas_storemanager']).prop('disabled', true);
                $('#saleinfo').find('#samas_salechannel').val(val['samas_salechannel']).prop('disabled', true);
                $('#saleinfo').find('#salegrch_branch').val(val['salegrch_branch']).prop('disabled', true);
                $('#saleinfo').find('#samas_salegroup').val(val['samas_salegroup']).prop('disabled', true);
                $('#saleinfo').find('#salegrch_area').val(val['salegrch_area']).prop('disabled', true);
                $('#saleinfo').find('#salegrch_salearea').val(val['salegrch_salearea']).prop('disabled', true);

                $('#saleinfo').find('#samas_salemanager').val(val['samas_salemanager']).prop('disabled', true);
                $('#saleinfo').find('#samas_salesupervisor').val(val['samas_salesupervisor']).prop('disabled', true);
                $('#saleinfo').find('#samas_saleexecutive').val(val['samas_saleexecutive']).prop('disabled', true);
                $('#saleinfo').find('#samas_salesupervisorsupport').val(val['samas_salesupervisorsupport']).prop('disabled', true);
                $('#saleinfo').find('#samas_partspecialist').val(val['samas_partspecialist']).prop('disabled', true);


                //#Tab3 - ข้อมูลด้านบัญชีและการเงิน
                $('#accountinfo').find('#emmas_euserid').val(val['emmas_euserid']).prop('disabled', true);
                $('#accountinfo').find('#emmas_taxid').val(val['emmas_taxid']).prop('disabled', true);
                $('#accountinfo').find('#emmas_evat').val(val['emmas_evat']).prop('disabled', true);
                $('#accountinfo').find('#emmas_egroup').val(val['emmas_egroup']).prop('disabled', true);
                $('#accountinfo').find('#emmas_edue').val(val['emmas_edue']).prop('disabled', true);
                $('#accountinfo').find('#emmas_ekcust').val(val['emmas_ekcust']).prop('disabled', true);
                $('#accountinfo').find('#emmas_egroupkE').val(val['emmas_egroupkE']).prop('disabled', true);
                $('#accountinfo').find('#emmas_egroupk').val(val['emmas_egroupk']).prop('disabled', true);
                $('#accountinfo').find('#emmas_ekbill').val(val['emmas_ekbill']).prop('disabled', true);
                $('#accountinfo').find('#emmas_ecrcut').val(val['emmas_ecrcut']).prop('disabled', true);
                $('#accountinfo').find('#emmas_ekcheck').val(val['emmas_ekcheck']).prop('disabled', true);

                $('#accountinfo').find('#emmas_eamount').val(val['emmas_eamount']).prop('disabled', true);
                $('#accountinfo').find('#emmas_eamountvat').val(val['emmas_eamountvat']).prop('disabled', true);


                //#Tab4 - ข้อมูลด้านการขนส่ง
                $('#deliveryinfo').find('#emmas_eline').val(val['emmas_eline']).prop('disabled', true);
                $('#deliveryinfo').find('#salegrch_delivery_subroute').val(val['salegrch_delivery_subroute']).prop('disabled', true);
                $('#deliveryinfo').find('#emmas_etrans').val(val['emmas_etrans']).prop('disabled', true);
                $('#deliveryinfo').find('#salegrch_delivery_stdtime').val(val['salegrch_delivery_stdtime']).prop('disabled', true);


                //#Tab5 - ข้อมูลด้านการติดต่อ



            });

            $(".modal-body").LoadingOverlay("hide", true);


            //fetch(CustomerProfile_Detail187_Get + '?code=' + citem['code']).then(function (response) {

            //    return response.json();

            //}).then(function (result) {

            //    if (result.length > 0) {

            //        $.each(result.data, function (key, val) {

            //            //#Tab1 - ข้อมูลลูกค้า


            //            //#Tab2 - ข้อมูลด้านการขาย
            //            $('#saleinfo').find('#saletargetcsum1_salestarget_year').val(val['saletargetcsum1_salestarget_year']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum1_salesactual_year').val(val['saletargetcsum1_salesactual_year']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_saletarget_year').val(val['saletargetc_saletarget_year']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_saletarget_year_per').val(val['saletargetcsum2_saletarget_year_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum1_rebatesactual_year').val(val['saletargetcsum1_rebatesactual_year']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_rebatestarget_year').val(val['saletargetc_rebatestarget_year']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_rebatestarget_year_per').val(val['saletargetc_rebatestarget_year_per']).prop('disabled', true);

            //            $('#saleinfo').find('#saletargetcsum1_salesactual_q1').val(val['saletargetcsum1_salesactual_q1']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_q1').val(val['saletargetc_salestarget_q1']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_salestarget_q1_per').val(val['saletargetcsum2_salestarget_q1_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum1_rebatesactual_q1').val(val['saletargetcsum1_rebatesactual_q1']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_rebatestarget_q1').val(val['saletargetc_rebatestarget_q1']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_rebatestarget_q1_per').val(val['saletargetcsum2_rebatestarget_q1_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_rebatestarget_q1_input').val(val['saletargetc_rebatestarget_q1_input']).prop('disabled', true);

            //            $('#saleinfo').find('#saletargetcsum1_salesactual_m01').val(val['saletargetcsum1_salesactual_m01']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m01').val(val['saletargetc_salestarget_m01']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_salestarget_m01_per').val(val['saletargetcsum2_salestarget_m01_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m01_input').val(val['saletargetc_salestarget_m01_input']).prop('disabled', true);

            //            $('#saleinfo').find('#saletargetcsum1_salesactual_m02').val(val['saletargetcsum1_salesactual_m02']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m02').val(val['saletargetc_salestarget_m02']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_salestarget_m02_per').val(val['saletargetcsum2_salestarget_m02_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m02_input').val(val['saletargetc_salestarget_m02_input']).prop('disabled', true);

            //            $('#saleinfo').find('#saletargetcsum1_salesactual_m03').val(val['saletargetcsum1_salesactual_m03']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m03').val(val['saletargetc_salestarget_m03']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_salestarget_m03_per').val(val['saletargetcsum2_salestarget_m03_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m03_input').val(val['saletargetc_salestarget_m03_input']).prop('disabled', true);

            //            $('#saleinfo').find('#saletargetcsum1_salesactual_q2').val(val['saletargetcsum1_salesactual_q2']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_q2').val(val['saletargetc_salestarget_q2']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_salestarget_q2_per').val(val['saletargetcsum2_salestarget_q2_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum1_rebatesactual_q2').val(val['saletargetcsum1_rebatesactual_q2']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_rebatestarget_q2').val(val['saletargetc_rebatestarget_q2']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_rebatestarget_q2_per').val(val['saletargetcsum2_rebatestarget_q2_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_rebatestarget_q2_input').val(val['saletargetc_rebatestarget_q2_input']).prop('disabled', true);

            //            $('#saleinfo').find('#saletargetcsum1_salesactual_m04').val(val['saletargetcsum1_salesactual_m04']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m04').val(val['saletargetc_salestarget_m04']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_salestarget_m04_per').val(val['saletargetcsum2_salestarget_m04_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m04_input').val(val['saletargetc_salestarget_m04_input']).prop('disabled', true);

            //            $('#saleinfo').find('#saletargetcsum1_salesactual_m05').val(val['saletargetcsum1_salesactual_m05']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m05').val(val['saletargetc_salestarget_m05']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_salestarget_m05_per').val(val['saletargetcsum2_salestarget_m05_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m05_input').val(val['saletargetc_salestarget_m05_input']).prop('disabled', true);

            //            $('#saleinfo').find('#saletargetcsum1_salesactual_m06').val(val['saletargetcsum1_salesactual_m06']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m06').val(val['saletargetc_salestarget_m06']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_salestarget_m06_per').val(val['saletargetcsum2_salestarget_m06_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m06_input').val(val['saletargetc_salestarget_m06_input']).prop('disabled', true);

            //            $('#saleinfo').find('#saletargetcsum1_salesactual_q3').val(val['saletargetcsum1_salesactual_q3']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_q3').val(val['saletargetc_salestarget_q3']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_salestarget_q3_per').val(val['saletargetcsum2_salestarget_q3_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum1_rebatesactual_q3').val(val['saletargetcsum1_rebatesactual_q3']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_rebatestarget_q3').val(val['saletargetc_rebatestarget_q3']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_rebatestarget_q3_per').val(val['saletargetcsum2_rebatestarget_q3_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_rebatestarget_q3_input').val(val['saletargetc_rebatestarget_q3_input']).prop('disabled', true);

            //            $('#saleinfo').find('#saletargetcsum1_salesactual_m07').val(val['saletargetcsum1_salesactual_m07']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m07').val(val['saletargetc_salestarget_m07']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_salestarget_m07_per').val(val['saletargetcsum2_salestarget_m07_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m07_input').val(val['saletargetc_salestarget_m07_input']).prop('disabled', true);

            //            $('#saleinfo').find('#saletargetcsum1_salesactual_m08').val(val['saletargetcsum1_salesactual_m08']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m08').val(val['saletargetc_salestarget_m08']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_salestarget_m08_per').val(val['saletargetcsum2_salestarget_m08_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m08_input').val(val['saletargetc_salestarget_m08_input']).prop('disabled', true);

            //            $('#saleinfo').find('#saletargetcsum1_salesactual_m09').val(val['saletargetcsum1_salesactual_m09']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m09').val(val['saletargetc_salestarget_m09']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_salestarget_m09_per').val(val['saletargetcsum2_salestarget_m09_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m09_input').val(val['saletargetc_salestarget_m09_input']).prop('disabled', true);

            //            $('#saleinfo').find('#saletargetcsum1_salesactual_q4').val(val['saletargetcsum1_salesactual_q4']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_q4').val(val['saletargetc_salestarget_q4']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_salestarget_q4_per').val(val['saletargetcsum2_salestarget_q4_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum1_rebatesactual_q4').val(val['saletargetcsum1_rebatesactual_q4']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_rebatestarget_q4').val(val['saletargetc_rebatestarget_q4']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_rebatestarget_q4_per').val(val['saletargetcsum2_rebatestarget_q4_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_rebatestarget_q4_input').val(val['saletargetc_rebatestarget_q4_input']).prop('disabled', true);

            //            $('#saleinfo').find('#saletargetcsum1_salesactual_m10').val(val['saletargetcsum1_salesactual_m10']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m10').val(val['saletargetc_salestarget_m10']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_salestarget_m10_per').val(val['saletargetcsum2_salestarget_m10_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m10_input').val(val['saletargetc_salestarget_m10_input']).prop('disabled', true);

            //            $('#saleinfo').find('#saletargetcsum1_salesactual_m11').val(val['saletargetcsum1_salesactual_m11']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m11').val(val['saletargetc_salestarget_m11']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_salestarget_m11_per').val(val['saletargetcsum2_salestarget_m11_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m11_input').val(val['saletargetc_salestarget_m11_input']).prop('disabled', true);

            //            $('#saleinfo').find('#saletargetcsum1_salesactual_m12').val(val['saletargetcsum1_salesactual_m12']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m12').val(val['saletargetc_salestarget_m12']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetcsum2_salestarget_m12_per').val(val['saletargetcsum2_salestarget_m12_per']).prop('disabled', true);
            //            $('#saleinfo').find('#saletargetc_salestarget_m12_input').val(val['saletargetc_salestarget_m12_input']).prop('disabled', true);


            //            //#Tab3 - ข้อมูลด้านบัญชีและการเงิน


            //            //#Tab4 - ข้อมูลด้านการขนส่ง
            //            $('#deliveryinfo').find('#emmasaddr_eaddress').val(val['emmasaddr_eaddress']).prop('disabled', true);
            //            $('#deliveryinfo').find('#emmasaddr_eprovinc').val(val['emmasaddr_eprovinc']).prop('disabled', true);
            //            $('#deliveryinfo').find('#emmasaddr_eamphur').val(val['emmasaddr_eamphur']).prop('disabled', true);
            //            $('#deliveryinfo').find('#emmasaddr_etumbol').val(val['emmasaddr_etumbol']).prop('disabled', true);
            //            $('#deliveryinfo').find('#emmasaddr_ezip').val(val['emmasaddr_ezip']).prop('disabled', true);
            //            $('#deliveryinfo').find('#emmasaddr_edefault').val(val['emmasaddr_edefault']).prop('disabled', true);
            //            $('#deliveryinfo').find('#trpvendor_name').val(val['trpvendor_name']).prop('disabled', true);
            //            $('#deliveryinfo').find('#emmastrp_lov_deliverycost_code').val(val['emmastrp_lov_deliverycost_code']).prop('disabled', true);
            //            $('#deliveryinfo').find('#trpvendor_lov_zone_code').val(val['trpvendor_lov_zone_code']).prop('disabled', true);
            //            $('#deliveryinfo').find('#trpvendor_lov_route_code').val(val['trpvendor_lov_route_code']).prop('disabled', true);
            //            $('#deliveryinfo').find('#emmastrp_tdefault').val(val['emmastrp_tdefault']).prop('disabled', true);


            //            //#Tab5 - ข้อมูลด้านการติดต่อ
            //            $('#contactinfo').find('#contact_contactnumber').val(val['contact_contactnumber']).prop('disabled', true);
            //            $('#contactinfo').find('#contact_extension').val(val['contact_extension']).prop('disabled', true);
            //            $('#contactinfo').find('#contact_purpose_code').val(val['contact_purpose_code']).prop('disabled', true);
            //            $('#contactinfo').find('#contact_description').val(val['contact_description']).prop('disabled', true);


            //        });


            //        $(".modal-body").LoadingOverlay("hide", true);


            //        //fetch(CustomerProfile_Detail189_Get + '?code=' + citem['code']).then(function (response) {

            //        //    return response.json();

            //        //}).then(function (result) {

            //        //    if (result.length > 0) {

            //        //        $.each(result.data, function (key, val) {

            //        //            //#Tab1 - ข้อมูลลูกค้า
            //        //            //#Tab2 - ข้อมูลด้านการขาย

            //        //            //#Tab3 - ข้อมูลด้านบัญชีและการเงิน
            //        //            $('#accountinfo').find('#emmasmtb_sumcreditlimit').val(val['emmasmtb_sumcreditlimit']).prop('disabled', true);
            //        //            $('#accountinfo').find('#emmasmtb_sumeamount').val(val['emmasmtb_sumeamount']).prop('disabled', true);
            //        //            $('#accountinfo').find('#emmasmtb_balanceofcredit').val(val['emmasmtb_balanceofcredit']).prop('disabled', true);

            //        //            //#Tab4 - ข้อมูลด้านการขนส่ง
            //        //            //#Tab5 - ข้อมูลด้านการติดต่อ

            //        //        });
            //        //    }
            //        //});

            //    }

            //});



        } else if (result.length == 0) {

            $('#modal-frm_data').modal('hide');

            setTimeout(function () {
                toastr.error('ไม่พบข้อมูลรายการสินค้านี้ในตารางข้อมูลสินค้าหลัก');
            }, 100);

            $(".modal-body").LoadingOverlay("hide", true);

        }

    });



    //fetch(customer_detail + '?code=' + citem['code']).then(function (response) {

    //    return response.json();

    //}).then(function (result) {

    //    if (result.length > 0) {

    //        $.each(result.data, function (key, val) {

    //            //#Tab1 - ข้อมูลลูกค้า
    //            $('#customerinfo').find('#emmas_code').val(val['code']).prop('disabled', true);
    //            $('#customerinfo').find('#customer_grouprank').val(val['grouprank']).prop('disabled', true);/*ใช้อันไหน??*/
    //            $('#customerinfo').find('#emmas_ebranch').val(val['ebranch']).prop('disabled', true);
    //            $('#customerinfo').find('#emmas_ebgservice').val(moment(val['ebgservice']).format('DD/MM/YYYY')).prop('disabled', true);
    //            $('#customerinfo').find('#emmas_lname').val(val['lname']).prop('disabled', true);
    //            $('#customerinfo').find('#emmas_ecodechr').val(val['ecodechr']).prop('disabled', true);
    //            $('#customerinfo').find('#emmas_etel').val(val['etel']);
    //            $('#customerinfo').find('#emmas_efax').val(val['efax']);
    //            $('#customerinfo').find('#emmas_etran').val(val['etran']);

    //            $('#customerinfo').find('#emmas_eregdate').val(val['eregdate']);
    //            $('#customerinfo').find('#emmas_eOwn3').val(val['eOwn3']);
    //            $('#customerinfo').find('#emmas_eOwn0').val(val['eOwn0']);
    //            $('#customerinfo').find('#customer_idcardno').val(val['customer_idcardno']);
    //            $('#customerinfo').find('#emmas_edescript').val(val['edescript']);

    //            $('#customerinfo').find('#emmas_eaddress').val(val['eaddress']);
    //            $('#customerinfo').find('#emmas_etumbol').val(val['etumbol']);
    //            $('#customerinfo').find('#emmas_eamphur').val(val['eamphur']);
    //            $('#customerinfo').find('#emmas_eprovinc').val(val['eprovinc']);
    //            $('#customerinfo').find('#emmas_ezip').val(val['ezip']);

    //            $('#customerinfo').find('#customer_eaddress2').val(val['customer_eaddress2']);
    //            $('#customerinfo').find('#customer_etumbol2').val(val['customer_etumbol2']);
    //            $('#customerinfo').find('#customer_eamphur2').val(val['customer_eamphur2']);
    //            $('#customerinfo').find('#customer_eprovinc2').val(val['customer_eprovinc2']);
    //            $('#customerinfo').find('#customer_ezip2').val(val['customer_ezip2']);


    //            //#Tab2 - ข้อมูลด้านการขาย

    //            $('#saleinfo').find('#salecode').val(val['salecode']).prop('disabled', true);
    //            $('#saleinfo').find('#salename').val(val['salename']).prop('disabled', true);
    //            $('#saleinfo').find('#emmas_egdis').val(val['egdis']).prop('disabled', true);
    //            $('#saleinfo').find('#storemanager').val(val['StoreManager']).prop('disabled', true);
    //            $('#saleinfo').find('#salechannel').val(val['salechannel']).prop('disabled', true);
    //            $('#saleinfo').find('#branch').val(val['Branch']).prop('disabled', true);
    //            $('#saleinfo').find('#salegroup').val(val['salegroup']).prop('disabled', true);
    //            $('#saleinfo').find('#area').val(val['Area']).prop('disabled', true);
    //            $('#saleinfo').find('#salearea').val(val['SaleArea']).prop('disabled', true);
    //            $('#saleinfo').find('#salemanager').val(val['SaleManager']).prop('disabled', true);
    //            $('#saleinfo').find('#salesupervisor').val(val['SaleSupervisor']).prop('disabled', true);
    //            $('#saleinfo').find('#saleexecutive').val(val['SaleRepresentative']).prop('disabled', true);
    //            $('#saleinfo').find('#salesupervisorsupport').val(val['SupportSupervisor']).prop('disabled', true);
    //            $('#saleinfo').find('#partspecialist').val(val['SaleSupport']).prop('disabled', true);
    //            $('#saleinfo').find('#target_year').val(moment().format('YYYY')).trigger('change');

    //            //$('#saleinfo').find('#target_M01').val(val['M01']);
    //            //$('#saleinfo').find('#target_M02').val(val['M02']);
    //            //$('#saleinfo').find('#target_M03').val(val['M03']);
    //            //$('#saleinfo').find('#target_M04').val(val['M04']);
    //            //$('#saleinfo').find('#target_M05').val(val['M05']);
    //            //$('#saleinfo').find('#target_M06').val(val['M06']);
    //            //$('#saleinfo').find('#target_M07').val(val['M07']);
    //            //$('#saleinfo').find('#target_M08').val(val['M08']);
    //            //$('#saleinfo').find('#target_M09').val(val['M09']);
    //            //$('#saleinfo').find('#target_M10').val(val['M10']);
    //            //$('#saleinfo').find('#target_M11').val(val['M11']);
    //            //$('#saleinfo').find('#target_M12').val(val['M12']);


    //            //#Tab3 - ข้อมูลด้านบัญชีและการเงิน
    //            $('#accountinfo').find('#emmas_euserid').val(val['euserid']).prop('disabled', true);
    //            $('#accountinfo').find('#emmas_evat').val(val['evat']).prop('disabled', true);
    //            $('#accountinfo').find('#emmas_egroup').val(val['egroup']).prop('disabled', true);
    //            $('#accountinfo').find('#emmas_ekcust').val(val['ekcust']).prop('disabled', true);
    //            $('#accountinfo').find('#emmas_egroupkE').val(val['egroupkE']).prop('disabled', true);
    //            $('#accountinfo').find('#emmas_egroupk').val(val['egroupk']).prop('disabled', true);
    //            $('#accountinfo').find('#emmas_ekbill').val(val['ekbill']).prop('disabled', true);
    //            $('#accountinfo').find('#emmas_ecrcut').val(val['ecrcut']).prop('disabled', true);
    //            $('#accountinfo').find('#emmas_ekcheck').val(val['ekcheck']).prop('disabled', true);
    //            $('#accountinfo').find('#emmas_ecredit').val(val['ecredit']).prop('disabled', true);
    //            $('#accountinfo').find('#emmas_ecredit2').val(val['ecredit2']).prop('disabled', true);
    //            $('#accountinfo').find('#emmas_eamount').val(val['eamount']).prop('disabled', true);
    //            $('#accountinfo').find('#emmas_eamountvat').val(val['eamountvat']).prop('disabled', true);

    //            $('#accountinfo').find('#emmas_taxid').val(val['taxid']).prop('disabled', true);
    //            $('#accountinfo').find('#emmas_edue').val(val['edue']).prop('disabled', true);



    //            //$('#information').find('#stmas_code').val(val['code']);
    //            //$('#information').find('#stmas_gamountv').val($.addCommas(val['gamountv']));

    //            //$('#emmas_lname').val(val['lname']).prop('disabled', true);

    //            //$('#emmas_eaddress').val(val['eaddress']).prop('disabled', true);
    //            //$('#emmas_etumbol').val(val['etumbol']).prop('disabled', true);
    //            //$('#emmas_eamphur').val(val['eamphur']).prop('disabled', true);
    //            //$('#emmas_eprovinc').val(val['eprovinc']).prop('disabled', true);
    //            //$('#emmas_ezip').val(val['ezip']).prop('disabled', true);
    //            //$('#emmas_etel').val(val['etel']).prop('disabled', true);
    //            //$('#emmas_efax').val(val['efax']).prop('disabled', true);
    //            //$('#emmas_grouprank').val(val['rank']).prop('disabled', true);


    //        });

    //        $(".modal-body").LoadingOverlay("hide", true);

    //        fetch(customer_contact_get + '?item_code=' + citem['code']).then(function (response) {
    //            return response.json();
    //        }).then(function (result) {
    //            let classShow
    //            let margin

    //            if (result.data.length == 0) {
    //                $('#frm-contact-info').html('<span tx-center>No data available </span>')
    //            } else {
    //                $.each(result.data, function (key, val) {
    //                    classShow = key > 0 ? 'd-none' : 'show'
    //                    margin = key > 0 ? 'mg-t-15' : 'mg-t-20'

    //                    if (val['record_status'] == '1') {
    //                        $('#frm-contact-info').append('<div class="row row-sm ' + margin + '"><div class="col-lg col-lg-2">'
    //                            + '<label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Contact number</label>'
    //                            + '<input class="form-control form-control-sm" placeholder="Contact number" type="text" id="" style="margin-top: -3px;" value="' + val['contactnumber'] + '" readonly></div>'
    //                            + '<div class="col-lg col-lg-1 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Extension</label>'
    //                            + '<input class="form-control form-control-sm" placeholder="Extension" type="text" id="" style="margin-top: -3px;" value="' + val['extension'] + '" readonly></div>'
    //                            + '<div class="col-lg col-lg-3 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Purpose</label>'
    //                            + '<input class="form-control form-control-sm" placeholder="Purpose" type="text" id="" style="margin-top: -3px;" value="' + val['purpose_code'] + '" readonly></div>'
    //                            + '<div class="col-lg col-lg-6 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Description</label>'
    //                            + '<input class="form-control form-control-sm" placeholder="Description" type="text" id="" style="margin-top: -3px;" value="' + val['description'] + '" readonly></div></div>');
    //                    }

    //                });

    //            }
    //        });

    //        //$('#frm-contact-info').append(contact_text);

    //    } else if (result.length == 0) {

    //        $('#modal-frm_data').modal('hide');

    //        setTimeout(function () {
    //            toastr.error('ไม่พบข้อมูลรายการสินค้านี้ในตารางข้อมูลสินค้าหลัก');
    //        }, 100);

    //        $(".modal-body").LoadingOverlay("hide", true);

    //    }
    //});


    $('#btn-export_goodprice').off('click').on('click', function (evt) {

        evt.preventDefault();

        $(this).on('click', function (evt) {
            evt.preventDefault();
        });

        window.location = connect_url + '/Export/ItemMaster_Goodprice_Get' + '?code=' + citem['code'];

        return false;

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
                let val_saletarget_year = $('#frm_data').find('#target_year').val();
                let val_saletarget_m01 = $('#frm_data').find('#target_M01').val();
                let val_saletarget_m02 = $('#frm_data').find('#target_M02').val();
                let val_saletarget_m03 = $('#frm_data').find('#target_M03').val();
                let val_saletarget_m04 = $('#frm_data').find('#target_M04').val();
                let val_saletarget_m05 = $('#frm_data').find('#target_M05').val();
                let val_saletarget_m06 = $('#frm_data').find('#target_M06').val();
                let val_saletarget_m07 = $('#frm_data').find('#target_M07').val();
                let val_saletarget_m08 = $('#frm_data').find('#target_M08').val();
                let val_saletarget_m09 = $('#frm_data').find('#target_M09').val();
                let val_saletarget_m10 = $('#frm_data').find('#target_M10').val();
                let val_saletarget_m11 = $('#frm_data').find('#target_M11').val();
                let val_saletarget_m12 = $('#frm_data').find('#target_M12').val();

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

}


$.CreateContact = async function (citem) {
    $('#frm_addcontact').parsley().on('form:submit', function () {

        $('.btn-save_form').prop('disabled', true);

        let add_data = {
            code: citem['code'],
            contactnumber: $('#contact_number').val(),
            extension: $('#contact_extension').val(),
            purpose_code: $('#contact_purpose_code').val(),
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

                    $.each(data.data, function (key, val) {

                        let classShow = key > 0 ? 'd-none' : 'show'
                        let margin = key > 0 ? 'mg-t-15' : 'mg-t-20'

                        $('#frm-contact-info').append('<div class="row row-sm ' + margin + '"><div class="col-lg col-lg-2">'
                            + '<label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Contact number</label>'
                            + '<input class="form-control form-control-sm" placeholder="Contact number" type="text" id="" style="margin-top: -3px;" value="' + val['contactnumber'] + '" readonly></div>'
                            + '<div class="col-lg col-lg-1 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Extension</label>'
                            + '<input class="form-control form-control-sm" placeholder="Extension" type="text" id="" style="margin-top: -3px;" value="' + val['extension'] + '" readonly></div>'
                            + '<div class="col-lg col-lg-3 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Purpose</label>'
                            + '<input class="form-control form-control-sm" placeholder="Purpose" type="text" id="" style="margin-top: -3px;" value="' + val['purpose_code'] + '" readonly></div>'
                            + '<div class="col-lg col-lg-6 mg-t-10 mg-lg-t-0"><label class="tx-13 tx-medium tx-gray-700 ' + classShow + '" style="padding-left: 5px;">Description</label>'
                            + '<input class="form-control form-control-sm" placeholder="Description" type="text" id="" style="margin-top: -3px;" value="' + val['description'] + '" readonly></div></div>');

                    })

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


$.saletargetGet = async function (code, year) {


    fetch(saletarget_get + '?code=' + code + '&year=' + year).then(function (response) {

        return response.json();

    }).then(function (result) {

        if (result.data.length > 0) {

            $.each(result.data, function (key, val) {

                //#Tab2 - ข้อมูลด้านการขาย
                $('#saleinfo').find('#target_M01').val(val['M01']);
                $('#saleinfo').find('#target_M02').val(val['M02']);
                $('#saleinfo').find('#target_M03').val(val['M03']);
                $('#saleinfo').find('#target_M04').val(val['M04']);
                $('#saleinfo').find('#target_M05').val(val['M05']);
                $('#saleinfo').find('#target_M06').val(val['M06']);
                $('#saleinfo').find('#target_M07').val(val['M07']);
                $('#saleinfo').find('#target_M08').val(val['M08']);
                $('#saleinfo').find('#target_M09').val(val['M09']);
                $('#saleinfo').find('#target_M10').val(val['M10']);
                $('#saleinfo').find('#target_M11').val(val['M11']);
                $('#saleinfo').find('#target_M12').val(val['M12']);

            });

        } else {
            $('#saleinfo').find('#target_M01').val('');
            $('#saleinfo').find('#target_M02').val('');
            $('#saleinfo').find('#target_M03').val('');
            $('#saleinfo').find('#target_M04').val('');
            $('#saleinfo').find('#target_M05').val('');
            $('#saleinfo').find('#target_M06').val('');
            $('#saleinfo').find('#target_M07').val('');
            $('#saleinfo').find('#target_M08').val('');
            $('#saleinfo').find('#target_M09').val('');
            $('#saleinfo').find('#target_M10').val('');
            $('#saleinfo').find('#target_M11').val('');
            $('#saleinfo').find('#target_M12').val('');

        }
    });


};


//start kung edit 2021-12-24

$.CreateAddr = async function (cusitem) {

    $('#btn-item-create').off().on('click', function (e) {  //kung edit 2021-12-28
        e.preventDefault();

        let submit_action = $(this).data('action');

        $('#frm_customer').parsley().validate();

        if ($('#frm_customer').parsley().isValid()) {
            $("#global-loader").fadeIn("slow");

            $('.btn-save_form').prop('disabled', true);

            // Model & Repo ไปเปลี่ยนเอาเอง
            let add_data = {
                emmas_code: cusitem['code'],
                ecate: '2',
                eaddress: $('#cus_address').val(),
                etumbol: $('#district').val(),
                eamphur: $('#amphur').val(),
                eprovinc: $('#province').val(),
                ezip: $('#postcode').val(),
                etel: cusitem['etel'],
                edefault: $('#frm_customer .default-switches').hasClass("on") == true ? 1 : 0,
                //record_status: $("#record_status_1").is(":checked") === true ? '1' : '0',
                record_status: '1',
                created_by: user_id,
                pMessage: ''
            };

            var params = [];
            for (const i in add_data) {
                params.push(i + "=" + encodeURIComponent(add_data[i]));
            }

            fetch(customer_setup_add, {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
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
                        $.List_cus_addr(cusitem);
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

$.DetailsAddr = async function (citem, cusitem) {

    $('#modal-addr').modal({

        keyboard: false,
        backdrop: 'static'

    });

    $('.btn-save-addr').prop('disabled', true);
    $('#btn-item-create').removeClass('d-none');
    $('#btn-edit').addClass('d-none');

    $('#frm_customer').find('input, textarea').attr('readonly', true);
    $('#frm_customer').find('select, input:radio').attr('disabled', true);
    $('#frm_customer').find('.main-toggle').addClass('not-active');

    $('#customer_code').val(citem['emmas_code']);
    $('#cus_address').val(citem['eaddress']);
    $('#province').val(citem['eprovinc_id']).trigger('change');
    setTimeout(function () {
        $('#amphur').val(citem['eamphur_id']).trigger('change');
    }, 1000);

    setTimeout(function () {
        $('#district').val(citem['etumbol_id']).trigger('change');
    }, 1500);

    $('#postcode').val(citem['ezip']);
    citem['edefault'] == '1' ? $('#frm_customer .default-switches').addClass('on') : $('#frm_customer .default-switches').removeClass('on');

};

$.EditAddr = async function (citem, cusitem) {
    $.DetailsAddr(citem, cusitem);

    $('.btn-save-addr').prop('disabled', false);
    $('#btn-item-create').addClass('d-none');
    $('#btn-edit').removeClass('d-none');


    $('#frm_customer').find('input, textarea').removeAttr('readonly');
    $('#frm_customer').find('select, input:radio').removeAttr('disabled');
    $('#frm_customer').find('.default-switches').removeClass('not-active');

    $('#btn-edit').off('click').click(function (e) {  //kung edit 2021-12-28
        $('#frm_customer').parsley().on('form:submit', function () {
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
                    id: citem['id'],
                    emmas_code: cusitem['code'],
                    ecate: '2',
                    eaddress: $('#cus_address').val(),
                    etumbol: $('#district').val(),
                    eamphur: $('#amphur').val(),
                    eprovinc: $('#province').val(),
                    ezip: $('#postcode').val(),
                    etel: cusitem['etel'],
                    edefault: $('#frm_customer .default-switches').hasClass("on") === true ? 1 : 0,
                    record_status: '1',
                    updated_by: user_id,
                };

                var params = [];
                for (const i in add_data) {
                    params.push(i + "=" + encodeURIComponent(add_data[i]));
                }

                fetch(Customer_Setup_Update, {
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
                            $.List_cus_addr(cusitem);
                        });
                    }

                }).catch((error) => {
                    toastr.error(error, 'Error writing document');
                    console.log('Error:', error);
                });

            }
            return false;

        });
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
                id: citem['id'],
                record_status: '0',
                pMessage: '',
                updated_by: user_id,
            };

            var params = [];
            for (const i in add_data) {
                params.push(i + "=" + encodeURIComponent(add_data[i]));
            }

            fetch(Customer_Setup_Delete, {
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
                    $.List_cus_addr(cusitem);

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

$.Postcode_Get = async function (amphur_id) {
    let postcode_get_api = new URL(postcode_get);

    postcode_get_api.search = new URLSearchParams({
        glb_amphur_id: amphur_id
    });

    fetch(postcode_get_api).then(function (response) {
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
            if (amphur_id != '' || amphur_id != null) {
                $.each(result.data, function (index, item) {
                    $('#postcode').val(item.glb_amphur_postcode);
                });
            }

        }
    });

}

$.Province_Get = async function () {

    let province_get_api = new URL(province_get);

    //province_get_api.search = new URLSearchParams({
    //    parent_lov_id: parent_lov_id
    //});


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

}

$.Amphur_Get = async function (province_id) {

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
                $('.amphur')
                    .append($("<option value=''>Please select..</option>") //kung edit 2021-12-28
                        .attr("value", item.glb_amphur_id)
                        .text(item.glb_amphur_name));



            });

        }
    });

}

$.District_Get = async function (amphur_id) {
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
                $('.district')
                    .append($("<option value=''>Please select..</option>") //kung edit 2021-12-28
                        .attr("value", item.glb_district_id)
                        .text(item.glb_district_name));

            });
        }
    });

}

$.List_Delivery = async function (addrcitem, cusitem) {

    $('#trpModal').modal('show')

    $('#trpModalLabel').text('บริษัทเอกชน ' + addrcitem.eaddress + " จ." + addrcitem.eprovinc + " " + addrcitem.ezip);

    let url = new URL(customer_setup_trp_get);

    url.search = new URLSearchParams({
        emmas_addr_id: addrcitem['id'],
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


                //if (value['tdefault'] === 1) {
                //    flex_trpdefault = 1;
                //    return false; // breaks
                //} else {
                //    flex_trpdefault = 0;
                //    return false; // breaks
                //}

            });

            if (item_trp >= 3) {
                $('#btn-item-trp-create, #btn-item-trp-cancle, #frm_trans select,  #frm_trans input').prop('disabled', true)
                //    $('#frm_trans').find('.main-toggle').addClass('not-active');
            } else {
                $('#btn-item-trp-create, #btn-item-trp-cancle, #frm_trans select,  #frm_trans input').prop('disabled', false)
                //$('#frm_trans').find('.main-toggle').removeClass('not-active');
                //    if (flex_trpdefault == 1) {
                //        $('#frm_trans').find('.main-toggle').addClass('not-active');
                //    } else {
                //        $('#frm_trans').find('.main-toggle').removeClass('not-active');
                //    }
            }

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
                emmas_addr_id: addrcitem['id'],
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
                        $.Delivery_Zone_Get();

                        oTable_delivery.destroy();
                        $.List_Delivery(addrcitem, cusitem);
                        $.List_cus_addr(cusitem); //kung edit 2021-12-28

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

    $('#btn-edit-trp').click(function (e) {
        $('#frm_trans').parsley().on('form:submit', function () {
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
                    emmas_addr_id: citem['emmas_addr_id'],
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
                            $.Delivery_Zone_Get();
                            $('.btn-create-trp').removeClass('hide');
                            $('.btn-edit-trp').addClass('hide');
                            $.List_cus_addr(cusitem); //kung edit 2021-12-28

                        });
                    }

                }).catch((error) => {
                    toastr.error(error, 'Error writing document');
                    console.log('Error:', error);
                });

            }
            return false;

        });

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
                    $.List_cus_addr(cusitem); //kung edit 2021-12-28


                }

            }).catch((error) => {
                //toastr.error(error, 'Error writing document');
                console.log('Error:', error);

                setTimeout(function () { swal("Error deleting!" + error, "Please try again", "error"); }, 500)

            });
        }
    });

};

$.Delivery_Zone_Get = async function () {
    let zone_get_api = new URL(delivery_zone_get);

    zone_get_api.search = new URLSearchParams({
        mode: 'Search',
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
            $.each(result.data, function (index, item) {
                $('#tran_name')
                    .append($("<option value=''>Please select..</option>")//kung edit 2021-12-28 
                        .attr("value", item.id)
                        .text(item.name));


            });

        }
    });

}

//end kung edit 2021-12-24

$(document).ready(async function () {

    await $.init();
    await $.Province_Get();
    await $.Delivery_Zone_Get();

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