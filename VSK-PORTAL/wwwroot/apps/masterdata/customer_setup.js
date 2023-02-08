'use strict';

let fs = firebase.firestore();

let collection = 'lov_cn';
let oTable, oTable_trp, oTable_cus, name;
let url_api = 'http://192.168.1.247/vsk-api-acc/';
//let url_api_new = "http://localhost:49256/";
let url_api_new = "http://localhost:49705/"; 

let customer_get = url_api + 'api/ACC/VSK_Emmas_GET';
let provicne_get = url_api + 'api/ACC/ACCGlb_Province_List_Get';
let amphur_get = url_api + 'api/ACC/ACCGlb_Amphur_List_Get';
let district_get = url_api + 'api/ACC/ACCGlb_District_List_Get';
let postcode_get = url_api + 'api/ACC/ACCGlb_Amphur_postcode_List_Get';
let customer_setup_add = url_api_new + 'v1/Customer_Setup_Add';
let customer_setup_get = url_api_new + 'v1/Customer_Setup_Get';
let Customer_Setup_Update = url_api_new + 'v1/Customer_Setup_Update';
let customer_setup_trp_add = url_api_new + 'v1/Customer_Setup_Trp_Add';
let customer_setup_trp_get = url_api_new + 'v1/Customer_Setup_Trp_Get';
let Customer_Setup_Trp_Update = url_api_new + 'v1/Customer_Setup_Trp_Update';
let Customer_Setup_Delete = url_api_new + 'v1/Customer_Setup_Delete';
let Customer_Setup_Trp_Delete = url_api_new + 'v1/Customer_Setup_Trp_Delete';
let Delivery_Zone_Get = url_api_new + 'v1/Delivery_Zone_Get';
let zone_get = url_api_new + 'v1/Zone_Get';
let route_get = url_api_new + 'v1/Route_Get';

let cus_address, cus_tumbol, cus_amphur, cus_provinc, cus_zip, flex_trpdefault = 0, flex_adddefault = 0;
let tumbol_dataSet = [];
let amphur_dataSet = [];
let provinc_dataSet = [];
let delivery_zone_dataset = [];
let route_dataSet = [];
let zone_dataSet = [];
let customer_dataSet = [];

