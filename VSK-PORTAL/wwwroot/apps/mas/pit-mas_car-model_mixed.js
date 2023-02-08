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
const url_importdate_carmodelmix_tmp = url_api + "/api/ImportData_CarModelMix_Tmp";
const url_importdate_carmodelmix_tmptran = url_api + "/api/ImportData_CarModelMix_TmpTran";
const url_importdate_carmodelmix_verify = url_api + "/api/ImportData_CarModelMix_Verify";
const url_importdate_carmodelmix_upload = url_api + "/api/ImportData_CarModelMix_Upload";
const url_importdate_carmodelmix_get = url_api + "/api/ImportData_CarModelMix_Get";
const url_importdate_carmodelmix_action = url_api + "/api/ImportData_CarModelMix_Action";
const url_carmodelmix_master_get = url_api + "/api/CarModelMix_Master_Get";
const url_importdate_brand_get = url_api + "/api/Vehicle_Brand_Search";
const url_importdate_model_get = url_api + "/api/Vehicle_Model_Search";
const url_importdate_minor_get = url_api + "/api/Vehicle_Minor_Search";
const url_importdate_lovdata_get = url_api + "/api/Lov_Data_Search";
const url_importdate_gcode_get = url_api + "/api/Gcode_Get";
const url_importdate_upload_photo = url_api + "/api/CarModelMix_Master_Upload_Photo";
const url_importdate_photo_delete = url_api + "/api/CarModelMix_Master_Photo_Delete";
const url_importdate_photo_delete_sub = url_api + "/api/CarModelMix_Master_Photo_Delete_Sub";
const url_importdate_photo_delete_modelmix = url_api + "/api/CarModelMix_Master_Photo_Delete_Modelmix";

let template_url = 'http://192.168.1.247/template/';
//let url_image = 'http://192.168.1.247:8899/image_carmodelmix/'

let url_image = 'http://localhost/image_carmodelmix/'
let photo_dataSet = [];
let photo_data;
let brand_dataSet = [];
let table_carnodel_import, tbl_carmodel_list, tbl_sub_carmodel, tbl_sub_photo, username, tbl_up_photo, tbl_model_photo;
var item_disgroup, item_code_1, item_code_3;

function filterGlobal() {
    tbl_carmodel_list = $('#tbl-carmodel_list').DataTable().search(
        $('#global_filter').val().trim(),
        false,
        true
    ).draw();
}

function filterColumn(i) {
    tbl_carmodel_list = $('#tbl-carmodel_list').DataTable().column(i).search(
        $('#col' + i + '_filter').val(),
        false,
        true
    ).draw();
}

