'use strict';

let fs = firebase.firestore();
const objProfile = JSON.parse(localStorage.getItem('objAuth'));
const user_id = objProfile[0]['username'];
const customElement = $("<div>", {
    "css": {
        "border": "2px solid",
        "font-size": "14px",
        "text-align": "center",
        "padding": '7px'
    },

    "text": 'Please Wait...'
});

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const url_api = "http://localhost:49705";
//const url_api = "http://192.168.1.247:8899/pit-api";
const url_importdate_carmodelmix_get = url_api + "/api/ImportData_CarModelMix_Get";
const url_carmodelmix_master_get = url_api + "/api/CarModelMix_Master_Get";
const url_importdate_brand_get = url_api + "/api/Vehicle_Brand_Search";
const url_importdate_model_get = url_api + "/api/Vehicle_Model_Search";
const url_importdate_minor_get = url_api + "/api/Vehicle_Minor_Search";
const url_importdate_lovdata_get = url_api + "/api/Lov_Data_Search";
const url_importdate_gcode_get = url_api + "/api/Gcode_Get";
//let url_image = 'http://192.168.1.247:8899/image_carmodelmix/'
let url_image = 'http://localhost/image_carmodelmix/'
let photo_dataSet = [];
let brand_dataSet = [];

let photo_data;
let table_main_list, table_model_line;
var item_disgroup, item_code_1, item_code_3;

function filterGlobal() {
    table_main_list = $('#tbl-main_list').DataTable().search(
        $('#global_filter').val().trim(),
        false,
        true
    ).draw();
}

function filterColumn(i) {
    tbl_main_list = $('#tbl-main_list').DataTable().column(i).search(
        $('#col' + i + '_filter').val(),
        false,
        true
    ).draw();
}