$.init = function () {
    $("#global-loader").fadeOut("slow");
    //$.Customer_Get();
    $("#tran_name option").remove();
    $('#tran_name').append($("<option value=''>Please select..</option>"));

    $(".btn-search").on('click', function (e) {
        e.preventDefault();
        $.Customer_Get();
    })

    $(".provicne").on('change', function () {
        $(".amphur option").remove();
        $(".amphur").append('<option>Please select..</option>').attr("value", '');
        $.Amphur_Get($(this).val());
        $(".district").val('').trigger('change');;
        $('#postcode').val('');
    })

    $(".amphur").on('change', function () {
        $(".district option").remove();
        $(".district").append('<option>Please select..</option>').attr("value", '');
        $.District_Get($(this).val());
        $.Postcode_Get($(this).val());
    })

    $("#suggesstion-box").hide();

    $("#customer_code").keyup(function () {
        $.ajax({
            url: url_api + 'api/ACC/VSK_Emmas_Select2_GET',
            data: 'search=' + $(this).val(),
            beforeSend: function () {
                $("#search-box").css("background", "#FFF");
            },
            success: function (result) {
                $("#suggesstion-box").show();
                $("#suggesstion-box a").remove();

                $.each(result.data, function (index, item) {
                    let code = item['id'];
                    $("#suggesstion-box").append('<a class="list-group-item list-group-item-action list-code" style="width: 349px; cursor: pointer;" data-code="' + code + '">' + item['text'] + '</a>');

                });

                $('#suggesstion-box > a').on('click', function (e) {
                    e.preventDefault();
                    $("#customer_code").val($(this).data('code'));
                    $('#suggesstion-box > a').remove();

                    return false;
                })
            }
        });
    });

    $("#zone").on('change', function () {
        $("#route option").remove();
        $.Route_Get($(this).val());

    })
    $("#btn-item_reset").on('click', function () {
        $('#frm_customer').trigger('reset');
        $('#frm_customer').find('.main-toggle').removeClass('on');
        $('#provicne').val('').trigger('change');
        $('#btn-item-create').prop('disabled', false);
        $('#btn-edit').prop('disabled', false);
        $('.btn-create').removeClass('hide');
        $('.btn-edit').addClass('hide');
        $('#frm_customer').find('input, textarea').attr('readonly', false);
        $('#frm_customer').find('select, input:radio').attr('disabled', false);

        if (flex_adddefault == 1) {
            $('#frm_customer').find('.main-toggle').addClass('not-active');
        } else {
            $('#frm_customer').find('.main-toggle').removeClass('not-active');
        }


    })
    $("#btn-item-trp-cancle").on('click', function () {
        $('#frm_trans').trigger('reset');
        $('#tran_name').val('').trigger('change');
        $('#frm_trans').find('.main-toggle').removeClass('on');
        $('#btn-item-trp-create').prop('disabled', false);
        $('#btn-edit-trp').prop('disabled', false);
        $('.btn-create-trp').removeClass('hide');
        $('.btn-edit-trp').addClass('hide');
        $('#frm_trans').find('input, textarea').attr('readonly', false);
        $('#frm_trans').find('select, input:radio').attr('disabled', false);

        if (flex_trpdefault == 1) {
            $('#frm_trans').find('.main-toggle').addClass('not-active');
        } else {
            $('#frm_trans').find('.main-toggle').removeClass('not-active');
        }



    })

    $('#tran_name').select2({
        ajax: {
            url: Delivery_Zone_Get,
            dataType: 'json',
            width: 'resolve',
            dropdownAutoWidth: true,
            minimumInputLength: 2,
            minimumResultsForSearch: 50,
            data: function (params) {
                var query = {
                    mode: 'Search',
                    record_status: 1,
                    name: typeof params.term !== 'undefined' ? params.term : ' ',
                }
                //console.log(params);
                return query;
            },
            matcher: function (params, data) {
                return matchStart(params, data);
            },
            processResults: function (data, search) {
                //console.log(data);
                return {
                    results: $.map(data.data, function (item) {
                        return {
                            text: item.name,
                            id: item.id
                        }
                    })
                };
            },
        }
    });

    $.Create();
    $.Zone_Get('search');

};

$.Customer_Get = async function () {
    let customer_get_api = new URL(customer_get);

    customer_get_api.search = new URLSearchParams({
        emmas_code: $('#customer_code').val(),
    });

    fetch(customer_get_api).then(function (response) {
        return response.json();
    }).then(function (result) {
        if (result.status === 'Error') {

            $.LoadingOverlay("hide");

            $("#global-loader").fadeOut("slow");

            swal({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
                //footer: '<a href>Why do I have this issue?</a>'
            }, function (isConfirmed) {
                if (isConfirmed) {

                    location.reload();

                }
            })


        } else {
            customer_dataSet = [];
            $.each(result.data, function (index, item) {
                //console.log('emmas', item['code']);
                $('#cus_code').val(item['code']);
                $('#cus_name').val(item['lname']);
                $('#cus_address_search').val(item['eaddress'] + '  ' + item['etumbol'] + '  ' + item['eamphur'] + '  ' + item['eprovinc'] + '  ' + item['ezip']);
                $('#send_form').val(); // ผู้ส่ง
                $('#sale').val(item['esale']);
                $('#tel').val(item['etel']);
                cus_address = item['eaddress'];
                cus_tumbol = item['etumbol'];
                cus_amphur = item['eamphur'];
                cus_provinc = item['eprovinc'];
                cus_zip = item['ezip'];
                $('.esave-group').html(item['esalegroup']);
                customer_dataSet = { code: item.code, text: item.code + ' ' + item.lname };
            });
            $.List_cus_addr();
            //$.List_TRP();

        }

    });
    return false;
}

