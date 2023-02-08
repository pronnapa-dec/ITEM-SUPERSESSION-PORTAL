'use strict';

const objProfile = JSON.parse(localStorage.getItem('objAuth'));
const user_id = objProfile[0]['username'];
const url_api = "http://localhost:49705";
//const url_api = "http://192.168.1.247:8089/cs-spi/";

let url_image = 'http://localhost/image_slip/'
//let url_image = 'http://192.168.1.247:8899/image_slip/'
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const url_slip_detail = url_api + '/v1/Slip_Detail';
const url_slip_create = url_api + '/v1/Slip_Create';
const url_slip_upload = url_api + '/v1/Slip_Upload';
const url_slip_update = url_api + '/v1/Slip_Update';
const url_slip_bill_create = url_api + '/v1/Slip_Bill_Create';
const url_slip_bill_list = url_api + '/v1/Slip_Bill_List';
const url_slip_bill_delete = url_api + '/v1/Slip_Bill_Delete';

let oTable = $('#tbl-list').DataTable();
let table_bill;
/*let add_data = {};*/
/*let add_img = {};*/

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

            await setTimeout(function () {
                $.LoadingOverlay("hide");
                $('#btn-save_exit').hide()
            }, 1000);

            console.log(urlParams.get('refno'))

            $('#modal-frm_data').off('hidden.bs.modal').on('hidden.bs.modal', async function () {

                await setTimeout(function () {

                    $('#detectImageForm').find('input').val('')
                    $('.dropify-clear').trigger('click');

                }, 100);

            });

            if (urlParams.get('jobno') === null) {

                $('#btn-item_create').removeClass('d-none');

            } else {

                $('#btn-add').removeClass('d-none');
                $.Slip_Detail(urlParams.get('jobno'));
                $.Slip_Bill_List(urlParams.get('jobno'));

                $('#bankslip_emmas').select2({
                    minimumInputLength: 1,
                    minimumResultsForSearch: 10,
                    dropdownAutoWidth: true,
                    delay: 500,
                    ajax: {
                        url: 'http://192.168.1.247/vsk-api-acc/api/ACC/VSK_Emmas_Select2_GET',
                        dataType: 'json',
                        width: 'resolve',
                        data: function (params) {
                            var query = {
                                search: typeof params.term !== 'undefined' ? params.term : ' ',
                            }
                            //console.log(params);
                            return query;
                        },
                        matcher: function (params, data) {
                            return matchStart(params, data);
                        },
                        processResults: function (data, search) {
                            console.log(data);
                            return {
                                results: $.map(data.data, function (item) {
                                    return {
                                        text: item.text,
                                        id: item.id
                                    }
                                })
                            };
                        },
                    },
                    escapeMarkup: function (markup) {
                        return markup;
                    },
                })
            }

            $('.dropify-clear').on('click', async function () {

                $("#detectImageForm").parsley().reset();
                $('#ref_datetime').val('');
                $('#ref_code').val('');
                $('#ref_start').val('');
                $('#ref_target').val('');
                $('#ref_total').val('');
            });

            $('#btn-save_exit').off('click').on('click', async function (e) {

                e.preventDefault();

                await $('#detectImageForm').parsley().validate();

                await $.Slip_Create();
            });

            $('#bankslip_billno').keyup(function () {
                this.value = this.value.toUpperCase();
            });

            $('#frm_search').find('#btn-add').on('click', function (e) {
                e.preventDefault();
                $('#frm_search').parsley().validate();
                if ($('#frm_search').parsley().isValid()) {
                    let bankslip_billno = $('#bankslip_billno').val();
                    if (bankslip_billno.substring(0, 2) != 'IV') {
                        toastr.error('กรุณาป้อนเลขที่บิลให้ถูกต้อง');
                        $('#bankslip_billno').addClass('parsley-error');
                    } else {
                        if (bankslip_billno.length != 12) {
                            toastr.error('กรุณาป้อนเลขที่บิลให้ครบ');
                            $('#bankslip_billno').addClass('parsley-error');
                        } else {
                            $.Slip_Bill_Create();
                        }
                    }
                }
            });

            $('#frm_search input').bind('keypress', function (e) {
                var code = e.keyCode || e.which;
                if (code == 13) {
                    $('#frm_search').parsley().validate();
                    if ($('#frm_search').parsley().isValid()) {
                        let bankslip_billno = $('#bankslip_billno').val();
                        if (bankslip_billno.substring(0, 2) != 'IV') {
                            toastr.error('กรุณาป้อนเลขที่บิลให้ถูกต้อง');
                            $('#bankslip_billno').addClass('parsley-error');
                        } else {
                            if (bankslip_billno.length != 12) {
                                toastr.error('กรุณาป้อนเลขที่บิลให้ครบ');
                                $('#bankslip_billno').addClass('parsley-error');
                            } else {
                                $.Slip_Bill_Create();
                            }
                        }
                    }
                } else if (code == 27) {
                    window.history.pushState({}, document.title, "/" + "csh/opt/bankslip");
                    location.reload();
                }
            });

            $('#frm_search').find('#btn-main').on('click', function (e) {

                e.preventDefault();

                window.history.pushState({}, document.title, "/" + "csh/opt/bankslip");

                location.reload();
            });

            $('#frm_search').find('#bankslip_emmas').off('select2:select').on('select2:select', function (evt) {

                evt.preventDefault();

                $(this).on('select2:select', function (evt) {
                    evt.preventDefault();
                });

                if ($('#bankslip_jobno').val() != '') {

                    $.Slip_Update();

                } else {

                    toastr.error('ไม่พบข้อมูลใบงาน');

                }


            });

            $(".img-gallery").lightGallery({ rel: true });

        };

        $.clear_input = async function () {

            $('#frm_search').trigger('reset');
            $('#frm_search').find('input').val('');
            $("#frm_search").parsley().reset();
            $("#bankslip_emmas option").remove();
            $('#bankslip_emmas')
                .append($("<option value=''>--- Select ---</option>")).prop('disabled', false);

        };

        $.Slip_Create = async function () {

            let add_data = {
                slip_refno: $('#ref_code').val(),
                slip_datetime: $('#ref_datetime').val(),
                slip_total: $('#ref_total').val(),
                slip_bank: $('#ref_target').val(),
                slip_cusname: $('#ref_start').val(),
                created_by: user_id
            };

            var params = [];
            for (const i in add_data) {
                params.push(i + "=" + encodeURIComponent(add_data[i]));
            }

            console.log('params', params.join("&"))

            fetch(url_slip_create, {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                // mode: 'no-cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: params.join("&"),
            }).then(response => {
                return response.json();
            }).then(function (result) {

                $.each(result.data, function (key, val) {

                    if (val['pMessage'] != null) {

                        toastr.error(val['pMessage']);


                    } else {

                        let ref_id = '', job_no = '';

                        ref_id = val['slip_refno']
                        job_no = val['slip_jobno']

                        var file_data = new FormData();
                        var pic_file = $('#detectImageForm').find('#imageFile').get(0).files
                        file_data.append("postedFile", pic_file[0]);
                        file_data.append("pathname", val['slip_jobno']);

                        $.ajax({
                            url: url_api + '/PictureUploads/UploadFile',
                            type: 'POST',
                            data: file_data,
                            contentType: false,
                            processData: false,
                            success: function (file_name) {

                                console.log('file_name', file_name)

                                let add_img = {
                                    ref_id: ref_id,
                                    job_no: job_no,
                                    image_name: file_name,
                                    created_by: user_id
                                };

                                var params_img = [];
                                for (const i in add_img) {
                                    params_img.push(i + "=" + encodeURIComponent(add_img[i]));
                                }

                                console.log('params_img', params_img.join("&"))

                                fetch(url_slip_upload, {
                                    method: 'POST', // *GET, POST, PUT, DELETE, etc.
                                    // mode: 'no-cors', // no-cors, *cors, same-origin
                                    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                                    credentials: 'same-origin', // include, *same-origin, omit
                                    headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                                    body: params_img.join("&"),
                                }).then(response => {
                                    return response.json();
                                }).then(function (result) {

                                    toastr.success('Save Successfully!', async function () {

                                        window.location.assign(window.location.href + '?jobno=' + val['slip_jobno'])

                                    });

                                });

                            }
                        });

                    }

                });


            });

            return false;

        };

        $.Slip_Detail = async function (refno) {

            console.log('Detail refno', refno)

            fetch(url_slip_detail + '?slip_jobno=' + refno).then(function (response) {
                return response.json();
            }).then(function (result) {

                console.log('result', result.data)

                if (result.length > 0) {

                    $.each(result.data, function (key, val) {

                        var slip_jobdate = val['slip_jobdate'];
                        var slip_datetime = val['slip_datetime'];

                        $('#bankslip_date').val(slip_jobdate);
                        $('#bankslip_jobno').val(val['slip_jobno']);
                        $('#bankslip_ref').val(val['slip_refno']);
                        $('#bankslip_number').val(val['slip_bank']);
                        $('#bankslip_payindate').val(slip_datetime);
                        $('#bankslip_total').val(val['slip_total']);

                        $('#bankslip_gallery').attr('data-src', url_image + val['image_no'] + '/' + val['image_name']);
                        $('#bankslip_image').attr('src', url_image + val['image_no'] + '/' + val['image_name']);

                        $("#bankslip_emmas option").remove();

                        fetch('http://192.168.1.247/vsk-api-acc/api/ACC/VSK_Emmas_Select2_GET?search=' + val['slip_cuscode']).then(function (response) {
                            return response.json();
                        }).then(function (result) {
                            console.log('emmas', result.data)
                            if (result.length > 0) {

                                $('#bankslip_emmas')
                                    .append($("<option>--- Select ---</option>")
                                        .attr("value", result.data[0]['id'])
                                        .text(result.data[0]['text'])
                                        .attr('name', result.data[0]['text']));

                            }

                        });

                    });

                } else {

                    swal({
                        title: "ขออภัย",
                        text: "เกิดข้อผิดพลาด",
                        type: 'error',
                        timer: 2000,
                        showConfirmButton: false
                    });

                    toastr.error('ไม่พบข้อมูลใบงาน');
                }

            });

        };

        $.Slip_Update = async function () {

            let slip_cuscode = $('#frm_search').find('#bankslip_emmas').val();

            swal({
                title: "คุณแน่ใจหรือไม่?",
                text: "ที่จะทำการอัพเดตข้อมูลลูกค้า",
                type: "warning",
                showCancelButton: true,
                confirmButtonClass: "btn btn-danger",
                confirmButtonText: "Yes, save it!",
                closeOnConfirm: false
            },
                function () {

                    let add_data = {
                        slip_jobno: urlParams.get('jobno'),
                        slip_cuscode: slip_cuscode,
                        updated_by: user_id
                    };

                    var params_img = [];
                    for (const i in add_data) {
                        params_img.push(i + "=" + encodeURIComponent(add_data[i]));
                    }

                    console.log('params_img', params_img.join("&"))

                    fetch(url_slip_update, {
                        method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        credentials: 'same-origin', // include, *same-origin, omit
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                        body: params_img.join("&"),
                    }).then(response => {
                        return response.json();
                    }).then(function (result) {

                        toastr.success('Save Successfully!', async function () {

                            swal("สำเร็จ!", "บันทึกสำเร็จ", "success");

                        });



                    });


                });

            return false;

        };

        $.Slip_Bill_List = async function (data) {

            //alert('Slip_Bill_Detail')

            console.log('Slip_Bill_Detail data', data)

            let data_jobno = $('#bankslip_jobno').val()

            fetch(url_slip_bill_list + '?ref_id=' + data).then(function (response) {
                return response.json();
            }).then(function (result) {

                console.log('result', result.data)

                if (result.length > 0) {

                    let i = result.length;

                    var data_slip_bill = [];

                    $.each(result.data, function (key, val) {

                        let data = JSON.stringify(val)

                        data_slip_bill.push([
                            i,
                            val['created_datetime'],
                            val['bill_no'],
                            val['created_by'],
                            "<div class='d-flex flex-row justify-content-center'>" +
                            //"<button onclick='$.Slip_Bill_Update(" + data + ");' data-item='" + data + "' style='margin: .25rem .125rem; ' class='btn btn-outline-primary btn-sm edit-item update_item' data-action='update'  id='update_item" + i + "' type='button'>Edit</button>" +
                            "<button onclick='$.Slip_Bill_Delete(" + data + ");' data-item='" + data + "' style='margin: .25rem .125rem; ' class='btn btn-outline-danger btn-sm delete-item delete_item' data-action='delete' id='delete_item" + i + "' type='button'>Delete</button>" +
                            "</div>",
                            val['trans_id'],
                            val['ref_id'],
                            val['record_status'],

                        ])

                        i--;

                    });

                    console.log('data_slip_bill', data_slip_bill)

                    table_bill = $('#tbl-bill').DataTable({
                        "data": data_slip_bill,
                        "dom": 'ifrtp',
                        //autoWidth : true,
                        "bDestroy": true,
                        "deferRender": true,
                        "order": [[0, "desc"]],
                        "ordering": false,
                        "pageLength": 5,
                        "columnDefs": [{
                            "targets": 'no-sort',
                            "orderable": false,
                        },
                        {
                            "targets": [0],
                            "searchable": false,
                            "class": "tx-center",
                        },
                        {
                            "targets": [1],
                            "searchable": false,
                            "class": "tx-center",
                            "render": function (data, type, row, meta) {
                                return (data != '0001-01-01T00:00:00' ? moment(data).format('DD/MM/YYYY HH:mm:ss') : '-');
                            }
                        },
                        {
                            "targets": [2],
                            "searchable": false,
                            "class": "tx-center",
                        },
                        {
                            "targets": [3],
                            "searchable": false,
                            "class": "tx-center",
                        },
                        /*
                        {
                            "targets": [4],
                            "searchable": false,
                            "visible": false

                        },
                        */
                        {
                            "targets": [5],
                            "searchable": false,
                            "visible": false

                        },
                        {
                            "targets": [6],
                            "searchable": false,
                            "visible": false

                        },
                        {
                            "targets": [7],
                            "searchable": false,
                            "visible": false

                        }],
                        "initComplete": function (settings, json) {

                        }
                    });

                    table_bill.columns.adjust();

                    //$.LoadingOverlay("hide");

                }

            });

        };

        $.Slip_Bill_Create = async function () {

            let add_data = {
                ref_id: $('#bankslip_jobno').val(),
                bill_no: $('#bankslip_billno').val(),
                created_by: user_id
            };

            var params = [];
            for (const i in add_data) {
                params.push(i + "=" + encodeURIComponent(add_data[i]));
            }

            console.log('params', params.join("&"))

            fetch(url_slip_bill_create, {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                // mode: 'no-cors', // no-cors, *cors, same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                credentials: 'same-origin', // include, *same-origin, omit
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                body: params.join("&"),
            }).then(response => {
                return response.json();
            }).then(function (result) {
                console.log(result.data)

                $.each(result.data, function (key, val) {

                    console.log(val['pMessage'])

                    if (val['pMessage'] != null) {

                        toastr.error(val['pMessage']);
                        $('#bankslip_billno').addClass('parsley-error');

                    } else {

                        toastr.success('Save Successfully!', async function () {

                            //table_bill.destroy();
                            $.clear_input();

                            $.Slip_Detail(val['ref_id']);
                            $.Slip_Bill_List(val['ref_id']);

                        });

                    }

                });

            });

            return false;
        };

        $.Slip_Bill_Delete = async function (citem) {

            console.log('citem', citem)

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

                    let data_update = {
                        trans_id: citem['trans_id'],
                        ref_id: citem['ref_id'],
                        updated_by: user_id,
                    };

                    var params = [];
                    for (const i in data_update) {
                        params.push(i + "=" + encodeURIComponent(data_update[i]));
                    }

                    fetch(url_slip_bill_delete, {
                        method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
                        // mode: 'no-cors', // no-cors, *cors, same-origin
                        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        credentials: 'same-origin', // include, *same-origin, omit
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                        body: params.join("&"),
                    }).then(data => {
                        return data.json();
                    }).then(result => {
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
                                //table_bill.destroy();
                                await location.reload();
                                //$.Slip_Bill_List(urlParams.get('jobno'));

                            }, 1000);

                        }

                    }).catch(error => {

                        toastr.error('Error, Please contact administrator.');

                    });

                } else {

                    swal("ยกเลิก", "ข้อมูลนี้ไม่ถูกทำรายการ", "error");

                }

            });

        };

        $(document).ready(async function () {

            await $.init();

            const detectImageForm = document.querySelector("#detectImageForm");
            const imageFile = detectImageForm.querySelector("#imageFile");
            const imagePreview = document.querySelector("#imagePreview");
            const result = document.querySelector("#result");

            const setImagePreview = async () => {
                const imageBase64String = await getImageBase64String();
                imagePreview.setAttribute("src", imageBase64String);
            };

            const detectImage = async () => {

                const imageBase64String = await getImageBase64String();
                const data = {
                    requests: [
                        {
                            image: {
                                content: imageBase64String.replace(/^data:.+;base64,/, "")
                            },
                            features: [{ type: "TEXT_DETECTION" }]
                        }
                    ]
                };
                const url = "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyAqmuxjOzJ9Prw5PJ2zwDJilq7ILN5quq4";
                const response = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });
                const jsonResponse = await response.json();
                for (const value of jsonResponse.responses) {

                    $(".modal-body").LoadingOverlay("hide", true);
                    $('#btn-save_exit').show()
                    console.log(value);

                    result.textContent = value.fullTextAnnotation.text;

                    //let arr_value = value.fullTextAnnotation.text.split("ตรวจสอบสลิปสำเร็จ")

                    //result.textContent = arr_value[1]

                    let txtVerified = result.textContent.split(/\r\n|\n|\r/);
                    console.log(txtVerified);

                    let txtBankname = ''

                    if (txtVerified[15] === 'Verified by K+' && txtVerified[4] === "ธ.กสิกรไทย") {

                        $('#ref_datetime').val(txtVerified[2]);
                        $('#ref_code').val(txtVerified[10]);
                        $('#ref_start').val(txtVerified[3] + ' (' + txtVerified[4] + ' ' + txtVerified[5] + ')')
                        $('#ref_target').val(txtVerified[6] + ' (' + txtVerified[7] + ' ' + txtVerified[8] + ')')
                        $('#ref_total').val(txtVerified[12]);

                    } else if (txtVerified[0] === 'โอนเงินผ่าน K PLUS SME') {

                        txtBankname = 'ธนาคารกสิกรไทย SME';
                        if (txtVerified.length == 16) {
                            $('#ref_datetime').val(txtVerified[14].substring(0, 16));
                            $('#ref_code').val(txtVerified[14].substring(16));
                            $('#ref_start').val(txtVerified[6] + ' (ธ.กสิกรไทย' + ' ' + txtVerified[4] + ')')
                            $('#ref_target').val(txtVerified[7] + ' (' + txtVerified[5] + ')')
                            $('#ref_total').val(txtVerified[9].replace(' ', '').replace('จำนวนเงิน', ''));
                        } else {
                            $('#ref_datetime').val(txtVerified[12]);
                            $('#ref_code').val(txtVerified[13]);
                            $('#ref_start').val(txtVerified[6] + ' (ธ.กสิกรไทย' + ' ' + txtVerified[4] + ')')
                            $('#ref_target').val(txtVerified[7] + ' (' + txtVerified[5] + ')')
                            $('#ref_total').val(txtVerified[8]);

                        }
                    } else if (txtVerified[0] === 'โอนเงินสำเร็จ' && (txtVerified[18] === 'เพื่อดูรายละเอียดการทำรายการ' || txtVerified[19] === 'เพื่อดูรายละเอียดการทำรายการ' || txtVerified[20] === 'เพื่อดูรายละเอียดการทำรายการ')) {

                        txtBankname = 'ธนาคารทหารไทยธนชาต';
                        if (txtVerified[19] === 'เพื่อดูรายละเอียดการทำรายการ') {
                            $('#ref_datetime').val(txtVerified[12]);
                            $('#ref_code').val(txtVerified[16]);
                            $('#ref_start').val(txtVerified[6] + ' (ธ.ทหารไทยธนชาต' + ' ' + txtVerified[5] + ')')
                            $('#ref_target').val(txtVerified[10] + ' (' + txtVerified[9] + ')')
                            $('#ref_total').val(txtVerified[1]);
                        } else if (txtVerified[20] === 'เพื่อดูรายละเอียดการทำรายการ') {
                            $('#ref_datetime').val(txtVerified[13]);
                            $('#ref_code').val(txtVerified[17]);
                            $('#ref_start').val(txtVerified[7] + ' (ธ.ทหารไทยธนชาต' + ' ' + txtVerified[6] + ')')
                            $('#ref_target').val(txtVerified[11] + ' (' + txtVerified[10] + ')')
                            $('#ref_total').val(txtVerified[1]);
                        } else if (txtVerified[18] === 'เพื่อดูรายละเอียดการทำรายการ') {
                            $('#ref_datetime').val(txtVerified[12]);
                            $('#ref_code').val(txtVerified[16]);
                            $('#ref_start').val(txtVerified[7] + ' (ธ.ทหารไทยธนชาต' + ' ' + txtVerified[6] + ')')
                            $('#ref_target').val(txtVerified[10] + ' (' + txtVerified[9] + ')')
                            $('#ref_total').val(txtVerified[1]);
                        }


                    } else if (txtVerified[19] === 'กรุณาใช้แอปธนาคารของท่านสแกน QR Code นี้') {

                        txtBankname = 'ธนาคารทหารไทยธนชาต';

                        $('#ref_datetime').val(txtVerified[14]);
                        $('#ref_code').val(txtVerified[18]);
                        $('#ref_start').val(txtVerified[7] + ' (ธ.ทหารไทยธนชาต' + ' ' + txtVerified[6] + ')')
                        $('#ref_target').val(txtVerified[12] + ' (' + txtVerified[11] + ')')
                        $('#ref_total').val(txtVerified[1]);

                    } else if (txtVerified[1] === 'krungsri') {

                        txtBankname = 'ธนาคารกรุงศรีอยุธยา';

                        if (txtVerified.length == 17 && txtVerified[2] != 'A member of O MUFG') {
                            $('#ref_datetime').val(txtVerified[2]);
                            $('#ref_code').val(txtVerified[14]);
                            $('#ref_start').val(txtVerified[5] + ' (' + 'ธ.กรุงศรีอยุธยา' + ' ' + txtVerified[6] + ')')
                            $('#ref_target').val(txtVerified[7] + ' (' + txtVerified[8] + ')')
                            $('#ref_total').val(txtVerified[10]);
                        } else {
                            $('#ref_datetime').val(txtVerified[4]);
                            $('#ref_code').val(txtVerified[14]);
                            $('#ref_start').val(txtVerified[5] + ' (' + 'ธ.กรุงศรีอยุธยา' + ' ' + txtVerified[6] + ')')
                            $('#ref_target').val(txtVerified[7] + ' (' + txtVerified[8] + ')')
                            $('#ref_total').val(txtVerified[10]);
                        }
                    } else if (txtVerified[14] === 'ธนาคารออมสิน' || txtVerified[0] === 'รายการโอนเงินสำเร็จ') {

                        txtBankname = 'ธนาคารออมสิน';

                        $('#ref_datetime').val(txtVerified[7] + ' ' + txtVerified[8]);
                        $('#ref_code').val(txtVerified[6].replace('snaauô:', '').replace(' ', ''));
                        $('#ref_start').val(txtVerified[10] + ' (' + 'ธ.ออมสิน' + ' ' + txtVerified[12] + ')')
                        $('#ref_target').val(txtVerified[14] + ' (' + txtVerified[16] + ')')
                        $('#ref_total').val(txtVerified[3]);

                    } else if (txtVerified[0] === "Bangkok Bank" || txtVerified[3] === "Bangkok Bank") {

                        txtBankname = 'ธนาคารกรุงเทพ';

                        if (txtVerified.length == 28) {
                            $('#ref_datetime').val(txtVerified[5].replace(',', ''));
                            $('#ref_code').val(txtVerified[25].replace('.', ''));
                            $('#ref_start').val(txtVerified[9] + ' (' + 'ธ.กรุงเทพ' + ' ' + txtVerified[10] + ')')
                            $('#ref_target').val(txtVerified[13] + txtVerified[14] + ' (' + txtVerified[16] + ')')
                            $('#ref_total').val(txtVerified[7])
                        } else if (txtVerified.length == 26) {
                            $('#ref_datetime').val(txtVerified[5].replace(',', ''));
                            $('#ref_code').val(txtVerified[23].replace('.', ''));
                            $('#ref_start').val(txtVerified[8] + ' (' + 'ธ.กรุงเทพ' + ' ' + txtVerified[9] + ')')
                            $('#ref_target').val(txtVerified[12] + txtVerified[13] + ' (' + txtVerified[14] + ')')
                            $('#ref_total').val(txtVerified[7])
                        } else if (txtVerified.length == 25) {
                            $('#ref_datetime').val(txtVerified[2].replace(',', ''));
                            $('#ref_code').val(txtVerified[22].replace('.', ''));
                            $('#ref_start').val(txtVerified[6] + ' (' + 'ธ.กรุงเทพ' + ' ' + txtVerified[7] + ')')
                            $('#ref_target').val(txtVerified[10] + txtVerified[11] + ' (' + txtVerified[13] + ')')
                            $('#ref_total').val(txtVerified[4])
                        } else if (txtVerified.length == 24) {
                            $('#ref_datetime').val(txtVerified[2].replace(',', ''));
                            $('#ref_code').val(txtVerified[20].replace('.', ''));
                            $('#ref_start').val(txtVerified[6] + ' (' + 'ธ.กรุงเทพ' + ' ' + txtVerified[7] + ')')
                            $('#ref_target').val(txtVerified[10] + ' (' + txtVerified[11] + ')')
                            $('#ref_total').val(txtVerified[4])
                        } else {
                            $('#ref_datetime').val(txtVerified[7] + ' ' + txtVerified[8]);
                            $('#ref_code').val(txtVerified[6]);
                            $('#ref_start').val(txtVerified[11] + ' (' + 'ธ.กรุงเทพ' + ' ' + txtVerified[15] + ')')
                            $('#ref_target').val(txtVerified[8] + ' (' + txtVerified[9] + ')')
                            $('#ref_total').val(txtVerified[11]);
                        }

                    } else if (txtVerified[0] === "Krungthai" && txtVerified[1] === "กรุงไทย") {

                        txtBankname = 'ธนาคารกรุงไทย';

                        if (txtVerified.length == 17) {
                            $('#ref_datetime').val(txtVerified[15].replace('-', ' '));
                            $('#ref_code').val(txtVerified[3].replace('รหัสอ้างอิง', ''));
                            $('#ref_start').val(txtVerified[4].substring(2).replace('จาก ', '') + ' (' + 'ธ.กรุงไทย' + ' ' + txtVerified[6] + ')')
                            $('#ref_target').val(txtVerified[7] + ' (' + txtVerified[9] + ')')
                            $('#ref_total').val(txtVerified[11]);
                        } else {
                            $('#ref_datetime').val(txtVerified[15].replace('-', ' '));
                            $('#ref_code').val(txtVerified[3].replace('รหัสอ้างอิง', ''));
                            $('#ref_start').val(txtVerified[4].substring(2).replace('จาก ', '') + ' (' + 'ธ.กรุงไทย' + ' ' + txtVerified[6] + ')')
                            $('#ref_target').val(txtVerified[7] + ' (' + txtVerified[9] + ')')
                            $('#ref_total').val(txtVerified[11]);
                        }

                    } else if (txtVerified[0].search("SCB") >= 0 || txtVerified[1].search("SCB") >= 0) {

                        txtBankname = 'ธนาคารไทยพาณิชย์';

                        if (txtVerified.length == 15) {
                            $('#ref_datetime').val(txtVerified[2].replace('-', ' '));
                            $('#ref_code').val(txtVerified[3].replace('รหัสอ้างอิง: ', ''));
                            $('#ref_start').val((txtVerified[4] + ' ' + txtVerified[5]).replace('จาก ', '').substring(2) + ' (' + 'ธ.ไทยพาณิชย์' + ' ' + txtVerified[6] + ')')
                            $('#ref_target').val(txtVerified[8].substring(2) + ' (' + txtVerified[9] + ')')
                            $('#ref_total').val(txtVerified[11]);
                        } else if (txtVerified.length == 17) {
                            $('#ref_datetime').val(txtVerified[3] + ' ' + txtVerified[4]);
                            $('#ref_code').val(txtVerified[5].replace('รหัสอ้างอิง: ', ''));
                            $('#ref_start').val(txtVerified[6].substring(2).replace('จาก ', '') + ' (' + 'ธ.ไทยพาณิชย์' + ' ' + txtVerified[8] + ')')
                            $('#ref_target').val(txtVerified[10].substring(2) + ' (' + txtVerified[11] + ')')
                            $('#ref_total').val(txtVerified[13]);
                        } else if (txtVerified.length == 16) {
                            $('#ref_datetime').val(txtVerified[3].replace('-', ' '));
                            $('#ref_code').val(txtVerified[4].replace('รหัสอ้างอิง: ', ''));
                            $('#ref_start').val((txtVerified[5] + ' ' + txtVerified[6]).replace('จาก ', '').substring(2) + ' (' + 'ธ.ไทยพาณิชย์' + ' ' + txtVerified[7] + ')')
                            $('#ref_target').val(txtVerified[9].substring(2) + ' (' + txtVerified[10] + ')')
                            $('#ref_total').val(txtVerified[12]);

                        }


                    }

                }
            };
            const getImageBase64String = async () => {
                return await toBase64(imageFile.files[0]);
            };
            const toBase64 = file =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                });

            imageFile.addEventListener("change", e => {

                e.preventDefault();

                $(".modal-body").LoadingOverlay("show", {
                    image: '',
                    custom: customElement
                });

                detectImage();

            });

        });

    } else {

        window.location.assign('./login');

    }

});