firebase.auth().onAuthStateChanged(function (user) {

    if (user) {

        $.init = async function () {

            //$('#sh_vehicel_model').parent().find('label').html('Vehicle Name')
            //$('#dt_vehicle_model').parent().parent().find('label').eq(1).attr('for').html('Vehicle Name');
            $(".card-body").LoadingOverlay("show", {
                image: '',
                custom: customElement
            });

            await $.brand_get();

            $('.car_gallery').lightGallery();

            $('#frm_search').find('#sh_vehicel_brand').off('select2:select').on('select2:select', function (evt) {

                evt.preventDefault();

                $(this).on('select2:select', function (evt) {
                    evt.preventDefault();
                });
                $("#sh_model_year option").remove();
                $("#sh_model_year").append("<option value=''>---ทั้งหมด---</option>").attr("value", '')
                $("#sh_minor_year option").remove();
                $("#sh_minor_year").append("<option value=''>---ทั้งหมด---</option>").attr("value", '')
                $("#sh_body_type option").remove();
                $("#sh_body_type").append("<option value=''>---ทั้งหมด---</option>").attr("value", '')
                $("#sh_high_stant option").remove();
                $("#sh_high_stant").append("<option value=''>---ทั้งหมด---</option>").attr("value", '')
                $("#sh_street_name option").remove();
                $("#sh_street_name").append("<option value=''>---ทั้งหมด---</option>").attr("value", '')

                $.model_get($(this).val());

            });

            $('#frm_search').find('#sh_vehicel_model').off('select2:select').on('select2:select', function (evt) {

                evt.preventDefault();

                $(this).on('select2:select', function (evt) {
                    evt.preventDefault();
                });

                $.model_change_get();
                $.minor_change_get();
                $.body_type_get();
                $.hign_stant_get();
                $.street_name_get();

            });

            $('input.global_filter').on('keyup click', function () {

                filterGlobal();

            });

            $('#btn-search').on('click', async function (e) {

                e.preventDefault();

                $(".card-body").LoadingOverlay("show", {
                    image: '',
                    custom: customElement
                });

                $('#frm_search').parsley().validate();

                if ($('#frm_search').parsley().isValid()) {

                    await $('#image_search_car').addClass('d-none')
                    //await $.main_list();
                    await $.main_list_V2();
                    await $('#global_filter').prop('disabled', false);

                } else {

                    $(".card-body").LoadingOverlay("hide", true);

                }

            });

            $(".card-body").LoadingOverlay("hide", true);
        };

        $.main_list = async function () {

            //$('#global_filter').focus();

            let url = new URL(url_importdate_carmodelmix_get);

            url.search = new URLSearchParams({

                mode: 'main_list',
                vehicle_brand: $('#frm_search').find('#sh_vehicel_brand').val(),
                vehicle_model: $('#frm_search').find('#sh_vehicel_model').val(),
                minor_change: $('#frm_search').find('#sh_minor_year').val(),
                model_change: $('#frm_search').find('#sh_model_year').val(),
                street_name: $('#frm_search').find('#sh_street_name').val() == '' || $('#frm_search').find('#sh_street_name').val() == null ? '_ALL_' : $('#frm_search').find('#sh_street_name').val(),
                body_type: $('#frm_search').find('#sh_body_type').val(),
                hign_stant: $('#frm_search').find('#sh_high_stant').val() == '' || $('#frm_search').find('#sh_high_stant').val() == null ? '_ALL_' : $('#frm_search').find('#sh_high_stant').val(),

            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                var citem = result.data;

                table_main_list = $('#tbl-main_list').DataTable({
                    data: result.data,
                    "dom": '<"top pd-b-40"i>t<"bottom pd-t-10"lp><"clear">',
                    deferRender: true,
                    ordering: false,
                    pageLength: 3,
                    bDestroy: true,
                    "lengthMenu": [3, 10, 25, 50, 75, 100],
                    columns: [
                        {
                            title: "<center>images</center>",
                            data: "images",
                            class: "tx-center wd-300",
                            //width: "300px",
                            //visible: false,
                            render: function (data, type, row, meta) {
                                //$('#carouselExample' + meta.row + '').lightGallery();

                                let str_img = '<div class="">';
                                str_img += '<div class="carousel slide" data-ride="carousel" id="carouselExample' + meta.row + '">';
                                str_img += '<div class="carousel-inner">';

                                if (row.check_photo > 0) {

                                    let img_arr = JSON.parse(data);
                                    //console.log(img_arr)
                                    let i = 1;

                                    $.each(img_arr.data, function (key, val) {
                                        let photo_url = url_image + val['photo_folder'];
                                        let photo_active = 'active'
                                        if (i > 1) {

                                            photo_active = '';
                                        }

                                        str_img += '<div  class="carousel-item ' + photo_active + '">'
                                        str_img += '<img alt="img" style="max-height:250px !important" class="d-block w-100" id="show_photo_' + i + '" src="' + photo_url + '/' + val['photo_name'] + '">'
                                        str_img += '</div >'

                                        i++
                                    })


                                } else {

                                    str_img += '<div class="carousel-item active"><img alt="img" class="d-block w-100" style="max-height:200px !important" id="show_photo_1" src="../../assets/img/no_images.png"></div>'

                                }


                                str_img += '</div>';
                                str_img += '<a class="carousel-control-prev" href="#carouselExample' + meta.row + '" role="button" data-slide="prev"><i class="fa fa-angle-left fs-30" aria-hidden="true"></i></a >';
                                str_img += '<a class="carousel-control-next" href="#carouselExample' + meta.row + '" role="button" data-slide="next"><i class="fa fa-angle-right fs-30" aria-hidden="true"></i></a >';

                                str_img += '</div></div>';

                                return str_img
                            }
                        },//1
                        {
                            title: "<center data-toggle='tooltip' title='Modelmix' >CAR</center>",
                            class: "tx-left  wd-600",
                            render: function (data, type, row, meta) {
                                //return ''
                                return '<div class="">' +
                                    '<div class="col-sm-12">' +

                                    '<div class="mg-t-3 pd-b-10">' +
                                    '<div class="tx-center">' +
                                    '<a type="button" class="details_show"><span class="tx-20 tx-center">' + row.modelmix + '</span></a>' +
                                    '</div>' +
                                    '</div>' +

                                    '<div class="row mg-t-3">' +
                                    '<label class="col-sm-2">Vehicle Brand:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.vehicle_brand +'</span>' +
                                    '</div>' +
                                    '<label class="col-sm-2">Vehicle Model:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.vehicle_model + '</span>' +
                                    '</div>' +
                                    '<label class="col-sm-2">Vehicle Cartype:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.cartype + '</span>' +
                                    '</div>' +
                                    '</div>' +

                                    '<div class="row mg-t-3">' +
                                    '<label class="col-sm-2">Model Change:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.model_change + '</span>' +
                                    '</div>' +
                                    '<label class="col-sm-2">Minor Change:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.minor_change + '</span>' +
                                    '</div>' +
                                    '<label class="col-sm-2">Fuel Type:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.fuel_type + '</span>' +
                                    '</div>' +
                                    '</div>' +

                                    '<div class="row mg-t-3">' +
                                    '<label class="col-sm-2">Engine Code:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.engine_code + '</span>' +
                                    '</div>' +
                                    '<label class="col-sm-2">Body Type:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.body_type + '</span>' +
                                    '</div>' +
                                    '<label class="col-sm-2">High Stant:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.hign_stant + '</span>' +
                                    '</div>' +
                                    '</div>' +

                                    '<div class="row mg-t-3">' +
                                    '<label class="col-sm-2">Wheel Drive:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.wheel_drive + '</span>' +
                                    '</div>' +
                                    '<label class="col-sm-2">Street Name:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.street_name + '</span>' +
                                    '</div>' +
                                    '<label class="col-sm-2">Model Code:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.model_code + '</span>' +
                                    '</div>' +
                                    '</div>' +

                                    '<div class="row mg-t-3">' +
                                    '<label class="col-sm-3">Engine Dispacement:</label>' +
                                    '<div class="col-sm-1">' +
                                    '<span>' + row.engine_displacement + '</span>' +
                                    '</div>' +
                                    '<label class="col-sm-3">Transmission Type:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.transmission_type + '</span>' +
                                    '</div>' +
                                    '</div>' +

                                    '</div>' +
                                    '</div>';

                            }
                        },//0
                        {
                            title: "<center>model id</center>",
                            data: "model_id",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//1
                        {
                            title: "<center>modelmix</center>",
                            data: "modelmix",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//2
                        {
                            title: "<center>vehicle brand</center>",
                            data: "vehicle_brand",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//3
                        {
                            title: "<center>vehicle model</center>",
                            data: "vehicle_model",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//4
                        {
                            title: "<center>cartype</center>",
                            data: "cartype",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//5
                        {
                            title: "<center>model change</center>",
                            data: "model_change",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//6
                        {
                            title: "<center>minor change</center>",
                            data: "minor_change",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//7
                        {
                            title: "<center data-toggle='tooltip' title='fuel type'>fuel type</center>",
                            data: "fuel_type",
                            class: "tx-center",
                            width: "40px",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//8
                        {
                            title: "<center data-toggle='tooltip' title='engine displacement'>engine displacement</center>",
                            data: "engine_displacement",
                            class: "tx-center",
                            width: "40px",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//9
                        {
                            title: "<center data-toggle='tooltip' title='transmission type'>transmission type</center>",
                            data: "transmission_type",
                            class: "tx-center",
                            width: "40px",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//10
                        {
                            title: "<center data-toggle='tooltip' title='body type'>body type</center>",
                            data: "body_type",
                            class: "tx-center",
                            width: "40px",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//11
                        {
                            title: "<center data-toggle='tooltip' title='hign stant'>hign stant</center>",
                            data: "hign_stant",
                            class: "tx-center",
                            width: "40px",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//12
                        {
                            title: "<center data-toggle='tooltip' title='engine code'>engine code</center>",
                            data: "engine_code",
                            class: "tx-center",
                            width: "40px",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//13
                        {
                            title: "<center data-toggle='tooltip' title='wheel drive'>wheel drive</center>",
                            data: "wheel_drive",
                            class: "tx-center",
                            width: "40px",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//14
                        {
                            title: "<center data-toggle='tooltip' title='street name'>street name</center>",
                            data: "street_name",
                            class: "tx-center",
                            width: "40px",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//15
                        {
                            title: "<center data-toggle='tooltip' title='model code'>model code</center>",
                            data: "model_code",
                            class: "tx-center",
                            width: "40px",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//16
                        {
                            title: "<center>remarks</center>",
                            data: "remarks",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//17
                        {
                            title: "<center>record_status</center>",
                            data: "record_status",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//18
                        {
                            title: "<center>created_by</center>",
                            data: "created_by",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//19
                        {
                            title: "<center>created_datetime</center>",
                            data: "created_datetime",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + moment(data).format('DD/MM/YYYY') + '</span>';
                            }
                        },//20
                        {
                            title: "<center>updated_by</center>",
                            data: "updated_by",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//21
                        {
                            title: "<center>updated_datetime</center>",
                            data: "updated_datetime",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + moment(data).format('DD/MM/YYYY') + '</span>';
                            }
                        },//22
                        {
                            title: "<center>check_photo</center>",
                            data: "check_photo",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//23
                        {
                            title: "<center>code 5</center>",
                            data: "code_e",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//24
                    ],
                    "initComplete": async function (settings, json) {
                        
                        $('#tbl-main_list tbody').on('dblclick', 'tr', async function (e) {
                            e.preventDefault()
                            var data = table_main_list.row(this).data();

                            console.log('data',data)

                            await $.main_details(data);
                            await $.photo_main_details(data);
                            await $.carmodel_gallery_main(data);

                        });

                        //$('.details_show').on('dblclick', async function (e) {

                        //    e.preventDefault()

                        //    var data = table_main_list.row(this).data();

                        //    console.log('data', data)
                        //   alert('data')

                        //});

                        //$.contextMenu({
                        //    selector: '#tbl-main_list tbody tr',
                        //    callback: async function (key, options) {

                        //        let citem = table_main_list.row(this).data();

                        //        if (key === 'view') {

                        //            await $.main_details(citem);
                        //            await $.photo_main_details(citem);

                        //        } else {
                        //            //$LogEventCreate('create', result['status'], JSON.stringify(citem))
                        //            alert('ERROR');
                        //        }

                        //    },
                        //    items: {
                        //        //"gallery": { name: "Gallery", icon: "fas fa-image", style: "color: #ee335e!important; " },
                        //        "view": { name: "View", icon: "fas fa-search" },

                        //    }
                        //});

                    }

                });

                $(".card-body").LoadingOverlay("hide", true);

            });

        };

        $.main_details = async function (citem) {

            await $('#modal-frm_data').modal({
                keyboard: false,
                backdrop: 'static'
            });

            console.log('citem', citem)
            $(".tx-detail").empty();

            $('#frm_data').find('#dt_modelmix').html(citem['modelmix']);
            $('#frm_data').find('#dt_vehicle_brand').html(citem['vehicle_brand']);
            $('#frm_data').find('#dt_vehicle_model').html(citem['vehicle_model']);
            $('#frm_data').find('#dt_vehicle_cartype').html(citem['cartype']);
            $('#frm_data').find('#dt_model_change').html(citem['model_change']);
            $('#frm_data').find('#dt_minor_change').html(citem['minor_change']);
            $('#frm_data').find('#dt_fuel_type').html(citem['fuel_type']);
            $('#frm_data').find('#dt_engine_displacement').html(citem['engine_displacement']);
            $('#frm_data').find('#dt_engine_code').html(citem['engine_code']);
            $('#frm_data').find('#dt_trnasmission_type').html(citem['transmission_type']);
            $('#frm_data').find('#dt_wheel_drive').html(citem['wheel_drive']);
            $('#frm_data').find('#dt_wheel_drive').html(citem['wheel_drive']);
            $('#frm_data').find('#dt_model_code').html(citem['model_code']);
            $('#frm_data').find('#dt_remarks').html(citem['remarks']);
            $('#frm_data').find('#dt_body_type').html(citem['body_type']);
            $('#frm_data').find('#dt_high_stant').html(citem['hign_stant']);
            $('#frm_data').find('#dt_street_name').html(citem['street_name']);

            // $.photo_main_details(citem)
        };

        $.main_list_V2 = async function () {

            let url = new URL(url_importdate_carmodelmix_get);

            url.search = new URLSearchParams({

                mode: 'main_list_V2',
                vehicle_brand: $('#frm_search').find('#sh_vehicel_brand').val(),
                vehicle_model: $('#frm_search').find('#sh_vehicel_model').val(),
                minor_change: $('#frm_search').find('#sh_minor_year').val(),
                model_change: $('#frm_search').find('#sh_model_year').val(),
                street_name: $('#frm_search').find('#sh_street_name').val(),
                body_type: $('#frm_search').find('#sh_body_type').val(),
                hign_stant: $('#frm_search').find('#sh_high_stant').val(),
                //street_name: $('#frm_search').find('#sh_street_name').val() == '' || $('#frm_search').find('#sh_street_name').val() == null ? '_ALL_' : $('#frm_search').find('#sh_street_name').val(),
                //body_type: $('#frm_search').find('#sh_body_type').val() == '' || $('#frm_search').find('#sh_body_type').val() == null ? '_ALL_' : $('#frm_search').find('#sh_body_type').val(),
                //hign_stant: $('#frm_search').find('#sh_high_stant').val() == '' || $('#frm_search').find('#sh_high_stant').val() == null ? '_ALL_' : $('#frm_search').find('#sh_high_stant').val(),

            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                var citem = result.data;

                table_main_list = $('#tbl-main_list').DataTable({
                    data: result.data,
                    "dom": '<"top pd-b-40"i>t<"bottom pd-t-10"lp><"clear">',
                    deferRender: true,
                    ordering: false,
                    pageLength: 3,
                    bDestroy: true,
                    "lengthMenu": [3, 10, 25, 50, 75, 100],
                    columns: [
                        {
                            title: "<center>images</center>",
                            data: "images",
                            class: "tx-center wd-300",
                            //width: "300px",
                            //visible: false,
                            render: function (data, type, row, meta) {
                                //$('#carouselExample' + meta.row + '').lightGallery();

                                let str_img = '<div class="">';
                                str_img += '<div class="carousel slide" data-ride="carousel" id="carouselExample' + meta.row + '">';
                                str_img += '<div class="carousel-inner">';

                                if (row.check_photo > 0) {

                                    let img_arr = JSON.parse(data);
                                    //console.log(img_arr)
                                    let i = 1;

                                    $.each(img_arr.data, function (key, val) {
                                        let photo_url = url_image + val['photo_folder'];
                                        let photo_active = 'active'
                                        if (i > 1) {

                                            photo_active = '';
                                        }

                                        str_img += '<div  class="carousel-item ' + photo_active + '">'
                                        str_img += '<img alt="img" style="max-height:250px !important" class="d-block w-100" id="show_photo_' + i + '" src="' + photo_url + '/' + val['photo_name'] + '">'
                                        str_img += '</div >'

                                        i++
                                    })

                                } else {

                                    str_img += '<div class="carousel-item active"><img alt="img" class="d-block w-100" style="max-height:200px !important" id="show_photo_1" src="../../assets/img/no_images.png"></div>'

                                }

                                str_img += '</div>';
                                str_img += '<a class="carousel-control-prev" href="#carouselExample' + meta.row + '" role="button" data-slide="prev"><i class="fa fa-angle-left fs-30" aria-hidden="true"></i></a >';
                                str_img += '<a class="carousel-control-next" href="#carouselExample' + meta.row + '" role="button" data-slide="next"><i class="fa fa-angle-right fs-30" aria-hidden="true"></i></a >';

                                str_img += '</div></div>';

                                return str_img

                            }
                        },//1
                        {
                            title: "<center data-toggle='tooltip' title='Modelmix'>Vehicle Model</center>",
                            class: "tx-left  wd-600",
                            render: function (data, type, row, meta) {
                                //return ''
                                return '<div class="">' +
                                    '<div class="col-sm-12">' +

                                    '<div class="mg-t-3 pd-b-10">' +
                                    '<div class="tx-center">' +
                                    '<a type="button" class="details_show"><span class="tx-20 tx-center">' + row.vehicle_model + ' ' + row.minor_change + ' ' + row.body_type + ' ' + row.hign_stant + ' ' + row.street_name + '</span></a>' +
                                    '</div>' +
                                    '</div>' +

                                    '<div class="row mg-t-3">' +
                                    '<label class="col-sm-2">Vehicle Brand:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.vehicle_brand + '</span>' +
                                    '</div>' +
                                    '<label class="col-sm-2">Vehicle Model:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.vehicle_model + '</span>' +
                                    '</div>' +
                                    '<label class="col-sm-2">Vehicle Cartype:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.cartype + '</span>' +
                                    '</div>' +
                                    '</div>' +

                                    '<div class="row mg-t-3">' +
                                    '<label class="col-sm-2">Model Change:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.model_change + '</span>' +
                                    '</div>' +
                                    '<label class="col-sm-2">Minor Change:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.minor_change + '</span>' +
                                    '</div>' +
                                    '</div>' +

                                    '<div class="row mg-t-3">' +
                                    '<label class="col-sm-2">Body Type:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.body_type + '</span>' +
                                    '</div>' +
                                    '<label class="col-sm-2">High Stant:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.hign_stant + '</span>' +
                                    '</div>' +
                                    '<label class="col-sm-2">Street Name:</label>' +
                                    '<div class="col-sm-2">' +
                                    '<span>' + row.street_name + '</span>' +
                                    '</div>' +
                                    '</div>' +

                                    '</div>' +
                                    '</div>';

                            }
                        },//0
                        {
                            title: "<center>vehicle brand</center>",
                            data: "vehicle_brand",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//3
                        {
                            title: "<center>vehicle model</center>",
                            data: "vehicle_model",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//4
                        {
                            title: "<center>cartype</center>",
                            data: "cartype",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//5
                        {
                            title: "<center>minor change</center>",
                            data: "model_change",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//7
                        {
                            title: "<center>minor change</center>",
                            data: "minor_change",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//7
                        {
                            title: "<center data-toggle='tooltip' title='body type'>body type</center>",
                            data: "body_type",
                            class: "tx-center",
                            width: "40px",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//11
                        {
                            title: "<center data-toggle='tooltip' title='hign stant'>hign stant</center>",
                            data: "hign_stant",
                            class: "tx-center",
                            width: "40px",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//12
                        {
                            title: "<center data-toggle='tooltip' title='street name'>street name</center>",
                            data: "street_name",
                            class: "tx-center",
                            width: "40px",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//15
                        {
                            title: "<center>check_photo</center>",
                            data: "check_photo",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//23
                    ],
                    "initComplete": async function (settings, json) {

                        $('#tbl-main_list tbody').off('dblclick', 'tr').on('dblclick', 'tr', async function (evt) {

                            evt.preventDefault();

                            $(this).on('dblclick', function (evt) {
                                evt.preventDefault();
                            });

                            var data = table_main_list.row(this).data();

                            console.log('data', data)

                            await $.main_details_V2(data);
                            await $.photo_main_details_V2(data);
                            await $.carmodel_gallery_main_V2(data);

                        });

                    }

                });

                //$('#tbl-carmodel_list tbody').off('click').on('click', 'td.details-control .show-detail', function (evt) {

                //    evt.preventDefault();

                //    var tr = $(this).closest('tr');
                //    var row = tbl_carmodel_list.row(tr);

                //    if (row.child.isShown()) {

                //        row.child.hide();
                //        tr.removeClass('shown');

                //    }
                //    else {
                //        console.log(row)
                //        //format(row.child, $(this).attr('data-modelmix'));
                //        $.carmodel_sub_list(row.child, $(this).attr('data-modelmix'), $(this).attr('data-minor_change'), $(this).attr('data-engine_displacement'));
                //        $.carmodel_sub_list_v2(result.data);

                //        tr.addClass('shown');
                //    }
                //});

                $(".card-body").LoadingOverlay("hide", true);

            });

        };

        $.main_details_V2 = async function (citem) {

            console.log('citem', citem)

            await $('#modal-frm_data').modal({
                keyboard: false,
                backdrop: 'static'
            });

            $(".tx-detail").empty();

            $('#frm_data').find('#dt_modelmix').html(citem['vehicle_model'] + ' ' + citem['minor_change'] + ' ' + citem['body_type'] + ' ' + citem['hign_stant'] + ' ' + citem['street_name'] );
            $('#frm_data').find('#dt_vehicle_brand').html(citem['vehicle_brand']);
            $('#frm_data').find('#dt_vehicle_model').html(citem['vehicle_model']);
            $('#frm_data').find('#dt_vehicle_cartype').html(citem['cartype']);
            $('#frm_data').find('#dt_model_change').html(citem['model_change']);
            $('#frm_data').find('#dt_minor_change').html(citem['minor_change']);
            $('#frm_data').find('#dt_body_type').html(citem['body_type']);
            $('#frm_data').find('#dt_high_stant').html(citem['hign_stant']);
            $('#frm_data').find('#dt_street_name').html(citem['street_name']);

            var pd_vehicle_model = citem['vehicle_model'] // == '' || citem['vehicle_model'] == null ? '_ALL_' : citem['vehicle_model']
            var pd_minor_change = citem['minor_change'] //== '' || citem['minor_change'] == null ? '_ALL_' : citem['minor_change']
            var pd_body_type = citem['body_type'] //== '' || citem['body_type'] == null ? '_ALL_' : citem['body_type']
            var pd_hign_stant = citem['hign_stant'] // == '' || citem['hign_stant'] == null ? '_ALL_' : citem['hign_stant']
            var pd_street_name = citem['street_name'] // == '' || citem['street_name'] == null ? '_ALL_' : citem['street_name']

            fetch(url_importdate_carmodelmix_get + '?mode=' + 'model_line' + '&vehicle_model=' + pd_vehicle_model + '&minor_change=' + pd_minor_change + '&body_type=' + pd_body_type + '&hign_stant=' + pd_hign_stant + '&street_name=' + pd_street_name).then(function (response) {
                return response.json();
            }).then(function (result) {

                console.log('result', result.data)

                if (result.length > 0) {

                    let line_data = [];
                    let i = 1;

                    $.each(result.data, function (key, val) {

                        let data = JSON.stringify(val)

                        line_data.push([
                            i,
                            val['fuel_type'],
                            val['engine_displacement'],
                            val['engine_code'],
                            val['transmission_type'],
                            val['wheel_drive'],
                            val['model_code'],
                            val['remarks']
                        
                        ])

                        i++

                    });

                    table_model_line = $('#tbl-model_line').DataTable({
                        "data": line_data,
                        "dom": 't',
                        "bDestroy": true,
                        "deferRender": true,
                        "order": [[0, "desc"]],
                        "ordering": false,
                        "columnDefs": [{
                            "targets": 'no-sort',
                            "orderable": false,
                        }],
                    });

                    table_model_line.columns.adjust();

                }
            });

        };

        $.photo_main_details_V2 = async function (citem) {

            $('#photo_1 , #photo_2 , #photo_3 , #photo_4').attr('src', 'assets/img/photos/1.jpg');
            $('#photo_mix_1 , #photo_mix_2 , #photo_mix_3 , #photo_mix_4').attr('src', 'assets/img/photos/1.jpg');
            $('#photo_slide_1 , #photo_slide_2 , #photo_slide_3 , #photo_slide_4').attr('src', 'assets/img/photos/1.jpg');
            $('#photo_slide_mix_1 , #photo_slide_mix_2 , #photo_slide_mix_3 , #photo_slide_mix_4').attr('src', 'assets/img/photos/1.jpg');

            let model_line = citem['vehicle_model'] + ' ' + citem['minor_change'] + ' ' + citem['body_type'] + ' ' + citem['hign_stant'] + ' ' + citem['street_name']
            console.log('model_line', model_line)

            fetch(url_importdate_carmodelmix_get + '?mode=' + 'photo_main' + '&modelmix=' + model_line).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.length > 0) {

                    var photo_folder = result.data[0]['photo_folder']
                    let photo_url = url_image + photo_folder;
                    let i = 1;

                    $.each(result.data, function (key, val) {

                        let data = JSON.stringify(val)

                        let photo_id = val['photo_id'];
                        let photo_name = val['photo_name'];

                        $('#photo_' + i).attr('src', photo_url + '/' + photo_name);
                        $('#photo_slide_' + i).attr({ src: photo_url + '/' + photo_name, 'data-id': photo_id });

                        i++

                    });

                }

            });

        };

        $.carmodel_gallery_main_V2 = async function (citem) {

            //console.log('citem', citem)

            $('#frm_data').find('#modelmix , #text_modelmix').html('');
            //$('#frm_gallery_main').find('#modelmix').html(citem['model_id'] + ' ' + citem['modelmix']);

            $('#gm_photo_1 , #gm_photo_2 ,#gm_photo_3 ,#gm_photo_4, #gm_s_photo_1 , #gm_s_photo_2 ,#gm_s_photo_3 ,#gm_s_photo_4').attr('src', 'assets/img/photos/1.jpg');
            $('#m_photo_1 , #m_photo_2 ,#m_photo_3 ,#m_photo_4, #m_s_photo_1 , #m_s_photo_2 ,#m_s_photo_3 ,#m_s_photo_4').attr('data-src', 'assets/img/photos/1.jpg');
            $('#m_photo_1 , #m_photo_2 ,#m_photo_3 ,#m_photo_4, #m_s_photo_1 , #m_s_photo_2 ,#m_s_photo_3 ,#m_s_photo_4').attr('data-responsive', 'assets/img/photos/1.jpg');

            let model_line = citem['vehicle_model'] + ' ' + citem['minor_change'] + ' ' + citem['body_type'] + ' ' + citem['hign_stant'] + ' ' + citem['street_name']
            console.log('model_line', model_line)

            fetch(url_importdate_carmodelmix_get + '?mode=' + 'photo_main' + '&modelmix=' + model_line).then(function (response) {
                return response.json();
            }).then(function (result) {

                console.log('result', result.data)

                if (result.length > 0) {

                    var photo_folder = result.data[0]['photo_folder']
                    var photo_no = result.data[0]['photo_no']
                    var model_id = result.data[0]['model_id']
                    var modelmix = result.data[0]['modelmix']
                    let photo_url = url_image + photo_folder;
                    let i = 1;

                    $('#frm_data').find('#modelmix').html(model_id + '  ' + modelmix);
                    $('#frm_data').find('#text_modelmix').html(photo_no);

                    $.each(result.data, function (key, val) {

                        let photo_name = val['photo_name'];
                        $('#gm_photo_' + i).attr('src', photo_url + '/' + photo_name);
                        $('#m_photo_' + i).attr('data-responsive', photo_url + '/' + photo_name);
                        $('#m_photo_' + i).attr('data-src', photo_url + '/' + photo_name);
                        $('#m_photo_' + i).attr('data-sub-html', 'CarModel_Main ' + ' : ' + photo_name);

                        i++
                    });
                }
            });

        };

        $.photo_main_details = async function (citem) {

            $('#photo_1 , #photo_2 , #photo_3 , #photo_4').attr('src', 'assets/img/photos/1.jpg');
            $('#photo_mix_1 , #photo_mix_2 , #photo_mix_3 , #photo_mix_4').attr('src', 'assets/img/photos/1.jpg');
            $('#photo_slide_1 , #photo_slide_2 , #photo_slide_3 , #photo_slide_4').attr('src', 'assets/img/photos/1.jpg');
            $('#photo_slide_mix_1 , #photo_slide_mix_2 , #photo_slide_mix_3 , #photo_slide_mix_4').attr('src', 'assets/img/photos/1.jpg');

            fetch(url_importdate_carmodelmix_get + '?mode=' + 'photo_modelmix' + '&modelmix=' + citem['model_id']).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.length > 0) {

                    var photo_folder = result.data[0]['photo_folder']
                    let photo_url = url_image + photo_folder;
                    let i = 1;

                    $.each(result.data, function (key, val) {

                        let data = JSON.stringify(val)

                        let photo_id = val['photo_id'];
                        let photo_name = val['photo_name'];

                        $('#photo_' + i).attr('src', photo_url + '/' + photo_name);
                        $('#photo_slide_' + i).attr({ src: photo_url + '/' + photo_name, 'data-id': photo_id });

                        i++

                    });

                }

            });

            fetch(url_importdate_carmodelmix_get + '?mode=' + 'photo_modelmix_sub' + '&modelmix=' + citem['model_id']).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.length > 0) {

                    let photo_url = url_image + citem['model_id'];
                    let i = 1;

                    $.each(result.data, function (key, val) {

                        let data = JSON.stringify(val)
                        let photo_id = val['photo_id'];
                        let photo_name = val['photo_name'];

                        $('#photo_mix_' + i).attr('src', photo_url + '/' + photo_name);
                        $('#photo_slide_mix_' + i).attr({ src: photo_url + '/' + photo_name, 'data-id': photo_id });

                        i++

                    });

                } else {


                }

            });

        };

        $.carmodel_gallery_main = async function (citem) {

            //console.log('citem', citem)

            $('#frm_data').find('#modelmix , #text_modelmix').html('');
            //$('#frm_gallery_main').find('#modelmix').html(citem['model_id'] + ' ' + citem['modelmix']);

            $('#gm_photo_1 , #gm_photo_2 ,#gm_photo_3 ,#gm_photo_4, #gm_s_photo_1 , #gm_s_photo_2 ,#gm_s_photo_3 ,#gm_s_photo_4').attr('src', 'assets/img/photos/1.jpg');
            $('#m_photo_1 , #m_photo_2 ,#m_photo_3 ,#m_photo_4, #m_s_photo_1 , #m_s_photo_2 ,#m_s_photo_3 ,#m_s_photo_4').attr('data-src', 'assets/img/photos/1.jpg');
            $('#m_photo_1 , #m_photo_2 ,#m_photo_3 ,#m_photo_4, #m_s_photo_1 , #m_s_photo_2 ,#m_s_photo_3 ,#m_s_photo_4').attr('data-responsive', 'assets/img/photos/1.jpg');

            fetch(url_importdate_carmodelmix_get + '?mode=' + 'photo_modelmix' + '&modelmix=' + citem['model_id']).then(function (response) {
                return response.json();
            }).then(function (result) {

                console.log('result', result.data)

                if (result.length > 0) {

                    var photo_folder = result.data[0]['photo_folder']
                    var photo_no = result.data[0]['photo_no']
                    var model_id = result.data[0]['model_id']
                    var modelmix = result.data[0]['modelmix']
                    let photo_url = url_image + photo_folder;
                    let i = 1;

                    $('#frm_data').find('#modelmix').html(model_id + '  ' + modelmix);
                    $('#frm_data').find('#text_modelmix').html(photo_no);

                    $.each(result.data, function (key, val) {

                        let photo_name = val['photo_name'];
                        $('#gm_photo_' + i).attr('src', photo_url + '/' + photo_name);
                        $('#m_photo_' + i).attr('data-responsive', photo_url + '/' + photo_name);
                        $('#m_photo_' + i).attr('data-src', photo_url + '/' + photo_name);
                        $('#m_photo_' + i).attr('data-sub-html', 'CarModel_Main ' + ' : ' + photo_name);

                        i++
                    });
                }
            });

            fetch(url_importdate_carmodelmix_get + '?mode=' + 'photo_modelmix_sub' + '&modelmix=' + citem['model_id']).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.length > 0) {

                    var photo_folder = result.data[0]['photo_folder']
                    var model_id = result.data[0]['model_id']
                    var modelmix = result.data[0]['modelmix']
                    let photo_url = url_image + model_id;
                    let i = 1;

                    $('#frm_data').find('#modelmix').html(model_id + '  ' + modelmix);

                    $.each(result.data, function (key, val) {

                        let photo_name = val['photo_name'];
                        $('#gm_s_photo_' + i).attr('src', photo_url + '/' + photo_name);
                        $('#m_s_photo_' + i).attr('data-responsive', photo_url + '/' + photo_name);
                        $('#m_s_photo_' + i).attr('data-src', photo_url + '/' + photo_name);
                        $('#m_s_photo_' + i).attr('data-sub-html', 'CarModel_Sub ' + ' : ' + photo_name);

                        i++
                    });
                }

            });


        };

        $.brand_get = function () {

            fetch(url_carmodelmix_master_get + '?mode=' + 'vehicle_brand').then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    $("#sh_vehicel_brand option").remove();
                    $("#sh_vehicel_brand").append("<option value=''>---ทั้งหมด---</option>").attr("value", '')

                    $.each(result.data, function (key, val) {

                        brand_dataSet.push({ id: val['code'], text: val['code'] });

                    });

                    $('#sh_vehicel_brand').select2({
                        width: '100%',
                        height: '40px',
                        data: brand_dataSet,
                        templateResult: function (data) {
                            return data.text;
                        },
                        sorter: function (data) {
                            return data.sort(function (a, b) {
                                return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                            });
                        }
                    });

                }

            });

        };

        $.model_get = function (brand) {

            let url = new URL(url_carmodelmix_master_get);

            url.search = new URLSearchParams({
                mode: 'vehicle_model',
                keywords: brand
            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    $("#sh_vehicel_model option").remove();
                    $("#sh_vehicel_model").append("<option value=''>---ทั้งหมด---</option>").attr("value", '')

                    let model_dataSet = [];

                    $.each(result.data, function (key, val) {

                        model_dataSet.push({ id: val['code'], text: val['code'] });

                    });

                    $('#sh_vehicel_model').select2({
                        width: '100%',
                        height: '40px',
                        data: model_dataSet,
                        templateResult: function (data) {
                            return data.text;
                        },
                        sorter: function (data) {
                            return data.sort(function (a, b) {
                                return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                            });
                        }
                    });

                }

            });

        };

        $.model_change_get = function () {

            let url = new URL(url_carmodelmix_master_get);

            url.search = new URLSearchParams({
                mode: 'model_change',
                keywords: $('#sh_vehicel_brand').val(),
                keywords_1: $('#sh_vehicel_model').val(),
            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    $("#sh_model_year option").remove();
                    $("#sh_model_year").append("<option value=''>---ทั้งหมด---</option>").attr("value", '')

                    let sh_dataSet = [];

                    $.each(result.data, function (key, val) {

                        sh_dataSet.push({ id: val['code'], text: val['code'] });

                    });

                    $('#sh_model_year').select2({
                        width: '100%',
                        height: '40px',
                        data: sh_dataSet,
                        templateResult: function (data) {
                            return data.text;
                        },
                        sorter: function (data) {
                            return data.sort(function (a, b) {
                                return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                            });
                        }
                    });

                }

            });

        };

        $.minor_change_get = function () {

            let url = new URL(url_carmodelmix_master_get);

            url.search = new URLSearchParams({
                mode: 'minor_change',
                keywords: $('#sh_vehicel_brand').val(),
                keywords_1: $('#sh_vehicel_model').val(),
            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    $("#sh_minor_year option").remove();

                    $("#sh_minor_year").append("<option value=''>---ทั้งหมด---</option>").attr("value", '')

                    let sh_dataSet = [];

                    $.each(result.data, function (key, val) {

                        sh_dataSet.push({ id: val['code'], text: val['code'] });

                    });

                    $('#sh_minor_year').select2({
                        width: '100%',
                        height: '40px',
                        data: sh_dataSet,
                        templateResult: function (data) {
                            return data.text;
                        },
                        sorter: function (data) {
                            return data.sort(function (a, b) {
                                return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                            });
                        }
                    });

                }

            });

        };

        $.body_type_get = function () {

            let url = new URL(url_carmodelmix_master_get);

            url.search = new URLSearchParams({
                mode: 'body_type',
                keywords: $('#sh_vehicel_brand').val(),
                keywords_1: $('#sh_vehicel_model').val(),
            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    $("#sh_body_type option").remove();

                    $("#sh_body_type").append("<option value='_ALL_'>---ทั้งหมด---</option>").attr("value", '')
                    $("#sh_body_type").append("<option value='-'>ธรรมดา</option>").attr("value", ' ')

                    let sh_dataSet = [];

                    $.each(result.data, function (key, val) {

                        sh_dataSet.push({ id: val['code'], text: val['code'] });

                    });

                    $('#sh_body_type').select2({
                        width: '100%',
                        height: '40px',
                        data: sh_dataSet,
                        templateResult: function (data) {
                            return data.text;
                        },
                        sorter: function (data) {
                            return data.sort(function (a, b) {
                                return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                            });
                        }
                    });

                }

            });

        };

        $.hign_stant_get = function () {

            let url = new URL(url_carmodelmix_master_get);

            url.search = new URLSearchParams({
                mode: 'hign_stant',
                keywords: $('#sh_vehicel_brand').val(),
                keywords_1: $('#sh_vehicel_model').val(),
            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    $("#sh_high_stant option").remove();
                    $("#sh_high_stant").append("<option value='_ALL_'>---ทั้งหมด---</option>").attr("value", '')
                    $("#sh_high_stant").append("<option value='-'>ธรรมดา</option>").attr("value", ' ')

                    let sh_dataSet = [];

                    $.each(result.data, function (key, val) {

                        sh_dataSet.push({ id: val['code'], text: val['code'] });

                    });

                    $('#sh_high_stant').select2({
                        width: '100%',
                        height: '40px',
                        data: sh_dataSet,
                        templateResult: function (data) {
                            return data.text;
                        },
                        sorter: function (data) {
                            return data.sort(function (a, b) {
                                return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                            });
                        }
                    });

                }

            });

        };

        $.street_name_get = function () {

            let url = new URL(url_carmodelmix_master_get);

            url.search = new URLSearchParams({
                mode: 'street_name',
                keywords: $('#sh_vehicel_brand').val(),
                keywords_1: $('#sh_vehicel_model').val(),
            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    $("#sh_street_name option").remove();

                    $("#sh_street_name").append("<option value='_ALL_'>---ทั้งหมด---</option>").attr("value", '')
                    $("#sh_street_name").append("<option value='-'>ธรรมดา</option>").attr("value", ' ')


                    let sh_dataSet = [];

                    $.each(result.data, function (key, val) {

                        sh_dataSet.push({ id: val['code'], text: val['code'] });

                    });

                    $('#sh_street_name').select2({
                        width: '100%',
                        height: '40px',
                        data: sh_dataSet,
                        templateResult: function (data) {
                            return data.text;
                        },
                        sorter: function (data) {
                            return data.sort(function (a, b) {
                                return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                            });
                        }
                    });

                }

            });

        };

        //$.list_modelmix = function format(callback, modelmix, minor_change, engine_displacement) {

        //    fetch(url_importdate_carmodelmix_get + '?mode=' + 'sub_carmodelmix' + '&modelmix=' + modelmix + '&minor_change=' + minor_change + '&engine_displacement=' + engine_displacement).then(function (response) {
        //        return response.json();
        //    }).then(function (result) {

        //        var data = result.data;

        //        var thead = "<th class='border-bottom-0'>#</th>" +
        //            "<th class='border-bottom-0 tx-center'>Model ID</th>" +
        //            "<th class='border-bottom-0 tx-center'>Model Change</th>" +
        //            "<th class='border-bottom-0 tx-center'>Minor Change</th>" +
        //            "<th class='border-bottom-0 tx-center'>Fuel Type</th>" +
        //            "<th class='border-bottom-0 tx-center'>Engine Disp.</th>" +
        //            "<th class='border-bottom-0 tx-center'>Engine Code</th>" +
        //            "<th class='border-bottom-0 tx-center'>Transmission</th>" +
        //            "<th class='border-bottom-0 tx-center'>Body type</th>" +
        //            "<th class='border-bottom-0 tx-center'>High Stant</th>" +
        //            "<th class='border-bottom-0 tx-center'>Wheel Drive</th>" +
        //            "<th class='border-bottom-0 tx-center'>Street Name</th>" +
        //            "<th class='border-bottom-0 tx-center'>Model Code</th>" +
        //            "<th class='border-bottom-0 tx-center'>Image</th>" +
        //            "<th class='border-bottom-0 tx-center'>Manage</th>";

        //        var tbody = '';
        //        // let i = 1;
        //        let i = result.length
        //        let image = ''

        //        $.each(data, function (key, val) {

        //            let citem = JSON.stringify(val)

        //            image = val.check_photo > '0' ? "<button onclick='$.carmodel_gallery_sub(" + citem + ")' data-item='" + citem + "' style='margin: .25rem .125rem; ' class='btn btn-sm tx-primary view_photo' data-action='view_photo' id='view_photo" + i + "' type='button'><i class='bx bx-image tx-22'></i></button>" : "<button style='margin: .25rem .125rem;' class='btn btn-sm tx-danger view_photo' data-action='view_photo' type='button'><i class='bx bx-image tx-22'></i></button>"

        //            tbody += "<tr>" +
        //                "<td>" + '<span class="tx-primary">' + i + '</span>' + "</td>" +
        //                "<td>" + val.model_id + "</td>" +
        //                "<td>" + val.model_change + "</td>" +
        //                "<td>" + val.minor_change + "</td>" +
        //                "<td>" + val.fuel_type + "</td>" +
        //                "<td>" + val.engine_displacement + "</td>" +
        //                "<td>" + val.engine_code + "</td>" +
        //                "<td>" + val.transmission_type + "</td>" +
        //                "<td>" + val.body_type + "</td>" +
        //                "<td>" + val.hign_stant + "</td>" +
        //                "<td>" + val.wheel_drive + "</td>" +
        //                "<td>" + val.street_name + "</td>" +
        //                "<td>" + val.model_code + "</td>" +
        //                "<td>" +
        //                "<div class='d-flex flex-row justify-content-center'> " +
        //                image +
        //                // "<button onclick='$.carmodel_photo(" + citem + ")' data-item='" + citem + "' style='margin: .25rem .125rem; ' class='btn btn-sm tx-primary view_photo' data-action='view_photo' id='view_photo" + i + "' type='button'><i class='bx bx-image tx-22'></i></button>" +
        //                "</div >" +
        //                "</td>" +
        //                "<td>" +
        //                "<div class='d-flex flex-row justify-content-center'>" +
        //                "<button onclick='$.carmodel_details(" + citem + ")' data-item='" + citem + "' style='margin: .25rem .125rem; ' class='btn btn-outline-warning btn-sm view-item view_item' data-action='view'  id='view_item" + i + "' type='button'>View</button>" +
        //                "<button onclick='$.carmodel_update(" + citem + ")' data-item='" + citem + "' style='margin: .25rem .125rem; ' class='btn btn-outline-primary btn-sm edit-item update_item' data-action='update'  id='update_item" + i + "' type='button'>Edit</button>" +
        //                "<button onclick='$.carmodel_delete(" + citem + ")' data-item='" + citem + "' style='margin: .25rem .125rem; ' class='btn btn-outline-danger btn-sm delete-item delete_item' data-action='delete' id='delete_item" + i + "' type='button'>Delete</button>" +
        //                "</div>"
        //            "</td>" +
        //                "</tr>";
        //            i--
        //        });

        //        callback($('<table id="tbl-sub_carmodel" class="table text-md-nowrap">' + thead + tbody + '</table>')).show();

        //    });

        //};

        $(document).ready(async function () {

            await $.init();
            //await $.main_list();

        });

    } else {

        window.location.assign('./login');

    }

});