$.Zone_Get = async function (mode) {
    let zone_get_api = new URL(zone_get);

    zone_get_api.search = new URLSearchParams({
        mode: mode,
        record_status: '1',
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
                if (mode != '') {
                    $('.zone')
                        .append($("<option>Please select..</option>")
                            .attr("value", item.lov_id)
                            .text(item.lov1));


                } else {
                    zone_dataSet.push({ id: item.lov_id, text: item.lov1 });
                }

            });

        }
    });

}

$.Delivery_Zone_Get = async function () {
    let zone_get_api = new URL(Delivery_Zone_Get);

    zone_get_api.search = new URLSearchParams({
        mode: 'Search',
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
                    .append($("<option>Please select..</option>")
                        .attr("value", item.id)
                        .text(item.name));


                delivery_zone_dataset.push({ id: item.id, zone: item.lov_zone_code, route: item.lov_route_code, text: item.name });
            });

        }
    });

}

$.Route_Get = async function (parent_lov_id) {
    let route_get_api = new URL(route_get);

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
            $.each(result.data, function (index, item) {
                if (parent_lov_id != '') {
                    $('.route')
                        .append($("<option>Please select..</option>")
                            .attr("value", item.lov_id)
                            .text(item.lov1));

                } else {

                    route_dataSet.push({ id: item.lov_id, text: item.lov1 });

                }
            });

        }
    });

}

$.Provicne_Get = async function () {
    $(".provicne").append('<option>Please select..</option>').attr("value", '');

    let provicne_get_api = new URL(provicne_get);

    //provicne_get_api.search = new URLSearchParams({
    //    parent_lov_id: parent_lov_id
    //});


    fetch(provicne_get_api).then(function (response) {
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
                $('.provicne')
                    .append($("<option>Please select..</option>")
                        .attr("value", item.glb_province_id)
                        .text(item.glb_province_name));
                provinc_dataSet.push({ id: item.glb_province_id, text: item.glb_province_name });
            });

        }
    });

}

$.Amphur_Get = async function (provicne_id) {
    let amphur_get_api = new URL(amphur_get);

    amphur_get_api.search = new URLSearchParams({
        glb_province_id: provicne_id
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
                if (provicne_id == '' || provicne_id == null) {
                    amphur_dataSet.push({ id: item.glb_amphur_id, text: item.glb_amphur_name });

                } else {
                    $('.amphur')
                        .append($("<option>Please select..</option>")
                            .attr("value", item.glb_amphur_id)
                            .text(item.glb_amphur_name));

                }
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
                if (amphur_id == '' || amphur_id == null) {
                    tumbol_dataSet.push({ id: item.glb_district_id, text: item.glb_district_name });

                } else {
                    $('.district')
                        .append($("<option>Please select..</option>")
                            .attr("value", item.glb_district_id)
                            .text(item.glb_district_name));

                }
            });
        }
    });

}

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