firebase.auth().onAuthStateChanged(function (user) {

    if (user) {

        $.init = async function () {

            $(".card-body").LoadingOverlay("show", {
                image: '',
                custom: customElement
            });

            /* $('#col113_filter').attr('id', 'col13_filter');*/

            $('.lightgallery_main').lightGallery();
            $('.car_gallery').lightGallery();

            $('#modal-frm_gallery').find('.img-responsive').on('click', function () {

                // $('#modal-frm_gallery').modal('hide')
            });

            $('#modal-frm_gallery_main').find('.img-responsive').on('click', function () {

                // $('#modal-frm_gallery_main').modal('hide')
            });

            $('.lg-close').on('click', function () {

                $('#modal-frm_gallery_main').modal({ keyboard: false, backdrop: 'static' });

            });

            let i;
            let year = new Date().getFullYear();
            for (i = year + 5; i > 1900; i--) {
                $('.year').append($('<option />').val(i).html(i));
            }

            await $.brand_get();

            await $.master_get();

            $('#frm_search').find('#search_vehicle_brand').off('select2:select').on('select2:select', function (evt) {

                evt.preventDefault();

                $(this).on('select2:select', function (evt) {
                    evt.preventDefault();
                });

                $.model_get($(this).val());

            });

            $('#frm_search').find('#search_vehicle_model').off('select2:select').on('select2:select', function (evt) {

                evt.preventDefault();

                $(this).on('select2:select', function (evt) {
                    evt.preventDefault();
                });

                $.minor_get($(this).val());

            });

            $('#modal-carmodel_upload').off('shown.bs.modal').on('shown.bs.modal', async function (e) {

                await $.carmodel_import();

                await setTimeout(function () {

                }, 300);

            });

            $('#modal-carmodel_upload').off('hidden.bs.modal').on('hidden.bs.modal', async function () {

                await setTimeout(function () {

                    location.reload();

                }, 100);

            });

            $('#modal-report').off('shown.bs.modal').on('shown.bs.modal', async function (e) {

                //await $.report();

            });

            $('#modal-report').off('hidden.bs.modal').on('hidden.bs.modal', async function () {

                await setTimeout(function () {

                    location.reload();

                }, 100);

            });

            $('#modal-frm_data').on('hidden.bs.modal', function () {

                $("#btn-save_exit").removeClass('btn-danger')
                $("#btn-save_exit").text('Save').addClass('btn-primary')

                tbl_sub_photo.clear().draw();

                //$('#tbl-photo tbody').empty();

            });

            $('#modal-upload_photo').off('shown.bs.modal').on('shown.bs.modal', async function (e) {

                $('#frm_upload_photo').find('.dropify').prop('disabled', true);
                //$('#frm_upload_photo').find('select').prop("disabled", true);
                $('#frm_upload_photo').find('.dropify-wrapper').css({ "height": "200px" });
                $('#frm_upload_photo').find('#up_photo_1').attr('src', 'assets/img/photos/1.jpg');
                $('#frm_upload_photo').find('#up_photo_2').attr('src', 'assets/img/photos/1.jpg');
                $('#frm_upload_photo').find('#up_photo_3').attr('src', 'assets/img/photos/1.jpg');
                $('#frm_upload_photo').find('#up_photo_4').attr('src', 'assets/img/photos/1.jpg');
                $('#frm_upload_photo').find('#up_photo_slide_1').attr('src', 'assets/img/photos/1.jpg');
                $('#frm_upload_photo').find('#up_photo_slide_2').attr('src', 'assets/img/photos/1.jpg');
                $('#frm_upload_photo').find('#up_photo_slide_3').attr('src', 'assets/img/photos/1.jpg');
                $('#frm_upload_photo').find('#up_photo_slide_4').attr('src', 'assets/img/photos/1.jpg');

                let search_vehicle_brand = $('#search_vehicle_brand').val()

                $.carmodelmix_select2(search_vehicle_brand)

            });

            $('#modal-upload_photo').off('hidden.bs.modal').on('hidden.bs.modal', async function (e) {

                await setTimeout(function () {

                    //location.reload();
                    //tbl_up_photo.destroy();
                    $('#frm_upload_photo').find('#modelmix').html('');
                    $("#tbl-up_photo_wrapper tbody").empty();
                    $("#tbl-model_photo_wrapper").addClass('d-none');
                    $("#tbl-model_photo_wrapper tbody").empty();



                }, 100);
            });

            $('#btn-search').on('click', async function (e) {

                e.preventDefault();

                $(".card-body").LoadingOverlay("show", {
                    image: '',
                    custom: customElement
                });

                $('#frm_search').parsley().validate();

                if ($('#frm_search').parsley().isValid()) {

                    await $.carmodel_list();

                    $('#image_search_car').addClass('d-none')

                    $('#accordion').removeClass('d-none');

                    $('#btn-report').removeClass('d-none');

                    $('#btn-upload_photo').removeClass('d-none');

                } else {

                    $(".card-body").LoadingOverlay("hide", true);

                }

            });

            $('#btn-reset').click(function (e) {

                e.preventDefault();

                $('.search_global_filter').addClass('d-none');

                $("#report_vehicle_brand option").remove();
                $("#report_vehicle_brand").append("<option value=''>---select---</option>").attr("value", '')

                $("#report_vehicle_model option").remove();
                $("#report_vehicle_model").append("<option value=''>---select---</option>").attr("value", '')

                $("#report_vehicle_minor option").remove();
                $("#report_vehicle_minor").append("<option value=''>---select---</option>").attr("value", '')

                $.brand_get();
            });

            $('#btn_downloadtemplate').on('click', function (evt) {

                location.href = template_url + 'Import_MasterData_CarModelMix.xlsx';

            });

            $('#btn-report').on('click', function (evt) {

                let brand = $('#frm_search').find('#search_vehicle_brand :selected').text();

                let url_report = "http://192.168.1.159/ReportServer/Pages/ReportViewer.aspx?%2fReport+Project1%2fRPT_PIA_CarmodelMix_V1&rs:Command=Render&vehicle_brand=" + brand + "";

                window.open(url_report, '_blank');
            });

            $('#p_carmodelmix').change(function (e) {

                e.preventDefault();

                // var newStr = $(this).val().replaceAll(/[.*+?^${}()|[\]\\/]/g, '')

                //console.log('newStr', newStr )
                $('#frm_upload_photo').find('#modelmix').html('');
                //$('#frm_upload_photo').find('#modelmix').html($(this).val());
                $('#frm_upload_photo').find('#modelmix').html($('#p_carmodelmix :selected').text()).css("color", "RoyalBlue");
                $('#frm_upload_photo').find('#up_photo_1').attr('src', 'assets/img/photos/1.jpg');
                $('#frm_upload_photo').find('#up_photo_2').attr('src', 'assets/img/photos/1.jpg');
                $('#frm_upload_photo').find('#up_photo_3').attr('src', 'assets/img/photos/1.jpg');
                $('#frm_upload_photo').find('#up_photo_4').attr('src', 'assets/img/photos/1.jpg');
                $('#frm_upload_photo').find('#up_photo_slide_1').attr('src', 'assets/img/photos/1.jpg');
                $('#frm_upload_photo').find('#up_photo_slide_2').attr('src', 'assets/img/photos/1.jpg');
                $('#frm_upload_photo').find('#up_photo_slide_3').attr('src', 'assets/img/photos/1.jpg');
                $('#frm_upload_photo').find('#up_photo_slide_4').attr('src', 'assets/img/photos/1.jpg');

                if ($(this).val() != '') {

                    $.carmodel_photo_details_main();
                    //  $.carmodel_photo_details_main($(this).val());

                } else {

                }

            });

            $('#upload_photo_main').change(function (e) {

                e.preventDefault();

                if ($(this).val() != '') {

                    $.carmodel_photo_upload_main($(this).val());

                } else {

                }

            });

            $('input.global_filter').on('keyup click', function () {

                filterGlobal();

            });

            $('input.column_filter').on('keyup', function () {


                filterColumn($(this).attr('data-column'));

            });

            $('#frm_upload_photo').find('#p_carmodelmix').off('select2:select').on('select2:select', function (evt) {

                evt.preventDefault();

                $(this).on('select2:select', function (evt) {
                    evt.preventDefault();
                });

                photo_data = evt.params.data;

            });

            $(".card-body").LoadingOverlay("hide", true);
        };

        $.carmodel_gallery_sub = async function (citem) {

            $('#g_photo_1 , #g_photo_2 ,#g_photo_3 ,#g_photo_4').attr('src', 'assets/img/photos/1.jpg');
            $('#s_photo_1 , #s_photo_2 ,#s_photo_3 ,#s_photo_4').attr('data-src', 'assets/img/photos/1.jpg');
            $('#s_photo_1 , #s_photo_2 ,#s_photo_3 ,#s_photo_4').attr('data-responsive', 'assets/img/photos/1.jpg');

            await $('#modal-frm_gallery').modal({ keyboard: false, backdrop: 'static' });

            fetch(url_importdate_carmodelmix_get + '?mode=' + 'photo_sub' + '&modelmix=' + citem['model_id']).then(function (response) {
                return response.json();
            }).then(function (result) {

                let photo_url = url_image + citem['model_id'];
                let i = 1;

                $.each(result.data, function (key, val) {

                    let photo_name = val['photo_name'];
                    $('#g_photo_' + i).attr('src', photo_url + '/' + photo_name);
                    $('#s_photo_' + i).attr('data-responsive', photo_url + '/' + photo_name);
                    $('#s_photo_' + i).attr('data-src', photo_url + '/' + photo_name);

                    i++
                });

            });

        };

        $.carmodel_gallery_main = async function (citem) {

            //console.log('citem', citem)

            $('#frm_gallery_main').find('#modelmix , #text_modelmix').html('');
            //$('#frm_gallery_main').find('#modelmix').html(citem['model_id'] + ' ' + citem['modelmix']);

            $('#gm_photo_1 , #gm_photo_2 ,#gm_photo_3 ,#gm_photo_4, #gm_s_photo_1 , #gm_s_photo_2 ,#gm_s_photo_3 ,#gm_s_photo_4').attr('src', 'assets/img/photos/1.jpg');
            $('#m_photo_1 , #m_photo_2 ,#m_photo_3 ,#m_photo_4, #m_s_photo_1 , #m_s_photo_2 ,#m_s_photo_3 ,#m_s_photo_4').attr('data-src', 'assets/img/photos/1.jpg');
            $('#m_photo_1 , #m_photo_2 ,#m_photo_3 ,#m_photo_4, #m_s_photo_1 , #m_s_photo_2 ,#m_s_photo_3 ,#m_s_photo_4').attr('data-responsive', 'assets/img/photos/1.jpg');

            //await $('#modal-frm_gallery_main').modal({ keyboard: false, backdrop: 'static' });

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

                    $('#frm_gallery_main').find('#modelmix').html(model_id + '  ' + modelmix);
                    $('#frm_gallery_main').find('#text_modelmix').html(photo_no);

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

                    $('#frm_gallery_main').find('#modelmix').html(model_id + '  ' + modelmix);

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

        $.carmodel_photo_details_main = async function () {

            $('#frm_upload_photo').find('#up_photo_1').attr('src', 'assets/img/photos/1.jpg');
            $('#frm_upload_photo').find('#up_photo_2').attr('src', 'assets/img/photos/1.jpg');
            $('#frm_upload_photo').find('#up_photo_3').attr('src', 'assets/img/photos/1.jpg');
            $('#frm_upload_photo').find('#up_photo_4').attr('src', 'assets/img/photos/1.jpg');
            $('#frm_upload_photo').find('#up_photo_slide_1').attr('src', 'assets/img/photos/1.jpg');
            $('#frm_upload_photo').find('#up_photo_slide_2').attr('src', 'assets/img/photos/1.jpg');
            $('#frm_upload_photo').find('#up_photo_slide_3').attr('src', 'assets/img/photos/1.jpg');
            $('#frm_upload_photo').find('#up_photo_slide_4').attr('src', 'assets/img/photos/1.jpg');

            let modelmix = $('#p_carmodelmix').val();
            let p_carmodelmix = $('#p_carmodelmix').val();
            var modelmix_replace = p_carmodelmix.replaceAll(/[.*+?#^${}()|[\]\\/]/g, ' ')

            $('#tbl-model_photo').removeClass('d-none')

            setTimeout(function () {

                $('#frm_upload_photo').find('.dropify').prop('disabled', false);

            }, 100)

            fetch(url_importdate_carmodelmix_get + '?mode=' + 'photo_main' + '&modelmix=' + modelmix_replace).then(function (response) {
                return response.json();
            }).then(function (result) {

                var modelmix_replace1 = modelmix.replaceAll(/[.*+?^${}()|[\]\\/] /g, '')

                let photo_url = url_image + modelmix_replace1;
                let data_photo = [];
                let i = 1;

                $.each(result.data, function (key, val) {

                    let data = JSON.stringify(val)

                    let photo_id = val['photo_id'];
                    let photo_name = val['photo_name'];

                    $('#frm_upload_photo').find('#up_photo_' + i).attr('src', photo_url + '/' + photo_name);
                    $('#frm_upload_photo').find('#up_photo_slide_' + i).attr({ src: photo_url + '/' + photo_name, 'data-id': photo_id });

                    data_photo.push([
                        i,
                        "<div class='media'>" +
                        "<div class='card-aside-img'><img src='" + photo_url + '/' + photo_name + "' alt='img' class='h-60 w-60'></div>" +
                        "</div>",
                        val['photo_name'],
                        //"<div class='d-flex flex-row justify-content-center'>" +
                        //"<button onclick='$.carmodel_photo_delete_main(" + data + ")' data-item='" + data + "' style='margin: .25rem .125rem; ' class='btn btn-outline-danger btn-sm delete_item_photo' data-action='delete' id='delete_item" + i + "' type='button'>Delete</button>" +
                        //"</div>",

                        "<div class='d-flex flex-row justify-content-center p-2'>" +
                        "<span class=''>" +
                        "<a onclick='$.carmodel_photo_delete_main(" + data + ")' data-item='" + data + " class='delete_item_photo' data-action='delete' id='delete_item" + i + "' type='button'><i class='si si-trash text-danger mr-2' data-toggle='tooltip' title='' data-placement='top' data-original-title='Delete'></i></a>" +
                        "</span>"
                    ])

                    i++

                });

                tbl_up_photo = $('#tbl-up_photo').DataTable({
                    "data": data_photo,
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

                tbl_up_photo.columns.adjust();

            });

            //fetch(url_importdate_carmodelmix_get + '?mode=' + 'carmodelmix' + '&vehicle_model=' + photo_data.vehicle_model + '&minor_change=' + photo_data.minor_change + '&body_type=' + photo_data.body_type + '&hign_stant=' + photo_data.hign_stant + '&street_name=' + photo_data.street_name).then(function (response) {
            fetch(url_importdate_carmodelmix_get + '?mode=' + 'photo' + '&modelmix=' + modelmix_replace).then(function (response) {
                return response.json();
            }).then(function (result) {

                let i = 1;
                let model_photo = [];

                $.each(result.data, function (key, val) {

                    let data = JSON.stringify(val)

                    model_photo.push([
                        i,
                        val['model_id'],
                        val['modelmix'],
                        val['photo_no'],
                        "<div class='d-flex flex-row justify-content-center p-2'>" +
                        "<span class='ml-auto'>" +
                        //"<a onclick='$.carmodel_photo_main_mix_delete(" + data + ")' data-item='" + data + " class='delete_item_photo' data-action='delete' id='delete_item" + i + "' type='button'><i class='si si-trash text-danger mr-2' data-toggle='tooltip' title='' data-placement='top' data-original-title='Delete'></i></a>" +
                        "<a data-item='" + data + " class='delete_item_photo' data-action='delete' id='delete_item" + i + "' type='button'><i class='si si-trash text-danger mr-2' data-toggle='tooltip' title='' data-placement='top' data-original-title='Delete'></i></a>" +
                        "</span>" +
                        "</div>",
                    ])

                    i++

                });

                tbl_model_photo = $('#tbl-model_photo').DataTable({
                    "data": model_photo,
                    "bDestroy": true,
                    "scrollY": "200px",
                    "scrollCollapse": false,
                    "order": [[0, "desc"]],
                    "ordering": false,
                    responsive: true,

                    "paging": false
                    //  "scrollCollapse": true,

                });

                tbl_model_photo.columns.adjust();

            });

        };

        $.carmodel_photo_upload_main = function () {

            let p_carmodelmix = $('#p_carmodelmix').val();
            var modelmix_replace = p_carmodelmix.replaceAll(/[.*+?#^${}()|[\]\\/]/g, ' ')

            console.log('p_carmodelmix', p_carmodelmix)
            console.log('modelmix_replace', modelmix_replace)

            fetch(url_importdate_carmodelmix_get + '?mode=' + 'photo_main' + '&modelmix=' + modelmix_replace).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.length >= '4') {

                    swal({
                        title: "ขออภัย",
                        text: "คุณไม่สามารถอัพโหลดรูปภาพได้",
                        type: 'error',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    $('.dropify-clear').trigger('click');

                    toastr.error('จำนวนภาพครบแล้ว!');

                } else {

                    $('#btn-upload_pic').removeClass('d-none')

                    $('#frm_upload_photo').find('#btn-upload_pic').off('click').on('click', function (evt) {

                        evt.preventDefault();

                        $(this).on('click', function (evt) {
                            evt.preventDefault();
                        });

                        var file_data = new FormData();
                        var pic_file = $('#frm_upload_photo').find('#upload_photo_main').get(0).files

                        var modelmix_replace = p_carmodelmix.replaceAll(/[.*+?#^${}()|[\]\\/]/g, ' ')

                        if (pic_file.length > 0) {

                            file_data.append("postedFile", pic_file[0]);
                            file_data.append("pathname", p_carmodelmix);
                            //file_data.append("pathname", modelmix_replace);

                            $.ajax({
                                url: url_api + '/PictureUploads/UploadFile',
                                type: 'POST',
                                data: file_data,
                                contentType: false,
                                processData: false,
                                success: function (file_name) {

                                    var citem_photo = [];

                                    var pd_vehicle_model = photo_data.vehicle_model // == '' || photo_data.vehicle_model == null ? '_ALL_' : photo_data.vehicle_model
                                    var pd_minor_change = photo_data.minor_change // == '' || photo_data.minor_change == null ? '_ALL_' : photo_data.minor_change
                                    var pd_body_type = photo_data.body_type // == '' || photo_data.body_type == null ? '_ALL_' : photo_data.body_type
                                    var pd_hign_stant = photo_data.hign_stant // == '' || photo_data.hign_stant == null ? '_ALL_' : photo_data.hign_stant
                                    var pd_street_name = photo_data.street_name // == '' || photo_data.street_name == null ? '_ALL_' : photo_data.street_name

                                    console.log(pd_vehicle_model, pd_minor_change, pd_body_type, pd_hign_stant, pd_street_name)

                                    fetch(url_importdate_carmodelmix_get + '?mode=' + 'main_carmodelmix' + '&vehicle_model=' + pd_vehicle_model + '&minor_change=' + pd_minor_change + '&body_type=' + pd_body_type + '&hign_stant=' + pd_hign_stant + '&street_name=' + pd_street_name).then(function (response) {
                                        return response.json();
                                    }).then(function (result) {

                                        console.log(result.data)

                                        $.each(result.data, async function (key, val) {

                                            citem_photo.push({

                                                'temp_id': $.uuid(),
                                                'model_id': val['model_id'],
                                                'modelmix': val['modelmix'],
                                                'photo_folder': p_carmodelmix,
                                                'photo_url': p_carmodelmix + '/' + file_name,
                                                'photo_type': 'main',
                                                'photo_no': modelmix_replace,
                                                'vehicle_model': photo_data.vehicle_model,
                                                'minor_change': photo_data.minor_change,
                                                'body_type': photo_data.body_type,
                                                'hign_stant': photo_data.hign_stant,
                                                'street_name': photo_data.street_name,
                                                'photo_name': file_name,
                                                'created_by': user_id

                                            });

                                        });

                                        $.ajax({
                                            url: url_importdate_upload_photo,
                                            type: 'POST',
                                            contentType: "application/json; charset=utf-8",
                                            dataType: "json",
                                            data: JSON.stringify(citem_photo),
                                            success: function (data) {

                                                swal({
                                                    title: "สำเร็จ!",
                                                    text: "บันทึกสำเร็จ!",
                                                    type: 'success',
                                                    timer: 2000,
                                                    showConfirmButton: false
                                                });

                                                toastr.success('สำเร็จ บันทึกสำเร็จ!', async function () {

                                                    //tbl_carmodel_list.destroy();

                                                    $.carmodel_list();

                                                    $('#btn-upload_pic').addClass('d-none')

                                                    $('.dropify-clear').trigger('click');

                                                    $.carmodel_photo_details_main()

                                                    await setTimeout(function () {

                                                        $('.delete_item_photo').prop('disabled', false);

                                                    }, 300);

                                                }, 2000);

                                            }
                                        });



                                    })
                                }
                            });

                        }

                        return false

                    })


                }
            });

        };

        $.carmodel_photo_delete_main = async function (citem) {

            swal({
                title: "คุณแน่ใจหรือไม่",
                text: "คุณจะไม่สามารถเรียกข้อมูลนี้กลับมาได้",
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn btn-danger",
                confirmButtonText: "ใช่ ยืนยัน",
                closeOnConfirm: false
            },
                function () {

                    let add_data = {
                        'temp_id': $.uuid(),
                        'model_id': citem['model_id'],
                        'modelmix': citem['modelmix'],
                        'photo_folder': citem['photo_folder'],
                        'photo_url': citem['photo_url'],
                        'photo_type': 'main',
                        'photo_no': citem['photo_no'],
                        'vehicle_model': citem['vehicle_model'],
                        'minor_change': citem['minor_change'],
                        'body_type': citem['body_type'],
                        'hign_stant': citem['hign_stant'],
                        'street_name': citem['street_name'],
                        'photo_name': citem['photo_name'],
                        'created_by': user_id
                    };

                    var params = [];
                    for (const i in add_data) {
                        params.push(i + "=" + encodeURIComponent(add_data[i]));
                    }

                    fetch(url_importdate_photo_delete, {
                        method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
                        // mode: 'no-cors', // no-cors, *cors, same-origin
                        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        credentials: 'same-origin', // include, *same-origin, omit
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                        body: params.join("&"),
                    }).then(data => {
                        return data.json();
                    }).then(data => {

                        swal({
                            title: "สำเร็จ!",
                            text: "ทำรายการสำเร็จ",
                            type: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });

                        toastr.success('สำเร็จ บันทึกสำเร็จ!', async function () {

                            $.carmodel_photo_details_main()

                            await setTimeout(function () {

                                $('.delete_item_photo').prop('disabled', false);

                            }, 300);

                        }, 2000);

                    })

                });

        }

        $.carmodel_photo_details_sub = async function () {

            $('#photo_1 , #photo_2 , #photo_3 , #photo_4').attr('src', 'assets/img/photos/1.jpg');
            $('#photo_mix_1 , #photo_mix_2 , #photo_mix_3 , #photo_mix_4').attr('src', 'assets/img/photos/1.jpg');
            $('#photo_slide_1 , #photo_slide_2 , #photo_slide_3 , #photo_slide_4').attr('src', 'assets/img/photos/1.jpg');
            $('#photo_slide_mix_1 , #photo_slide_mix_2 , #photo_slide_mix_3 , #photo_slide_mix_4').attr('src', 'assets/img/photos/1.jpg');

            let model_id = $('#frm_data').find('#model_id').html();

            fetch(url_importdate_carmodelmix_get + '?mode=' + 'photo_modelmix' + '&modelmix=' + model_id).then(function (response) {
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

            fetch(url_importdate_carmodelmix_get + '?mode=' + 'photo_modelmix_sub' + '&modelmix=' + model_id).then(function (response) {
                return response.json();
            }).then(function (result) {

                let data_photo = [];

                if (result.length > 0) {

                    let photo_url = url_image + model_id;

                    let i = 1;

                    $.each(result.data, function (key, val) {

                        let data = JSON.stringify(val)
                        let photo_id = val['photo_id'];
                        let photo_name = val['photo_name'];

                        $('#photo_mix_' + i).attr('src', photo_url + '/' + photo_name);
                        $('#photo_slide_mix_' + i).attr({ src: photo_url + '/' + photo_name, 'data-id': photo_id });

                        data_photo.push([
                            i,
                            "<div class='media'>" +
                            "<div class='card-aside-img'><img src='" + photo_url + '/' + photo_name + "' alt='img' class='h-60 w-60'></div>" +
                            "</div>",
                            val['photo_name'],
                            "<div class='d-flex flex-row justify-content-center'>" +
                            "<button onclick='$.carmodel_photo_delete_sub(" + data + ")' data-item='" + data + "' style='margin: .25rem .125rem; ' class='btn btn-outline-danger btn-sm delete_item_photo' data-action='delete' id='delete_item" + i + "' type='button'>Delete</button>" +
                            "</div>",
                        ])

                        i++

                    });

                    tbl_sub_photo = $('#tbl-photo').DataTable({
                        "data": data_photo,
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

                    tbl_sub_photo.columns.adjust();

                    $('.delete_item_photo').prop('disabled', true);

                } else {

                    tbl_sub_photo = $('#tbl-photo').DataTable({
                        "data": data_photo,
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

                    tbl_sub_photo.columns.adjust();

                }

            });

        };

        $.carmodel_photo_upload_sub = function (citem) {

            let model_id = $('#frm_data').find('#model_id').html();

            fetch(url_importdate_carmodelmix_get + '?mode=' + 'photo_modelmix_sub' + '&modelmix=' + model_id).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.length >= '4') {

                    swal({
                        title: "ขออภัย",
                        text: "คุณไม่สามารถอัพโหลดรูปภาพได้",
                        type: 'error',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    $('.dropify-clear').trigger('click');

                    toastr.error('จำนวนภาพครบแล้ว!');

                } else {

                    $('#btn-save_pic').removeClass('d-none')

                    $('#frm_data').find('#btn-save_pic').off('click').on('click', function (evt) {

                        evt.preventDefault();

                        $(this).on('click', function (evt) {
                            evt.preventDefault();
                        });

                        var file_data = new FormData();
                        var pic_file = $('#frm_data').find('#upload_photo_sub').get(0).files
                        var citem_photo = [];

                        if (pic_file.length > 0) {

                            file_data.append("postedFile", pic_file[0]);
                            file_data.append("pathname", $('#frm_data').find('#model_id').html());

                            $.ajax({
                                url: url_api + '/PictureUploads/UploadFile',
                                type: 'POST',
                                data: file_data,
                                contentType: false,
                                processData: false,
                                success: function (file_name) {

                                    citem_photo.push({

                                        'temp_id': $.uuid(),
                                        'model_id': citem['model_id'],
                                        'modelmix': citem['modelmix'],
                                        'photo_folder': citem['model_id'],
                                        'photo_url': citem['model_id'] + '/' + file_name,
                                        'photo_type': 'sub',
                                        'photo_no': '',
                                        'vehicle_model': citem['vehicle_model'],
                                        'minor_change': citem['minor_change'],
                                        'body_type': citem['body_type'],
                                        'hign_stant': citem['hign_stant'],
                                        'street_name': citem['street_name'],
                                        'photo_name': file_name,
                                        'created_by': user_id

                                    });


                                    $.ajax({
                                        url: url_importdate_upload_photo,
                                        type: 'POST',
                                        contentType: "application/json; charset=utf-8",
                                        dataType: "json",
                                        data: JSON.stringify(citem_photo),
                                        success: function (data) {

                                            swal({
                                                title: "สำเร็จ!",
                                                text: "บันทึกสำเร็จ!",
                                                type: 'success',
                                                timer: 2000,
                                                showConfirmButton: false
                                            });

                                            toastr.success('สำเร็จ บันทึกสำเร็จ!', async function () {

                                                // tbl_carmodel_list.destroy();

                                                $.carmodel_list();

                                                $('#btn-save_pic').addClass('d-none')

                                                $('.dropify-clear').trigger('click');

                                                $.carmodel_photo_details_sub()

                                                await setTimeout(function () {

                                                    $('.delete_item_photo').prop('disabled', false);

                                                }, 300);

                                            }, 2000);

                                        }

                                    });

                                }
                            });
                        }

                        return false

                    })

                }

            });

        };

        $.carmodel_photo_main_mix_delete = async function (citem) {

            swal({
                title: "คุณแน่ใจหรือไม่",
                text: "คุณจะไม่สามารถเรียกข้อมูลนี้กลับมาได้",
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn btn-danger",
                confirmButtonText: "ใช่ ยืนยัน",
                closeOnConfirm: false
            },
                function () {

                    ////var file_data = new FormData();
                    //var file_data ;
                    //let model_id = $('#frm_data').find('#model_id').html();
                    //let photo_name = citem['photo_name'];

                    ////file_data.append("postedFile", model_id + '/' + photo_name);
                    //file_data = model_id + "\\" + photo_name
                    //console.log('file_data',file_data)
                    //$.ajax({
                    //    url: url_api + '/PictureUploads/DeleteFile',
                    //    type: 'POST',
                    //    data: file_data,
                    //    contentType: false,
                    //    processData: false,
                    //    success: function (file_name) {

                    //    }
                    //});

                    let add_data = {

                        'temp_id': $.uuid(),
                        'model_id': citem['model_id'],
                        'modelmix': citem['modelmix'],
                        'photo_folder': citem['photo_folder'],
                        'photo_url': citem['photo_url'],
                        'photo_type': 'main',
                        'photo_no': citem['photo_no'],
                        'vehicle_model': citem['vehicle_model'],
                        'minor_change': citem['minor_change'],
                        'body_type': citem['body_type'],
                        'hign_stant': citem['hign_stant'],
                        'street_name': citem['street_name'],
                        'photo_name': citem['photo_name'],
                        'created_by': user_id
                    };

                    var params = [];
                    for (const i in add_data) {
                        params.push(i + "=" + encodeURIComponent(add_data[i]));
                    }

                    fetch(url_importdate_photo_delete_modelmix, {
                        method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
                        // mode: 'no-cors', // no-cors, *cors, same-origin
                        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        credentials: 'same-origin', // include, *same-origin, omit
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                        body: params.join("&"),
                    }).then(data => {
                        return data.json();
                    }).then(data => {

                        swal({
                            title: "สำเร็จ!",
                            text: "ทำรายการสำเร็จ",
                            type: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });

                        toastr.success('สำเร็จ บันทึกสำเร็จ!', async function () {

                            $.carmodel_photo_details_main()
                            //$.carmodel_photo_details_sub()

                            await setTimeout(function () {

                                $('.delete_item_photo').prop('disabled', false);

                            }, 300);

                        }, 2000);

                    })

                });

        }

        $.carmodel_photo_delete_sub = async function (citem) {

            swal({
                title: "คุณแน่ใจหรือไม่",
                text: "คุณจะไม่สามารถเรียกข้อมูลนี้กลับมาได้",
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn btn-danger",
                confirmButtonText: "ใช่ ยืนยัน",
                closeOnConfirm: false
            },
                function () {

                    let add_data = {

                        'temp_id': $.uuid(),
                        'model_id': citem['model_id'],
                        'modelmix': citem['modelmix'],
                        'photo_folder': citem['photo_folder'],
                        'photo_url': citem['photo_url'],
                        'photo_type': 'sub',
                        'photo_no': citem['photo_no'],
                        'vehicle_model': citem['vehicle_model'],
                        'minor_change': citem['minor_change'],
                        'body_type': citem['body_type'],
                        'hign_stant': citem['hign_stant'],
                        'street_name': citem['street_name'],
                        'photo_name': citem['photo_name'],
                        'created_by': user_id
                    };

                    var params = [];
                    for (const i in add_data) {
                        params.push(i + "=" + encodeURIComponent(add_data[i]));
                    }

                    fetch(url_importdate_photo_delete_sub, {
                        method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
                        // mode: 'no-cors', // no-cors, *cors, same-origin
                        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        credentials: 'same-origin', // include, *same-origin, omit
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                        body: params.join("&"),
                    }).then(data => {
                        return data.json();
                    }).then(data => {

                        swal({
                            title: "สำเร็จ!",
                            text: "ทำรายการสำเร็จ",
                            type: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        });

                        toastr.success('สำเร็จ บันทึกสำเร็จ!', async function () {

                            $.carmodel_photo_details_sub()
                            //$.carmodel_photo_details_sub()

                            await setTimeout(function () {

                                $('.delete_item_photo').prop('disabled', false);

                            }, 300);

                        }, 2000);

                    })

                });

        }

        $.carmodel_import = async function () {

            $(document).on('change', '#customFile', function (evt) {

                evt.preventDefault();

                var path = $(this).val();
                var fileName = path.replace(/^.*\\/, "");
                $(this).next('.custom-file-label').html(fileName);

                if ($(this).val() !== '') {

                    $("#customFile").prop('disabled', true);

                    $(".modal-body").LoadingOverlay("show", {
                        image: '',
                        custom: customElement
                    });

                    let uuid = $.uuid();

                    let i = 0;

                    readXlsxFile(this.files[0], { dateFormat: 'YYYY/MM/DD_hh:mm:ss' }).then(async function (result) {

                        let count_length = result.length - 2;

                        if (result.length > 2) {

                            var citem_import = [];

                            fetch(url_importdate_carmodelmix_tmp + '?temp_id=' + uuid + '&countitem_all=' + count_length + '&created_by=' + user_id + '&mode=' + 'PENDING').then(function (response) {
                                return response.json();
                            }).then(function (result) {

                                if (result.status === 'Error') {

                                    toastr.error(status.error_message);

                                } else {

                                    //toastr.error('Q P BOY');

                                }

                            });

                            $.each(result, async function (key, val) {

                                if (i > 0) {

                                    citem_import.push({
                                        mode: 'IMPORT',
                                        temp_id: uuid,
                                        model_id: $.trim(val[0]),
                                        modelmixed: $.trim(val[1]),
                                        vehicle_brand: $.trim(val[2]),
                                        vehicle_model: $.trim(val[3]),
                                        cartype: $.trim(val[4]),
                                        model_change: $.trim(val[5]),
                                        minor_change: $.trim(val[6]),
                                        fuel_type: $.trim(val[7]),
                                        engine_displacement: val[8],
                                        engine_code: $.trim(val[9]),
                                        transmission_type: $.trim(val[10]),
                                        body_type: $.trim(val[11]),
                                        hign_stant: $.trim(val[12]),
                                        wheel_drive: $.trim(val[13]),
                                        street_name: $.trim(val[14]),
                                        model_code: $.trim(val[15]),
                                        remarks: $.trim(val[16]),
                                        action: $.trim(val[17]),
                                        created_by: user_id
                                    });

                                }

                                i++

                            });

                            await $.ajax({
                                url: url_importdate_carmodelmix_tmptran,
                                type: 'POST',
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                data: JSON.stringify(citem_import),
                                success: function (data) {

                                    if (data.status === 'Error') {

                                        $(".modal-body").LoadingOverlay("hide", true);

                                        toastr.error('Error, Please contact administrator.');

                                    } else {

                                        fetch(url_importdate_carmodelmix_verify + '?temp_id=' + uuid + '&updated_by=' + user_id).then(function (response) {
                                            return response.json();
                                        }).then(function (result) {

                                            if (result.status === 'Error') {

                                                toastr.error(status.error_message);

                                            } else {

                                                //toastr.error('Q P BOY');

                                                let data_import = [];

                                                let i = 1;
                                                let wrong_information = 0;
                                                let success_information = 0;

                                                $.each(result.data, function (key, val) {

                                                    let trans_id = val['trans_id'];
                                                    let temp_id = val['temp_id'];
                                                    let model_id = val['model_id'];
                                                    let modelmixed = val['modelmixed'];
                                                    let cartype = val['cartype'];
                                                    let vehicle_brand = val['vehicle_brand'];
                                                    let vehicle_model = val['vehicle_model'];
                                                    let minor_change = val['minor_change'];
                                                    let model_change = val['model_change'];
                                                    let fuel_type = val['fuel_type'];
                                                    let engine_displacement = val['engine_displacement'];
                                                    let engine_code = val['engine_code'];
                                                    let transmission_type = val['transmission_type'];
                                                    let body_type = val['body_type'];
                                                    let hign_stant = val['hign_stant'];
                                                    let wheel_drive = val['wheel_drive'];
                                                    let street_name = val['street_name'];
                                                    let model_code = val['model_code'];
                                                    let remarks = val['remarks'];
                                                    let action = val['action'];
                                                    let created_by = val['created_by'];
                                                    let created_datetime = val['created_datetime'];
                                                    let updated_by = val['updated_by'];
                                                    let updated_datetime = val['updated_datetime'];
                                                    let record_status = val['record_status'];
                                                    let text_status = val['text_status'];
                                                    let chk_duplicate = val['chk_duplicate'];
                                                    let car_models = val['car_models'];
                                                    let car_models_ref = val['car_models_ref'];

                                                    if (record_status == '1') {
                                                        success_information += 1;
                                                    } else {
                                                        wrong_information += 1;
                                                    }

                                                    if (text_status == 'ไม่พบข้อมูล modelmix') {
                                                        modelmixed = '<span style="color: red;font-weight: bold;text-align: center;">' + val['modelmixed'] + '</span>'

                                                    } else if (text_status == 'ไม่พบข้อมูล cartype') {
                                                        cartype = '<span style="color: red;font-weight: bold;text-align: center;">' + val['cartype'] + '</span>'

                                                    } else if (text_status == 'ไม่พบข้อมูล vehicle_brand') {
                                                        vehicle_brand = '<span style="color: red;font-weight: bold;text-align: center;">' + val['vehicle_brand'] + '</span>'

                                                    } else if (text_status == 'ไม่พบข้อมูล vehicle_model') {
                                                        vehicle_model = '<span style="color: red;font-weight: bold;text-align: center;">' + val['vehicle_model'] + '</span>'

                                                    } else if (text_status == 'ไม่พบข้อมูล fuel_type') {
                                                        fuel_type = '<span style="color: red;font-weight: bold;text-align: center;">' + val['fuel_type'] + '</span>'

                                                    } else if (text_status == 'ไม่พบข้อมูล transmission_type') {
                                                        transmission_type = '<span style="color: red;font-weight: bold;text-align: center;">' + val['transmission_type'] + '</span>'

                                                    } else if (text_status == 'ไม่พบข้อมูล wheel_drive') {
                                                        wheel_drive = '<span style="color: red;font-weight: bold;text-align: center;">' + val['wheel_drive'] + '</span>'

                                                    } else if (text_status == 'ไม่พบข้อมูลซ้ำในระบบ') {
                                                        modelmixed = '<span style="color: red;font-weight: bold;text-align: center;">' + val['modelmixed'] + '</span>'

                                                    } else if (text_status == 'พบข้อมูลซ้ำในระบบ' || text_status == 'พบข้อมูลซ้ำในเอกสาร') {
                                                        modelmixed = '<span style="color: red;font-weight: bold;text-align: center;">' + val['modelmixed'] + '</span>'
                                                        cartype = '<span style="color: red;font-weight: bold;text-align: center;">' + val['cartype'] + '</span>'
                                                        vehicle_brand = '<span style="color: red;font-weight: bold;text-align: center;">' + val['vehicle_brand'] + '</span>'
                                                        vehicle_model = '<span style="color: red;font-weight: bold;text-align: center;">' + val['vehicle_model'] + '</span>'
                                                        minor_change = '<span style="color: red;font-weight: bold;text-align: center;">' + val['minor_change'] + '</span>'
                                                        model_change = '<span style="color: red;font-weight: bold;text-align: center;">' + val['model_change'] + '</span>'
                                                        fuel_type = '<span style="color: red;font-weight: bold;text-align: center;">' + val['fuel_type'] + '</span>'
                                                        engine_displacement = '<span style="color: red;font-weight: bold;text-align: center;">' + val['engine_displacement'] + '</span>'
                                                        engine_code = '<span style="color: red;font-weight: bold;text-align: center;">' + val['engine_code'] + '</span>'
                                                        transmission_type = '<span style="color: red;font-weight: bold;text-align: center;">' + val['transmission_type'] + '</span>'
                                                        body_type = '<span style="color: red;font-weight: bold;text-align: center;">' + val['body_type'] + '</span>'
                                                        hign_stant = '<span style="color: red;font-weight: bold;text-align: center;">' + val['hign_stant'] + '</span>'
                                                        wheel_drive = '<span style="color: red;font-weight: bold;text-align: center;">' + val['wheel_drive'] + '</span>'
                                                        street_name = '<span style="color: red;font-weight: bold;text-align: center;">' + val['street_name'] + '</span>'
                                                        model_code = '<span style="color: red;font-weight: bold;text-align: center;">' + val['model_code'] + '</span>'
                                                        remarks = '<span style="color: red;font-weight: bold;text-align: center;">' + val['remarks'] + '</span>'

                                                    } else {
                                                        //alert('ERORR')
                                                    }

                                                    if (action == 'CREATE') {

                                                        action = '<span style="color: DarkGreen;font-weight: bold;text-align: center;">' + val['action'] + '</span>'
                                                        model_id = ''
                                                        if (text_status == 'ไม่พบข้อมูล modelmix') {
                                                            modelmixed = '<span style="color: red;font-weight: bold;text-align: center;">' + val['modelmixed'] + '</span>'
                                                            text_status = 'ไม่พบข้อมูล modelmix'
                                                        }

                                                    } else if (action == 'UPDATE') {

                                                        action = '<span style="color: DarkBlue;font-weight: bold;text-align: center;">' + val['action'] + '</span>'
                                                        model_id = '<span style="color: DarkBlue;font-weight: bold;text-align: center;">' + val['model_id'] + '</span>'

                                                    } else if (action == 'DELETE') {

                                                        action = '<span style="color: DarkRed;font-weight: bold;text-align: center;">' + val['action'] + '</span>'
                                                        model_id = '<span style="color: DarkRed;font-weight: bold;text-align: center;">' + val['model_id'] + '</span>'

                                                    } else {

                                                        action = '<span style="color: DarkOrange;font-weight: bold;text-align: center;">' + 'ERORR' + '</span>'

                                                    }

                                                    data_import.push([
                                                        i,
                                                        action,
                                                        record_status,
                                                        text_status,
                                                        car_models,
                                                        model_id,
                                                        modelmixed,
                                                        vehicle_brand,
                                                        vehicle_model,
                                                        cartype,
                                                        model_change,
                                                        minor_change,
                                                        fuel_type,
                                                        engine_displacement,
                                                        engine_code,
                                                        transmission_type,
                                                        body_type,
                                                        hign_stant,
                                                        wheel_drive,
                                                        street_name,
                                                        model_code,
                                                        remarks,
                                                        trans_id
                                                    ])

                                                    i++;

                                                });

                                                table_carnodel_import = $('#tbl-carmodel_import').DataTable({
                                                    "data": data_import,
                                                    "dom": 'Bfrtip',
                                                    "deferRender": true,
                                                    "order": [[0, "desc"]],
                                                    "ordering": false,
                                                    "pageLength": 5,
                                                    "bDestroy": true,
                                                    autoWidth: true,
                                                    buttons: [
                                                        'copyHtml5',
                                                        {
                                                            extend: 'excelHtml5',
                                                            title: '',
                                                            filename: 'Export_Temp_Varify_Carmodel',
                                                            exportOptions: {
                                                                columns: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
                                                            }
                                                        },
                                                    ],
                                                    "columnDefs": [{
                                                        "targets": 'no-sort',
                                                        "orderable": false,
                                                    },
                                                    {
                                                        "targets": [0],
                                                        "searchable": false,
                                                        "visible": false
                                                    },
                                                    {
                                                        "targets": [2],
                                                        "render": function (data, type, row, meta) {
                                                            return (data === '1' ? '<span class="badge badge-pill badge-success">OK</span>' : '<span class="badge badge-pill badge-danger">ERROR</span>');
                                                        }
                                                    },
                                                    {
                                                        "targets": [3],
                                                        "searchable": false,
                                                    },
                                                    {
                                                        "targets": [22],
                                                        "searchable": false,
                                                        "visible": false
                                                    }
                                                    ],
                                                    "initComplete": function (settings, json) {

                                                        $('.tbl-carmodel-import').removeClass('d-none');

                                                    }
                                                });

                                                $('#all_information').html(i - 1);
                                                $('#success_information').html(success_information).css("color", "darkgreen");
                                                $('#wrong_information').html(wrong_information).css("color", "red");

                                                table_carnodel_import.columns.adjust();

                                                $('#btn_update-data').show();

                                                $.carmodel_upload(uuid);

                                                $(".modal-body").LoadingOverlay("hide", true);
                                            }

                                        });

                                    }
                                }

                            });

                        }

                    });

                }

            });

        };

        $.carmodel_upload = function (uuid) {

            $("#btn_update-data").on('click', function (e) {

                e.preventDefault();

                swal({
                    title: "คุณแน่ใจหรือไม่",
                    text: "ที่จะทำการอัพเดตข้อมูลนี้",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonClass: "btn-danger",
                    confirmButtonText: "ใช่, ยันยืน",
                    cancelButtonText: "ไม่, ยกเลิก",
                    cancelButtonColor: '#d33',
                    closeOnConfirm: false,
                    closeOnCancel: false
                },
                    function (isConfirm) {

                        if (isConfirm) {

                            $(".modal-body").LoadingOverlay("show", {
                                image: '',
                                custom: customElement
                            });

                            fetch(url_importdate_carmodelmix_upload + '?temp_id=' + uuid + '&updated_by=' + user_id).then(function (response) {
                                return response.json();
                            }).then(function (result) {

                                if (result.status === 'Error') {

                                    $(".modal-body").LoadingOverlay("hide", true);

                                    toastr.error('Oops! An Error Occurred');

                                } else {

                                    $('#btn_update-data').prop('disabled', true);

                                    swal("สำเร็จ!", "บันทึกสำเร็จ!", "success");

                                    $(".modal-body").LoadingOverlay("hide", true);

                                    toastr.success('สำเร็จ บันทึกสำเร็จ!', async function () {

                                        await $('#btn_update-data').addClass('d-none')

                                        await $('.tbl-carmodel-import .col-sm-12').html('<button id="btn-finished" class="btn btn-outline-success btn-block" type="button">Finished</button>')

                                        await $('#btn-finished').on('click', function (evt) {

                                            evt.preventDefault();

                                            location.reload();

                                        });

                                    }, 300);

                                }

                            }).catch(error => {

                                $(".modal-body").LoadingOverlay("hide", true);

                                toastr.error('Error, Please contact administrator.');

                            });

                        } else {

                            swal("ยกเลิก", "ข้อมูลนี้ไม่ถูกทำรายการ", "error");

                        }

                    });

            });

            return false;

        };

        $.carmodel_list = async function () {

            $('#global_filter').focus();

            let val_vehicle_model = $('#frm_search').find('#search_vehicle_model').val() == '---select---' ? '' : $('#frm_search').find('#search_vehicle_model').val()

            let url = new URL(url_importdate_carmodelmix_get);

            url.search = new URLSearchParams({

                mode: 'carmodelmix',
                vehicle_brand: $('#frm_search').find('#search_vehicle_brand').val() != '' ? $('#frm_search').find('#search_vehicle_brand :selected').text() : '',
                vehicle_model: val_vehicle_model,

            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                tbl_carmodel_list = $('#tbl-carmodel_list').DataTable({
                    data: result.data,
                    dom: 'Brtip',
                    deferRender: true,
                    ordering: true,
                    pageLength: 10,
                    bDestroy: true,
                    buttons: [
                        'copyHtml5',
                        {
                            extend: 'excelHtml5',
                            title: '',
                            filename: 'CarModelMix_' + moment().format("YYYY/MM/DD hh:ss:mm"),
                            exportOptions: {
                                columns: [1, 3, 4, 5, 6, 7, 8, 9, 13, 10, 11, 12, 14, 15, 16, 17, 18, 19, 25, 26]
                            }
                        },
                    ],
                    columns: [
                        {
                            title: "<center>images</center>",
                            data: "images",
                            class: "tx-center wd-300",
                            //width: "300px",
                            //visible: false,
                            render: function (data, type, row, meta) {
                                //$('#carouselExample' + meta.row + '').lightGallery();

                                let str_img = '<div class="" style="width:100px !important ; height:80px !important;">';
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
                                        str_img += '<img alt="img" style="max-height:80px !important" class="d-block w-100" id="show_photo_' + i + '" src="' + photo_url + '/' + val['photo_name'] + '">'
                                        //str_img += '<img alt="img" class="d-block w-100" id="show_photo_' + i + '" src="' + photo_url + '/' + val['photo_name'] + '">'
                                        str_img += '</div >'

                                        i++
                                    })

                                } else {
                                    //style = "max-height:200px !important"
                                    str_img += '<div class="carousel-item active"><img alt="img" style="max-height:80px !important" class="d-block w-100" id="show_photo_1" src="../../assets/img/no_images.png"></div>'

                                }

                                str_img += '</div>';
                                str_img += '<a class="carousel-control-prev" href="#carouselExample' + meta.row + '" role="button" data-slide="prev"><i class="fa fa-angle-left fs-30" aria-hidden="true"></i></a >';
                                str_img += '<a class="carousel-control-next" href="#carouselExample' + meta.row + '" role="button" data-slide="next"><i class="fa fa-angle-right fs-30" aria-hidden="true"></i></a >';

                                str_img += '</div></div>';

                                return str_img

                            }
                        },//0
                        {
                            title: "<center>vehicle model</center>",
                            data: "car_models",
                            class: "tx-center",
                            //visible: false,
                            render: function (data, type, row, meta) {
                                return '<p style="font-size:11px;">' + data + '</p>';
                            }
                        },//1
                        {
                            title: "<center>car model ref</center>",
                            data: "car_models_ref",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//2
                        {
                            title: "<center>model id</center>",
                            data: "model_id",
                            class: "tx-center",
                            //visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//3
                        {
                            title: "<center>modelmix</center>",
                            data: "modelmix",
                            class: "tx-center",
                            //visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//4
                        {
                            title: "<center>vehicle brand</center>",
                            data: "vehicle_brand",
                            class: "tx-center",
                            //visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//5
                        {
                            title: "<center>vehicle name</center>",
                            data: "vehicle_model",
                            class: "tx-center",
                            //visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//6
                        {
                            title: "<center>cartype</center>",
                            data: "cartype",
                            class: "tx-center",
                            // visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//7
                        {
                            title: "<center>model change</center>",
                            data: "model_change",
                            class: "tx-center",
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//8
                        {
                            title: "<center>minor change</center>",
                            data: "minor_change",
                            class: "tx-center",
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//9
                        {
                            title: "<center data-toggle='tooltip' title='fuel type'>fuel type</center>",
                            data: "fuel_type",
                            class: "tx-center",
                            width: "40px",
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//10
                        {
                            title: "<center data-toggle='tooltip' title='engine displacement'>engine displacement</center>",
                            data: "engine_displacement",
                            class: "tx-center",
                            width: "40px",
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//11
                        {
                            title: "<center data-toggle='tooltip' title='transmission type'>transmission type</center>",
                            data: "transmission_type",
                            class: "tx-center",
                            width: "40px",
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//12
                        {
                            title: "<center data-toggle='tooltip' title='body type'>body type</center>",
                            data: "body_type",
                            class: "tx-center",
                            width: "40px",
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//13
                        {
                            title: "<center data-toggle='tooltip' title='hign stant'>hign stant</center>",
                            data: "hign_stant",
                            class: "tx-center",
                            width: "40px",
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//14
                        {
                            title: "<center data-toggle='tooltip' title='engine code'>engine code</center>",
                            data: "engine_code",
                            class: "tx-center",
                            width: "40px",
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//15
                        {
                            title: "<center data-toggle='tooltip' title='wheel drive'>wheel drive</center>",
                            data: "wheel_drive",
                            class: "tx-center",
                            width: "40px",
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//16
                        {
                            title: "<center data-toggle='tooltip' title='street name'>street name</center>",
                            data: "street_name",
                            class: "tx-center",
                            width: "40px",
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//17
                        {
                            title: "<center data-toggle='tooltip' title='model code'>model code</center>",
                            data: "model_code",
                            class: "tx-center",
                            width: "40px",
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//18
                        {
                            title: "<center>remarks</center>",
                            data: "remarks",
                            class: "tx-center",
                            //visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//19
                        {
                            title: "<center>record_status</center>",
                            data: "record_status",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//20
                        {
                            title: "<center>created_by</center>",
                            data: "created_by",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//21
                        {
                            title: "<center>created_datetime</center>",
                            data: "created_datetime",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + moment(data).format('DD/MM/YYYY') + '</span>';
                            }
                        },//22
                        {
                            title: "<center>updated_by</center>",
                            data: "updated_by",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//23
                        {
                            title: "<center>updated_datetime</center>",
                            data: "updated_datetime",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + moment(data).format('DD/MM/YYYY') + '</span>';
                            }
                        },//24
                        {
                            title: "<center>check_photo</center>",
                            data: "check_photo",
                            class: "tx-center",
                            visible: false,
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        },//25
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

                        $.contextMenu({
                            selector: '#tbl-carmodel_list tbody tr',
                            callback: async function (key, options) {

                                let citem = tbl_carmodel_list.row(this).data();

                                //if (key === 'gallery') {

                                //    await $.carmodel_gallery_main(citem);

                                //} else
                                if (key === 'view') {

                                    await $.carmodel_details(citem);

                                } else if (key === 'edit') {

                                    await $.carmodel_update(citem);

                                } else if (key === 'delete') {

                                    await $.carmodel_delete(citem);

                                } else {

                                    $LogEventCreate('create', result['status'], JSON.stringify(citem))
                                    alert('ERROR');

                                }

                            },
                            items: {
                                //"gallery": { name: "Gallery", icon: "fas fa-image", style: "color: #ee335e!important; " },
                                "view": { name: "View", icon: "fas fa-search" },
                                "edit": { name: "Edit", icon: "edit" },
                                "delete": { name: "Delete", icon: "delete" },

                            }
                        });

                        var api = this.api();
                        $('.filterhead', api.table().header()).each(function (i) {
                            var column = api.column(i);
                            var select = $('<select><option value=""></option></select>')
                                .appendTo($(this).empty())
                                .on('change', function () {
                                    var val = $.fn.dataTable.util.escapeRegex(
                                        $(this).val()
                                    );

                                    column
                                        .search(val ? '^' + val + '$' : '', true, false)
                                        .draw();
                                });

                            column.data().unique().sort().each(function (d, j) {
                                select.append('<option value="' + d + '">' + d + '</option>');
                            });
                        });
                    }

                });

                $('#tbl-carmodel_list tbody').off('click').on('click', 'td.details-control .show-detail', function (evt) {

                    evt.preventDefault();

                    var tr = $(this).closest('tr');
                    var row = tbl_carmodel_list.row(tr);

                    if (row.child.isShown()) {

                        row.child.hide();
                        tr.removeClass('shown');

                    }
                    else {
                        //format(row.child, $(this).attr('data-modelmix'));
                        $.carmodel_sub_list(row.child, $(this).attr('data-modelmix'), $(this).attr('data-minor_change'), $(this).attr('data-engine_displacement'));
                        $.carmodel_sub_list_v2(result.data);

                        tr.addClass('shown');
                    }
                });

                $(".card-body").LoadingOverlay("hide", true);
            });

        };

        $.carmodel_details = async function (citem) {

            await $('#modal-frm_data').modal({
                keyboard: false,
                backdrop: 'static'
            });

            console.log('citem', citem)

            //$('#frm_data').find('.dropify-wrapper').css({ "height": "359px" });

            $('#frm_data').find('#model_id').html(citem['model_id']).prop('disabled', true);
            $('#frm_data').find('#model_name').html(citem['modelmix']).prop('disabled', true);

            $('#frm_data').find('#modelmix').val(citem['modelmix']).prop('disabled', true);
            $('#frm_data').find('#vehicle_brand').val(citem['vehicle_brand']).trigger('change').prop('disabled', true);
            $('#frm_data').find('#vehicle_model').val(citem['vehicle_model']).trigger('change').prop('disabled', true);
            $('#frm_data').find('#cartype').val(citem['cartype']).trigger('change').prop('disabled', true);

            $('#frm_data').find('#detail_vehicle_brand').val(citem['vehicle_brand']).prop('disabled', true);
            $('#frm_data').find('#detail_vehicle_model').val(citem['vehicle_model']).prop('disabled', true);
            $('#frm_data').find('#detail_cartype').val(citem['cartype']).prop('disabled', true);

            $('#frm_data').find('#model_start').val(citem['model_start']).trigger('change').prop('disabled', true);
            $('#frm_data').find('#model_end').val(citem['model_end']).trigger('change').prop('disabled', true);

            $('#frm_data').find('#minor_start').val(citem['minor_start']).trigger('change').prop('disabled', true);
            $('#frm_data').find('#minor_end').val(citem['minor_end']).trigger('change').prop('disabled', true);

            $('#frm_data').find('#engine_displacement').val(citem['engine_displacement']).trigger('change').prop('disabled', true);
            $('#frm_data').find('#engine_code').val(citem['engine_code']).prop('disabled', true);
            $('#frm_data').find('#transmission_type').val(citem['transmission_type']).trigger('change').prop('disabled', true);
            $('#frm_data').find('#fuel_type').val(citem['fuel_type']).trigger('change').prop('disabled', true);

            $('#frm_data').find('#body_type').val(citem['body_type']).prop('disabled', true);
            $('#frm_data').find('#hign_stant').val(citem['hign_stant']).prop('disabled', true);
            $('#frm_data').find('#wheel_drive').val(citem['wheel_drive']).trigger('change').prop('disabled', true);
            $('#frm_data').find('#street_name').val(citem['street_name']).prop('disabled', true);
            $('#frm_data').find('#model_code').val(citem['model_code']).prop('disabled', true);

            $('#frm_data').find('#remarks').val(citem['remarks']).prop('disabled', true);
            $('#frm_data').find('.dropify').prop('disabled', true);
            $('#frm_data').find('.photo_1').prop('disabled', true);

            $('#frm_data').find('#btn-save_exit').hide();

            $('.delete_item_photo').prop('disabled', false);

            $.carmodel_photo_details_sub()

            $.carmodel_gallery_main(citem)
        };

        $.carmodel_update = async function (citem) {

            $('#upload_photo_sub').change(function (e) {

                e.preventDefault();

                if ($(this).val() != '') {

                    $.carmodel_photo_upload_sub(citem);

                } else {

                }

            });

            $.carmodel_details(citem)

            setTimeout(function () {
                $('.delete_item_photo').prop('disabled', false);
                $('#frm_data').find('#btn-save_exit').show();
                $('#frm_data').find('input').prop("disabled", true);
                $('#frm_data').find('select').prop("disabled", true);
                $('#frm_data').find('textarea').prop("disabled", false);
                $('#frm_data').find('.dropify').prop('disabled', false);
                $('#frm_data').find('.photo_1').prop('disabled', true);

                //$('#frm_data').find('#model_start , #model_end , #minor_start , #minor_end , #body_type , #hign_stant , #street_name ').prop('disabled', true);


            }, 500)

            $("#btn-save_exit").on('click', function (e) {

                e.preventDefault();

                $('#frm_data').parsley().validate();

                if ($('#frm_data').parsley().isValid()) {

                    swal({
                        title: "คุณแน่ใจหรือไม่",
                        text: "ที่จะทำการอัพเดตข้อมูลนี้",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonClass: "btn-danger",
                        confirmButtonText: "ใช่, ยันยืน",
                        cancelButtonText: "ไม่, ยกเลิก",
                        cancelButtonColor: '#d33',
                        closeOnConfirm: false,
                        closeOnCancel: false
                    }, function (isConfirm) {

                        if (isConfirm) {

                            const model_start = $('#frm_data').find('#model_start').val().replace('-', '');
                            const model_end = $('#frm_data').find('#model_end').val().replace('-', '');
                            const minor_start = $('#frm_data').find('#minor_start').val().replace('-', '');
                            const minor_end = $('#frm_data').find('#minor_end').val().replace('-', '');
                            const model_change = model_start + '-' + model_end
                            const minor_change = minor_start + '-' + minor_end

                            let val_fuel_type = $('#frm_data').find('#fuel_type').val();
                            let val_engine_displacement = $('#frm_data').find('#engine_displacement').val();
                            let val_engine_code = $('#frm_data').find('#engine_code').val();
                            let val_transmission_type = $('#frm_data').find('#transmission_type').val();
                            let val_body_type = $('#frm_data').find('#body_type').val();
                            let val_hign_stant = $('#frm_data').find('#hign_stant').val();
                            let val_wheel_drive = $('#frm_data').find('#wheel_drive').val();
                            let val_street_name = $('#frm_data').find('#street_name').val();
                            let val_model_code = $('#frm_data').find('#model_code').val();
                            let val_remarks = $('#frm_data').find('#remarks').val();

                            let url_action = new URL(url_importdate_carmodelmix_action);

                            url_action.search = new URLSearchParams({

                                mode: 'UPDATE',
                                temp_id: $.uuid(),
                                model_id: citem['model_id'],
                                modelmixed: citem['modelmix'],
                                cartype: citem['cartype'],
                                vehicle_brand: citem['vehicle_brand'],
                                vehicle_model: citem['vehicle_model'],
                                minor_change: minor_change,
                                model_change: model_change,
                                fuel_type: val_fuel_type == '' || val_fuel_type == null ? '' : val_fuel_type,
                                engine_displacement: val_engine_displacement == '' || val_engine_displacement == null ? '' : val_engine_displacement,
                                engine_code: val_engine_code == '' || val_engine_code == null ? '' : val_engine_code,
                                transmission_type: val_transmission_type == '' || val_transmission_type == null ? '' : val_transmission_type,
                                body_type: val_body_type == '' || val_body_type == null ? '' : val_body_type,
                                hign_stant: val_hign_stant == '' || val_hign_stant == null ? '' : val_hign_stant,
                                wheel_drive: val_wheel_drive == '' || val_wheel_drive == null ? '' : val_wheel_drive,
                                street_name: val_street_name == '' || val_street_name == null ? '' : val_street_name,
                                model_code: val_model_code == '' || val_model_code == null ? '' : val_model_code,
                                remarks: val_remarks == '' || val_remarks == null ? '' : val_remarks,
                                created_by: user_id,
                                action: 'UPDATE',

                            });

                            fetch(url_action).then(function (response) {
                                return response.json();
                            }).then(function (result) {

                                if (result.status === 'Error') {

                                    toastr.error('Oops! An Error Occurred');

                                } else {

                                    if ((result.data[0]['pMessage']) == 'DUPLICATE') {

                                        toastr.error('ข้อมูลซ้ำ ไม่สามารถทำรายการได้')

                                        swal("ขออภัย", "คุณไม่สามารถบันทึกรายการนี้ได้", "error");

                                    } else {

                                        swal({
                                            title: "สำเร็จ!",
                                            text: "ทำรายการสำเร็จ",
                                            type: 'success',
                                            timer: 2000,
                                            showConfirmButton: false
                                        });

                                        toastr.success('สำเร็จ บันทึกสำเร็จ!', async function () {

                                            $.carmodel_list();

                                            await setTimeout(function () {

                                                $('#modal-frm_data').modal('hide');

                                            }, 900);

                                        }, 2000);

                                    }
                                }

                            }).catch(error => {

                                toastr.error('Error, Please contact administrator.');

                            });

                        } else {

                            swal("ยกเลิก", "ข้อมูลนี้ไม่ถูกทำรายการ", "error");

                        }

                    });

                }
            });

        }

        $.carmodel_delete = async function (citem) {

            await $.carmodel_details(citem)

            $('#frm_data').find('#btn-save_exit').show();
            $("#btn-save_exit").removeClass('btn-primary')
            $("#btn-save_exit").text('Delete').addClass('btn-danger')
            $('#frm_data').find('.dropify').prop('disabled', true);
            $('#frm_data').find('.photo_1').prop('disabled', true);

            $("#btn-save_exit").on('click', function (e) {

                e.preventDefault();

                swal({
                    title: "คุณแน่ใจหรือไม่",
                    text: "คุณจะไม่สามารถเรียกข้อมูลนี้กลับมาได้",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonClass: "btn btn-danger",
                    confirmButtonText: "ใช่ ยืนยัน",
                    closeOnConfirm: false
                },
                    function () {

                        let url_action = new URL(url_importdate_carmodelmix_action);

                        url_action.search = new URLSearchParams({

                            mode: 'DELETE',
                            temp_id: $.uuid(),
                            model_id: citem['model_id'],
                            modelmixed: citem['modelmix'],
                            cartype: citem['cartype'],
                            vehicle_brand: citem['vehicle_brand'],
                            vehicle_model: citem['vehicle_model'],
                            minor_change: citem['minor_change'],
                            model_change: citem['model_change'],
                            fuel_type: citem['fuel_type'],
                            engine_displacement: citem['engine_displacement'],
                            engine_code: citem['engine_code'],
                            transmission_type: citem['transmission_type'],
                            body_type: citem['body_type'],
                            hign_stant: citem['hign_stant'],
                            wheel_drive: citem['wheel_drive'],
                            street_name: citem['street_name'],
                            model_code: citem['model_code'],
                            remarks: citem['remarks'],
                            created_by: user_id,
                            action: 'DELETE',

                        });

                        fetch(url_action).then(function (response) {
                            return response.json();
                        }).then(function (result) {

                            if (result.status === 'Error') {

                                toastr.error('Oops! An Error Occurred');

                            } else {

                                swal({
                                    title: "สำเร็จ!",
                                    text: "ทำรายการสำเร็จ",
                                    type: 'success',
                                    timer: 2000,
                                    showConfirmButton: false
                                });

                                toastr.success('สำเร็จ บันทึกสำเร็จ!', async function () {

                                    tbl_carmodel_list.destroy();

                                    $.carmodel_list();

                                    $('#modal-frm_data').modal('hide');

                                }, 2000);

                            }

                        }).catch(error => {

                            toastr.error('Error, Please contact administrator.');

                        });



                    });

            });

        }

        $.report = async function (citem) {

            await $('#modal-report').modal({
                keyboard: false,
                backdrop: 'static'
            });

            //await $.brand_get();

            $('#frm_report').find('#report_vehicle_brand').off('select2:select').on('select2:select', function (evt) {

                evt.preventDefault();

                $(this).on('select2:select', function (evt) {
                    evt.preventDefault();
                });

                $.model_get($(this).val());

            });

            $('#frm_report').find('#report_vehicle_model').off('select2:select').on('select2:select', function (evt) {

                evt.preventDefault();

                $(this).on('select2:select', function (evt) {
                    evt.preventDefault();
                });

                $.minor_get($(this).val());

            });

            $('#btn-save-report').off('click').on('click', function (evt) {

                evt.preventDefault();

                $(this).on('click', function (evt) {
                    evt.preventDefault();
                });

                let brand = $('#frm_search').find('#search_vehicle_brand').val() != '' ? $('#frm_search').find('#search_vehicle_brand :selected').text() : ''
                //let brand = $('#frm_report').find('#report_vehicle_brand :selected').text()
                let model = $('#frm_report').find('#report_vehicle_model').val()
                let minor = $('#frm_report').find('#report_vehicle_minor').val()
                let engine = $('#frm_report').find('#report_engine_displacement').val()

                $('#url_report').attr('src', "http://192.168.1.159/ReportServer/Pages/ReportViewer.aspx?%2fReport+Project1%2fRPT_PIA_CarmodelMix&rs:Command=Render&vehicle_brand=" + brand + "&vehicle_model=" + model + "&minor_change=" + minor + "&engine_code=" + engine + "")

                return false;
            });

        };

        $.brand_get = function () {

            fetch(url_carmodelmix_master_get + '?mode=' + 'vehicle_brand').then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    $("#search_vehicle_brand option").remove();
                    $("#search_vehicle_brand").append("<option value=''>---select---</option>").attr("value", '')

                    $("#report_vehicle_brand option").remove();
                    $("#report_vehicle_brand").append("<option value=''>---select---</option>").attr("value", '')

                    $("#photo_vehicle_brand option").remove();
                    $("#photo_vehicle_brand").append("<option value=''>---select---</option>").attr("value", '')

                    $.each(result.data, function (key, val) {

                        brand_dataSet.push({ id: val['code'], text: val['code'] });

                    });

                    $('#search_vehicle_brand').select2({
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

                    $('#report_vehicle_brand').select2({
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

                    $('#photo_vehicle_brand').select2({
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

                    $("#search_vehicle_model option").remove();
                    $("#search_vehicle_model").append("<option value=''>---select---</option>").attr("value", '')

                    $("#report_vehicle_model option").remove();
                    $("#report_vehicle_model").append("<option value=''>---select---</option>").attr("value", '')

                    let model_dataSet = [];

                    $.each(result.data, function (key, val) {

                        model_dataSet.push({ id: val['code'], text: val['code'] });

                    });

                    $('#search_vehicle_model').select2({
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

                    $('#report_vehicle_model').select2({
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

        $.minor_get = function (model) {

            let url = new URL(url_carmodelmix_master_get);

            url.search = new URLSearchParams({
                mode: 'glb_vehicle_minor',
                keywords: model
            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    $("#search_vehicle_minor option").remove();

                    $("#search_vehicle_minor").append("<option value=''>---select---</option>").attr("value", '')

                    $("#report_vehicle_minor option").remove();

                    $("#report_vehicle_minor").append("<option value=''>---select---</option>").attr("value", '')

                    let minor_dataSet = [];

                    $.each(result.data, function (key, val) {

                        minor_dataSet.push({ id: val['minor_code'], text: val['minor_name'] });

                    });

                    $('#search_vehicle_minor').select2({
                        width: '100%',
                        height: '40px',
                        data: minor_dataSet,
                        templateResult: function (data) {
                            return data.text;
                        },
                        sorter: function (data) {
                            return data.sort(function (a, b) {
                                return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                            });
                        }
                    });

                    $('#report_vehicle_minor').select2({
                        width: '100%',
                        height: '40px',
                        data: minor_dataSet,
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

        $.master_get = function () {

            let url_EngineDisplacement = new URL(url_carmodelmix_master_get);
            let url_EngineCode = new URL(url_carmodelmix_master_get);
            let url_StreetName = new URL(url_carmodelmix_master_get);
            let url_Gcode = new URL(url_carmodelmix_master_get);
            let url_Brand = new URL(url_carmodelmix_master_get);
            let url_Model = new URL(url_carmodelmix_master_get);
            let url_Minor = new URL(url_carmodelmix_master_get);
            let url_CarType = new URL(url_carmodelmix_master_get);
            let url_FuelType = new URL(url_carmodelmix_master_get);
            let url_WheelDrive = new URL(url_carmodelmix_master_get);
            let url_TransmissionType = new URL(url_carmodelmix_master_get);

            /*EngineDisplacement*/
            url_EngineDisplacement.search = new URLSearchParams({
                mode: 'EngineDisplacement'
            });
            fetch(url_EngineDisplacement).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    //$("#search_engine_displacement option").remove();
                    //$("#search_engine_displacement").append("<option>---select---</option>").attr("value", '')

                    $("#engine_displacement option").remove();
                    $("#engine_displacement").append("<option value=''>---select---</option>").attr("value", ' ')

                    let engine_displacement_dataSet = [];

                    $.each(result.data, function (key, val) {

                        engine_displacement_dataSet.push({ id: val['lov_code'], text: val['lov1'] });

                    });

                    //$('#search_engine_displacement').select2({
                    //    width: '100%',
                    //    height: '40px',
                    //    data: engine_displacement_dataSet,
                    //    templateResult: function (data) {
                    //        return data.text;
                    //    },
                    //    sorter: function (data) {
                    //        return data.sort(function (a, b) {
                    //            return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
                    //        });
                    //    }
                    //});

                    $('#engine_displacement').select2({
                        width: '100%',
                        height: '40px',
                        data: engine_displacement_dataSet,
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
            /*EngineDisplacement*/

            /*EngineCode*/
            //url_EngineCode.search = new URLSearchParams({
            //    mode: 'EngineCode',
            //});
            //fetch(url_EngineCode).then(function (response) {
            //    return response.json();
            //}).then(function (result) {

            //    if (result.status === 'Error') {

            //        toastr.error('Oops! An Error Occurred');

            //    } else {

            //        $("#search_engine_code option").remove();
            //        $("#search_engine_code").append("<option value=''>---select---</option>").attr("value", '')

            //        $("#engine_code option").remove();
            //        $("#engine_code").append("<option>---select---</option>").attr("value", '')

            //        let engine_code_dataSet = [];

            //        $.each(result.data, function (key, val) {

            //            engine_code_dataSet.push({ id: val['lov_code'], text: val['lov_code'] });

            //        });

            //        $('#search_engine_code').select2({
            //            width: '100%',
            //            height: '40px',
            //            data: engine_code_dataSet,
            //            templateResult: function (data) {
            //                return data.text;
            //            },
            //            sorter: function (data) {
            //                return data.sort(function (a, b) {
            //                    return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
            //                });
            //            }
            //        });

            //        $('#engine_code').select2({
            //            width: '100%',
            //            height: '40px',
            //            data: engine_code_dataSet,
            //            templateResult: function (data) {
            //                return data.text;
            //            },
            //            sorter: function (data) {
            //                return data.sort(function (a, b) {
            //                    return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
            //                });
            //            }
            //        });

            //    }

            //});
            /*EngineCode*/

            /*StreetName*/
            //url_StreetName.search = new URLSearchParams({
            //    mode: 'StreetName',
            //});
            //fetch(url_StreetName).then(function (response) {
            //    return response.json();
            //}).then(function (result) {

            //    if (result.status === 'Error') {

            //        toastr.error('Oops! An Error Occurred');

            //    } else {

            //        $("#search_street_name option").remove();
            //        $("#search_street_name").append("<option value=''>---select---</option>").attr("value", '')

            //        //$("#street_name option").remove();
            //        //$("#street_name").append("<option>---select---</option>").attr("value", '')

            //        let street_name_dataSet = [];

            //        $.each(result.data, function (key, val) {

            //            street_name_dataSet.push({ id: val['lov_code'], text: val['lov_code'] });

            //        });

            //        $('#search_street_name').select2({
            //            width: '100%',
            //            height: '40px',
            //            data: street_name_dataSet,
            //            templateResult: function (data) {
            //                return data.text;
            //            },
            //            sorter: function (data) {
            //                return data.sort(function (a, b) {
            //                    return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
            //                });
            //            }
            //        });

            //        //$('#street_name').select2({
            //        //    width: '100%',
            //        //    height: '40px',
            //        //    data: street_name_dataSet,
            //        //    templateResult: function (data) {
            //        //        return data.text;
            //        //    },
            //        //    sorter: function (data) {
            //        //        return data.sort(function (a, b) {
            //        //            return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
            //        //        });
            //        //    }
            //        //});

            //    }

            //});
            /*StreetName*/

            ///*Gcode*/
            //url_Gcode.search = new URLSearchParams({
            //    mode: 'gcode_a',
            //});
            //fetch(url_Gcode).then(function (response) {
            //    return response.json();
            //}).then(function (result) {

            //    if (result.status === 'Error') {

            //        toastr.error('Oops! An Error Occurred');

            //    } else {

            //        $("#gnamechr option").remove();

            //        $("#gnamechr").append("<option value=''>---select---</option>").attr("value", '')

            //        let gcode_dataSet = [];

            //        $.each(result.data, function (key, val) {

            //            gcode_dataSet.push({ id: val['codechr'], text: val['codechr'] });

            //        });

            //        $('#gnamechr').select2({
            //            width: '100%',
            //            height: '40px',
            //            data: gcode_dataSet,
            //            templateResult: function (data) {
            //                return data.text;
            //            },
            //            sorter: function (data) {
            //                return data.sort(function (a, b) {
            //                    return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
            //                });
            //            }
            //        });

            //    }

            //});
            ///*Gcode*/

            /*Brand*/
            //url_Brand.search = new URLSearchParams({
            //    mode: 'glb_vehicle_brand',
            //});
            //fetch(url_Brand).then(function (response) {
            //    return response.json();
            //}).then(function (result) {

            //    if (result.status === 'Error') {

            //        toastr.error('Oops! An Error Occurred');

            //    } else {

            //        $("#vehicle_brand option").remove();

            //        $("#vehicle_brand").append("<option value=''>---select---</option>").attr("value", '')

            //        let brand_dataSet = [];

            //        $.each(result.data, function (key, val) {

            //            brand_dataSet.push({ id: val['brand_name'], text: val['brand_name'] });

            //        });

            //        $('#vehicle_brand').select2({
            //            width: '100%',
            //            height: '40px',
            //            data: brand_dataSet,
            //            templateResult: function (data) {
            //                return data.text;
            //            },
            //            sorter: function (data) {
            //                return data.sort(function (a, b) {
            //                    return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
            //                });
            //            }
            //        });

            //    }

            //});
            /*Brand*/

            ///*Model*/
            //url_Model.search = new URLSearchParams({
            //    mode: 'glb_vehicle_model',
            //});
            //fetch(url_Model).then(function (response) {
            //    return response.json();
            //}).then(function (result) {

            //    if (result.status === 'Error') {

            //        toastr.error('Oops! An Error Occurred');

            //    } else {

            //        $("#vehicle_model option").remove();

            //        $("#vehicle_model").append("<option value=''>---select---</option>").attr("value", '')

            //        let model_dataSet = [];

            //        $.each(result.data, function (key, val) {

            //            model_dataSet.push({ id: val['model_code'], text: val['model_name'] });

            //        });

            //        $('#vehicle_model').select2({
            //            width: '100%',
            //            height: '40px',
            //            data: model_dataSet,
            //            templateResult: function (data) {
            //                return data.text;
            //            },
            //            sorter: function (data) {
            //                return data.sort(function (a, b) {
            //                    return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
            //                });
            //            }
            //        });

            //    }

            //});
            ///*Model*/

            ///*Minor*/
            //url_Minor.search = new URLSearchParams({
            //    mode: 'glb_vehicle_minor',
            //});
            //fetch(url_Minor).then(function (response) {
            //    return response.json();
            //}).then(function (result) {

            //    if (result.status === 'Error') {

            //        toastr.error('Oops! An Error Occurred');

            //    } else {

            //        //$("#minor_change option").remove();

            //        //$("#minor_change").append("<option>---select---</option>").attr("value", '')

            //        let model_dataSet = [];

            //        $.each(result.data, function (key, val) {

            //            model_dataSet.push({ id: val['minor_code'], text: val['minor_name'] });

            //        });

            //        //$('#minor_change').select2({
            //        //    width: '100%',
            //        //    height: '40px',
            //        //    data: model_dataSet,
            //        //    templateResult: function (data) {
            //        //        return data.text;
            //        //    },
            //        //    sorter: function (data) {
            //        //        return data.sort(function (a, b) {
            //        //            return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
            //        //        });
            //        //    }
            //        //});

            //    }

            //});
            ///*Model*/

            ///*CarType*/
            //url_CarType.search = new URLSearchParams({
            //    mode: 'CarType',
            //});
            //fetch(url_CarType).then(function (response) {
            //    return response.json();
            //}).then(function (result) {

            //    if (result.status === 'Error') {

            //        toastr.error('Oops! An Error Occurred');

            //    } else {

            //        $("#cartype option").remove();

            //        $("#cartype").append("<option value=''>---select---</option>").attr("value", '')

            //        let model_dataSet = [];

            //        $.each(result.data, function (key, val) {

            //            model_dataSet.push({ id: val['lov_code'], text: val['lov1'] });

            //        });

            //        $('#cartype').select2({
            //            width: '100%',
            //            height: '40px',
            //            data: model_dataSet,
            //            templateResult: function (data) {
            //                return data.text;
            //            },
            //            sorter: function (data) {
            //                return data.sort(function (a, b) {
            //                    return a.text < b.text ? -1 : a.text > b.text ? 1 : 0;
            //                });
            //            }
            //        });

            //    }

            //});
            ///*CarType*/

            ///*FuelType*/
            url_FuelType.search = new URLSearchParams({
                mode: 'FuelType',
            });
            fetch(url_FuelType).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    //$("#fuel_type option").remove();

                    //$("#fuel_type").append("<option>---select---</option>").attr("value", '')

                    let fuel_dataSet = [];

                    $.each(result.data, function (key, val) {

                        fuel_dataSet.push({ id: val['lov_code'], text: val['lov_code'] });

                    });

                    $('#fuel_type').select2({
                        width: '100%',
                        height: '40px',
                        data: fuel_dataSet,
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
            ///*FuelType*/

            ///*WheelDrive*/
            url_WheelDrive.search = new URLSearchParams({
                mode: 'WheelDrive',
            });
            fetch(url_WheelDrive).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    $("#wheel_drive option").remove();

                    $("#wheel_drive").append("<option value=''>---select---</option>").attr("value", '')

                    let model_dataSet = [];

                    $.each(result.data, function (key, val) {

                        model_dataSet.push({ id: val['lov_code'], text: val['lov1'] });

                    });

                    $('#wheel_drive').select2({
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
            ///*WheelDrive*/

            ///*TransmissionType*/
            url_TransmissionType.search = new URLSearchParams({
                mode: 'TransmissionType',
            });
            fetch(url_TransmissionType).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    $("#transmission_type option").remove();

                    $("#transmission_type").append("<option value=''>---select---</option>").attr("value", '')

                    let model_dataSet = [];

                    $.each(result.data, function (key, val) {

                        model_dataSet.push({ id: val['lov_code'], text: val['lov1'] });

                    });

                    $('#transmission_type').select2({
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
            ///*TransmissionType*/

        };

        $.carmodelmix_select2 = function (search_vehicle_brand) {

            let url_CarmodelMix = new URL(url_carmodelmix_master_get);

            url_CarmodelMix.search = new URLSearchParams({
                mode: 'CarModelMix',
                keywords: search_vehicle_brand,
            });
            fetch(url_CarmodelMix).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    $("#p_carmodelmix option").remove();

                    $("#p_carmodelmix").append("<option value=''>---select---</option>").attr("value", '')

                    photo_dataSet = [''];

                    $.each(result.data, function (key, val) {

                        let ref_photo_main = val['ref_photo_main'];
                        let val_ref_photo_main = ref_photo_main.replaceAll(/[.*+?^#${}()|[\]\\/]/g, ' ')
                        let val_car_models = val['car_models'];

                        photo_dataSet.push({
                            id: ref_photo_main,
                            text: val_car_models,
                            vehicle_model: val['vehicle_model'],
                            minor_change: val['minor_change'],
                            body_type: val['body_type'],
                            hign_stant: val['hign_stant'],
                            street_name: val['street_name']
                        });

                        $('#p_carmodelmix').attr("data-vehicle_model", val['vehicle_model']);
                        $('#p_carmodelmix').attr("data-minor_change", val['minor_change']);
                        $('#p_carmodelmix').attr("data-body_type", val['body_type']);
                        $('#p_carmodelmix').attr("data-hign_stant", val['hign_stant']);
                        $('#p_carmodelmix').attr("data-street_name", val['street_name']);
                    });

                    // console.log('model_dataSet', photo_dataSet)

                    $('#p_carmodelmix').select2({
                        width: '100%',
                        height: '40px',
                        data: photo_dataSet,
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

        $(document).ready(async function () {

            await $.init();
            //await $.carmodel_list();

        });

    } else {

        window.location.assign('./login');

    }

});