$.List_cus_addr = async function () {

    let url = new URL(customer_setup_get);

    url.search = new URLSearchParams({
        emmas_code: $('#customer_code').val(),
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

            //$.each(result.data, function (key, value) {

            //    if (value['edefault'] === 1) {
            //        flex_adddefault = 1;
            //        return false; // breaks
            //    }
            //});

            //if (flex_adddefault == 1) {
            //    $('#frm_customer').find('.main-toggle').addClass('not-active');
            //} else {
            //    $('#frm_customer').find('.main-toggle').removeClass('not-active');
            //}

            oTable_cus = $('#tbl-cus-list').DataTable({
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
                        title: "<div  class='tx-center'><span style='font-size:11px;'>ที่อยู่</span></div>",
                        data: "eaddress",
                        width: "100px",
                        //visible: false,
                        class: "tx-left",
                        render: function (data, type, row, meta) {
                            let subdistrict = row.eprovinc_id == '1' ? ' แขวง ' + row.etumbol : ' ตำบล ' + row.etumbol
                            let district = row.eprovinc_id == '1' ? ' เขต ' + row.eamphur : ' อำเภอ ' + row.eamphur
                            let provinc = row.eprovinc_id == '1' ? ' ' + row.eprovinc : ' จังหวัด ' + row.eprovinc
                            return '<span style="font-size:11px;">' + data + subdistrict + district + provinc + ' ' + row.ezip + '</span>';
                        }
                    }, //1

                    //{
                    //    title: "<span style='font-size:11px;'>จังหวัด</span>",
                    //    data: "eprovinc",
                    //    width: "70px",
                    //    class: "tx-center",
                    //    render: function (data, type, row, meta) {
                    //        if (data != '' && data != null) {

                    //            return '<span style="font-size:11px;">' + data + '</span>';

                    //        } else {
                    //            return '<span style="font-size:11px;">' + '-' + '</span>';

                    //        }
                    //    }
                    //}, //2
                    //{
                    //    title: "<span style='font-size:11px;'>รหัสไปษณีย์</span>",
                    //    data: "ezip",
                    //    width: "70px",
                    //    class: "tx-center",
                    //    render: function (data, type, row, meta) {
                    //        return '<span style="font-size:11px;">' + data + '</span>';
                    //    }
                    //}, //3
                    {
                        title: "<span style='font-size:11px;'>เรื่มต้น</span>",
                        data: "edefault",
                        width: "50px",
                        class: "tx-center pt-1 pb-1",
                        render: function (data, type, row, meta) {
                            if (data == 1) {
                                return "<span style='font-size: 15px;'><i class='tx-primary fas fa-check-square'></i></span>";
                            } else if (data == 0) {
                                return "<span style='font-size: 15px;'><i class='tx-primary far fa-square'></i></span>";

                            }
                        }
                    }, //4
                //    {
                //        title: "<span style='font-size:11px;'>จัดการ</span>",
                //        class: "tx-center ",
                //        data: "id",
                //        width: "50px",
                //        visible: false,
                //        render: function (data, type, row, meta) {
                //            let data_row = JSON.stringify(row)
                //            if (row.record_status == '1') {
                //                return "<a type='button' style='margin: 0 5px 0 5px;' class='btn btn-lg action btn-circle btn-info' data-id='" + data + " 'data-toggle='dropdown'> <i style='color:#ecf0fa;' class='fas fa-edit'></i></a><div class='dropdown-menu'><a  class='dropdown-item btn-action' data-row='" + data_row + "' data-action='view' style='cursor: pointer;'>View<input type='file' style='display: none;' multiple=''></a><a  class='dropdown-item btn-action' data-row='" + data_row + "' data-action='edit' style='cursor: pointer;'>Edit<input type='file' style='display: none;' multiple=''></a></div></div><a style='margin: 0 5px 0 5px;' type='button' class='btn btn-lg action btn-circle btn-danger btn-action' data-row='" + data_row + "'data-action='delete'><i style='color:#ecf0fa;' class='fa fa-trash'></i></a>"
                //            } else if (row.record_status == 'delete') {
                //                return "<a type='button' style='margin: 0 5px 0 5px;' class='btn btn-lg action btn-circle btn-info' data-id='" + data + " 'data-toggle='dropdown'> <i style='color:#ecf0fa;' class='fas fa-edit'></i></a><div class='dropdown-menu'><a  class='dropdown-item btn-action' data-row='" + data_row + "' data-action='view' style='cursor: pointer;'>View<input type='file' style='display: none;' multiple=''></a><a  class='dropdown-item btn-action' data-row='" + data_row + "' data-action='edit' style='cursor: pointer;'>Edit<input type='file' style='display: none;' multiple=''></a></div></div>"
                //            }
                //        }
                //    }, //5
                //    {
                //        title: "<center style='width: 20px;'></center>",
                //        class: 'dt-control tx-center',
                //        "orderable": false,
                //        "defaultContent": '',
                //        width: "20px",
                //        render: function (data, type, row, meta) {

                //            return '<i class="si si si-plus show-detail tx-primary"></i>';
                //        }
                //    }, //5
                ],


                "order": [[0, "asc"]],
                "initComplete": function (settings, json) {

                    // $.LoadingOverlay("hide")
                    //$('#tbl-cus-list tbody').on('click', 'td.dt-control', function () {
                    //    var tr = $(this).closest('tr');
                    //    var row = oTable_cus.row(tr);

                    //    if (row.child.isShown()) {
                    //        // This row is already open - close it
                    //        row.child.hide();
                    //        tr.removeClass('shown');
                    //    }
                    //    else {
                    //        // Open this row
                    //        //let Tabletwo = Tabletwo(row.data())

                    //        let data = row.data();

                    //        var thead = "<th class='border-bottom-0'>#</th>" +
                    //            "<th class='border-bottom-0 tx-center'>ชื่อขนส่งเอกชน</th>" +
                    //            "<th class='border-bottom-0 tx-center'>ชำระค่าขนส่ง</th>" +
                    //            "<th class='border-bottom-0 tx-center'>Zone</th>" +
                    //            "<th class='border-bottom-0 tx-center'>พื้นที่</th>" +
                    //            "<th class='border-bottom-0 tx-center'>เรื่มต้น</th>";

                    //        fetch(customer_setup_trp_get + '?emmas_addr_id=' + data.id + '&emmas_code=' + data.emmas_code + '&mode=Search').then(function (response) {
                    //            return response.json();
                    //        }).then(function (result) {

                    //            var tbody = '';
                    //            $.each(result.data, function (key, val) {
                    //                tbody += "<tr>" +
                    //                    "<td>" + '<span class="tx-primary">' + (key+1) + '</span>' + "</td>" +
                    //                    "<td>" + val.name + "</td>" +
                    //                    "<td>" + val.lov_deliverycost_code + "</td>" +
                    //                    "<td>" + val.lov_zone_code + "</td>" +
                    //                    "<td>" + val.lov_route_name + "</td>" +
                    //                    "<td>" + val.tdefault + "</td>" +
                    //                    "</tr>";
                    //            })

                    //            //return '<table class="table text-md-nowrap">' + thead + tbody + '</table>'
                    //            row.child('<table class="table text-md-nowrap">' + thead + tbody + '</table>').show();
                    //            tr.addClass('shown');

                    //        })



                    //        //console.log('row.data',row.data())

                    //    }
                    //});



                    $.contextMenu({
                        selector: '#tbl-cus-list tbody tr',
                        callback: function (key, options) {

                            let citem = oTable_cus.row(this).data();


                            if (key === 'view') {

                                $.Details(citem);

                            } else if (key === 'edit') {

                                $.Edit(citem);

                            } else if (key === 'delete') {

                                $.Delete(citem);

                            } else if (key === 'trp') {

                                $.List_TRP(citem);

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


                    $("#global-loader").fadeOut("slow");

                    $('#tbl-cus-list tbody tr').hover(function () {
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

$.List_TRP = async function (addrcitem) {

    $('#trpModal').modal('show')

    $('#trpModalLabel').text('บริษัทเอกชน ' + addrcitem.eaddress + " จ." + addrcitem.eprovinc + " " + addrcitem.ezip);

    let url = new URL(customer_setup_trp_get);

    url.search = new URLSearchParams({
        emmas_addr_id: addrcitem['id'],
        emmas_code: $('#customer_code').val(),
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

            oTable_trp = $('#tbl-trp-list').DataTable({
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

                            let trpitem = oTable_trp.row(this).data();

                            console.log('trpitem ', trpitem)

                            if (key === 'view') {

                                $.Details_Trp(trpitem);

                            } else if (key === 'edit') {

                                $.Edit_Trp(trpitem, addrcitem);

                            } else if (key === 'delete') {

                                $.Delete_Trp(trpitem,addrcitem);

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

    $.Create_trp(addrcitem)

    $('#trpModal').on('hide.bs.modal', function () {
        $('#frm_trans select').val('').trigger('change');
    });
}

$.Create = async function () {
    $('#btn-item-create').on('click',function (e) {
        e.preventDefault();

        let submit_action = $(this).data('action');

        $('#frm_customer').parsley().validate();

        if ($('#frm_customer').parsley().isValid()) {

            $('.btn-save_form').prop('disabled', true);

            // Model & Repo ไปเปลี่ยนเอาเอง
            let add_data = {
                emmas_code: $('#cus_code').val(),
                ecate: '2',
                eaddress: $('#cus_address').val(),
                etumbol: $('#district').val(),
                eamphur: $('#amphur').val(),
                eprovinc: $('#provicne').val(),
                ezip: $('#postcode').val(),
                etel: $('#tel').val(),
                edefault: $('#frm_customer .default-switches').hasClass("on") == true ? 1 : 0,
                //record_status: $("#record_status_1").is(":checked") === true ? '1' : '0',
                record_status: '1',
                created_by: name,
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
                if (data.status === 'Error') {
                    toastr.error(data.error_message);

                } else {

                    toastr.success('Save Successfully!', async function () {
                        $('#frm_customer').find('input,select').val('');
                        $('#frm_customer').find('.parsley-success').removeClass('parsley-success');
                        $('#frm_customer').find('.default-switches').removeClass('on');
                        //$('#frm_customer').find('select, input:radio').attr('disabled', true);
                        $(".provicne option").remove();
                        $(".amphur option").remove();
                        $(".district option").remove();
                        $.Provicne_Get();
                        $.List_cus_addr();

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

$.Create_trp = async function (addrcitem) {

    $('#btn-item-trp-create').off().on('click', function (e) {
        e.preventDefault();

        $('#frm_trans').parsley().validate();

        if ($('#frm_trans').parsley().isValid()) {
            let add_data = {
                emmas_addr_id: addrcitem['id'],
                emmas_code: $('#cus_code').val(),
                tdefault: $('#frm_trans .default-switches').hasClass("on") === true ? 1 : 0,
                vendor_id: $('#tran_name').val(),
                lov_deliverycost_code: $("#lov_deliverycost_code_1").is(":checked") === true ? '1' : '2',
                record_status: '1',
                created_by: name,
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

                        oTable_trp.destroy();
                        $.List_TRP(addrcitem);

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

$.Details = async function (citem) {

    $('#btn-item-create').prop('disabled', true);
    $('#btn-edit').prop('disabled', true);

    $('.btn-create').removeClass('hide');
    $('.btn-edit').addClass('hide');

    $('#frm_customer').find('input, textarea').attr('readonly', true);
    $('#frm_customer').find('select, input:radio').attr('disabled', true);
    $('#frm_customer').find('.main-toggle').addClass('not-active');

    $('#customer_code').val(citem['emmas_code']);
    $('#cus_address').val(citem['eaddress']);
    $('#provicne').val(citem['eprovinc_id']).trigger('change');
    setTimeout(function () {
        $('#amphur').val(citem['eamphur_id']).trigger('change');
    }, 500);

    setTimeout(function () {
        $('#district').val(citem['etumbol_id']).trigger('change');
    }, 1000);

    $('#postcode').val(citem['ezip']);
    citem['edefault'] == '1' ? $('#frm_customer .default-switches').addClass('on') : $('#frm_customer .default-switches').removeClass('on');

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

$.Edit = async function (citem) {
    $.Details(citem);

    $('#btn-item-create').prop('disabled', false);
    $('#btn-edit').prop('disabled', false);

    $('.btn-create').addClass('hide');
    $('.btn-edit').removeClass('hide');

    $('#frm_customer').find('input, textarea').removeAttr('readonly');
    $('#frm_customer').find('select, input:radio').removeAttr('disabled');
    $('#frm_customer').find('.default-switches').removeClass('not-active');

    $('#btn-edit').click(function (e) {
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
                    emmas_code: $('#cus_code').val(),
                    ecate: '2',
                    eaddress: $('#cus_address').val(),
                    etumbol: $('#district').val(),
                    eamphur: $('#amphur').val(),
                    eprovinc: $('#provicne').val(),
                    ezip: $('#postcode').val(),
                    etel: $('#tel').val(),
                    edefault: $('#frm_customer .default-switches').hasClass("on") === true ? 1 : 0,
                    record_status: '1',
                    updated_by: name,
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
                            oTable_cus.destroy();
                            $.List_cus_addr();
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

$.Edit_Trp = async function (citem, addrcitem) {
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
                    emmas_code: $('#cus_code').val(),
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
                            $.List_TRP(addrcitem);
                            $.Delivery_Zone_Get();
                            $('.btn-create-trp').removeClass('hide');
                            $('.btn-edit-trp').addClass('hide');

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

$.Delete = async function (citem) {
    swal({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    },function(isConfirmed) {
        if (isConfirmed) {
            let add_data = {
                id: citem['id'],
                record_status: '0',
                pMessage: '',
                updated_by: name,
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

                if (data.status === 'Error') {
                    toastr.error(data.error_message);

                } else {

                    oTable_cus.destroy();
                    $.List_cus_addr();
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

$.Delete_Trp = async function (trpcitem,addrcitem) {
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
                    oTable_trp.destroy();
                    $.List_TRP(addrcitem);
                    

                }

            }).catch((error) => {
                //toastr.error(error, 'Error writing document');
                console.log('Error:', error);
                
                setTimeout(function () { swal("Error deleting!" + error, "Please try again", "error"); }, 500)

            });
        }
    });

};

function Tabletwo(d) {
    // `d` is the original data object for the row

    var thead = "<th class='border-bottom-0'>#</th>" +
        "<th class='border-bottom-0 tx-center'>ชื่อขนส่งเอกชน</th>" +
        "<th class='border-bottom-0 tx-center'>ชำระค่าขนส่ง</th>" +
        "<th class='border-bottom-0 tx-center'>Zone</th>" +
        "<th class='border-bottom-0 tx-center'>พื้นที่</th>" +
        "<th class='border-bottom-0 tx-center'>เรื่มต้น</th>";

    fetch(customer_setup_trp_get + '?emmas_addr_id=' + d.id + '&emmas_code=' + d.emmas_code + '&mode=Search').then(function (response) {
        return response.json();
    }).then(function (result) {

        var tbody = '';
        $.each(result.data, function (key, val) {
            tbody += "<tr>" +
                "<td>" + '<span class="tx-primary">' + key + '</span>' + "</td>" +
                "<td>" + val.name + "</td>" +
                "<td>" + val.lov_deliverycost_code + "</td>" +
                "<td>" + val.lov_zone_code + "</td>" +
                "<td>" + val.lov_route_name + "</td>" +
                "<td>" + val.tdefault + "</td>" +
                "</tr>";
        })

        return '<table class="table text-md-nowrap">' + thead + tbody + '</table>'
    })

}

$(document).ready(async function () {
    await $.District_Get('');
    await $.Provicne_Get();
    await $.Amphur_Get('');
    await $.Zone_Get('');
    await $.Route_Get('');
    await $.Delivery_Zone_Get();
    await $.init();

});

firebase.auth().onAuthStateChanged(function (user) {

    if (user) {

        var full_mail = user.email;
        name = full_mail.replace("@vskautoparts.com", "");

    } else {

        window.location.assign('./login');

    }

});