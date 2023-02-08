'use strict';
let fs = firebase.firestore();

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const objProfile = JSON.parse(localStorage.getItem('objAuth'));
const user_id = objProfile[0]['username'];
const url_api = "http://localhost:49705";
//const url_api = "http://192.168.1.247:8089";


const url_ck_inv_create = url_api + '/v1/Trp_Ck_Inv_Create';
const url_ck_inv_update = url_api + '/v1/Trp_Ck_Inv_Update';

let oTable = $('#tbl-list').DataTable({ "order": [[0, "asc"]], "pageLength": 100 });

const BR_v1_s = 'http://192.168.1.247/intranet/public/sound/BR_v1_s.mp3';
const BR_v2_s = 'http://192.168.1.247/intranet/public/sound/BR_v2_s.mp3';
const BR_v3_s = 'http://192.168.1.247/intranet/public/sound/BR_v3_s.mp3';

firebase.auth().onAuthStateChanged(function (user) {

    if (user) {

        $.init = async function () {

            $('#inv_number').keyup(function () {
                this.value = this.value.toUpperCase().replace(' ', '').trim();
            });

            $('#frm_job').find('#btn-main').on('click', function (e) {

                e.preventDefault();

                window.history.pushState({}, document.title, "/" + "trp/check_iv_job");

                location.reload();
            });


            if (urlParams.get('inv_number') != null) {

                $('#frm_job').find('#inv_number').val(urlParams.get('inv_number')).focus();

                $("#global-loader").fadeIn("slow");

                fetch(url_ck_inv_create + '?inv_number=' + urlParams.get('inv_number') + '&created_by=' + user_id).then(function (response) {

                    return response.json();

                }).then(function (result) {
                    console.log('result', result.data)
                    if (result.length > 0) {
                        //console.log(result.data);
                        var audio = new Audio(BR_v1_s); audio.volume = 1; audio.play();
                        $('#frm_job').find('#inv_number').prop('disabled', true);
                        $('#frm_job').find('.hideny').removeClass('d-none');

                        $('#user').val(user_id);
                        $('#pk_number').val(result.data[0]['job_pk_number']);
                        $('#inv_emmas').val(result.data[0]['job_inv_emmas']);
                        $('#inv_address').val(result.data[0]['job_inv_address']);
                        $('#inv_date').val(moment(result.data[0]['job_inv_date']).format('DD/MM/YYYY'));

                        let i = 1;
                        let bg_row;
                        let sum_qty_current = 0;
                        let sum_qty_total = 0;

                        oTable.destroy();
                        $.each(result.data, function (key, val) {

                            let add_qty = val['job_item_qty'];
                            let cost_qty = val['job_item_trnqty'];

                            sum_qty_current += parseFloat(add_qty)
                            sum_qty_total += parseFloat(cost_qty)

                            if (add_qty == '0') {
                                bg_row = '#FFC0CB';
                            } else if (add_qty < cost_qty) {
                                bg_row = '#FFFFCC';
                            } else if (add_qty == cost_qty) {
                                bg_row = '#66FF99';
                            } else {
                                alert('Erorr');
                            }

                            $('#tbl-list').find('tbody').append('<tr style="background-color: ' + bg_row + ';">' +
                                '<td class="d-none">' + val['job_detail_id'] + '</td>' +
                                '<td style="text-align:center">' + i + '</td>' +
                                '<td style="text-align:center">' + val['job_item_barcode'] + '</td>' +
                                '<td style="text-align:center">' + val['job_item_name'] + '</td>' +
                                '<td style="text-align:center">' + val['job_item_spcodes'] + '</td>' +
                                '<td style="text-align:center">' + '<span style="color:blue;">' + add_qty + '</span >' + ' ' + '/' + ' ' + '<span style="color:green;">' + cost_qty + '</span >' + '</td>' +
                                '<td class="d-none" style="text-align:center">' + '' + '</td>' +
                                '<td style="text-align:center">' + val['job_item_unit'] + '</td>' +
                                '</tr>'
                            )

                            i++

                        });

                        oTable = $('#tbl-list').DataTable({ "order": [[1, "asc"]], "pageLength": 100, "bDestroy": true, "columnDefs": [{ "targets": [1, 6], "width": "45px" }, { "targets": [3], "width": "350px" }, { "targets": [5], "width": "90px" }] });

                        $('#frm_job').find('#gbarcode').focus();
                        $('#frm_job').find('#job_detail_qty').val('1');
                        $('#sum_qty_current').html(sum_qty_current).css("color", "#F39C12");
                        $('#sum_qty_total').html(sum_qty_total).css("color", "#138D75");
                        $('#sum_qty_item').html(i - 1);
                        if (sum_qty_current === sum_qty_total) {
                            toastr.warning('จำนวนสินค้าครบแล้ว')
                            swal({
                                title: 'จำนวนสินค้าครบแล้ว',
                                type: 'warning',
                                //timer: 1000,
                                closeOnConfirm: false,
                            })
                        }
                        //audio.play();
                        $("#global-loader").fadeOut("slow");

                    } else {
                        var audio = new Audio(BR_v2_s); audio.volume = 1; audio.play();
                        $("#global-loader").fadeOut("slow");
                        toastr.error('ไม่พบข้อมูล')
                        $('#frm_job').find('#inv_number').val('');
                    }

                });

            }

        };

        $.Create = async function () {

            var full_mail = user.email;
            var name = full_mail.replace("@vskautoparts.com", "");

            $('#frm_job').find('#created_by').val(user_id);

            $('#frm_job').find('#inv_number').focus().keyup(async function (e) {

                e.preventDefault();
                //console.log($(this).val().length

                if ($(this).val().length === 12) {

                    if (e.keyCode == 13) {

                        $("#global-loader").fadeIn("slow");

                        if ($(this).val() == 'RESETDATA000') {

                            window.history.pushState({}, document.title, "/" + "trp/check_iv_job");

                            location.reload();

                        } else {

                            fetch(url_ck_inv_create + '?inv_number=' + $(this).val() + '&created_by=' + user_id).then(function (response) {

                                return response.json();

                            }).then(function (result) {
                                console.log('result', result.data)
                                if (result.length > 0) {
                                    //console.log(result.data);
                                    var audio = new Audio(BR_v1_s); audio.volume = 1; audio.play();
                                    $('#frm_job').find('#inv_number').prop('disabled', true);
                                    $('#frm_job').find('.hideny').removeClass('d-none');

                                    $('#user').val(user_id);
                                    $('#pk_number').val(result.data[0]['job_pk_number']);
                                    $('#inv_emmas').val(result.data[0]['job_inv_emmas']);
                                    $('#inv_address').val(result.data[0]['job_inv_address']);
                                    $('#inv_date').val(moment(result.data[0]['job_inv_date']).format('DD/MM/YYYY'));

                                    let i = 1;
                                    let bg_row;
                                    let sum_qty_current = 0;
                                    let sum_qty_total = 0;

                                    oTable.destroy();
                                    $.each(result.data, function (key, val) {

                                        let add_qty = val['job_item_qty'];
                                        let cost_qty = val['job_item_trnqty'];

                                        sum_qty_current += parseFloat(add_qty)
                                        sum_qty_total += parseFloat(cost_qty)

                                        if (add_qty == '0') {
                                            bg_row = '#FFC0CB';
                                        } else if (add_qty < cost_qty) {
                                            bg_row = '#FFFFCC';
                                        } else if (add_qty == cost_qty) {
                                            bg_row = '#66FF99';
                                        } else {
                                            alert('Erorr');
                                        }

                                        $('#tbl-list').find('tbody').append('<tr style="background-color: ' + bg_row + ';">' +
                                            '<td class="d-none">' + val['job_detail_id'] + '</td>' +
                                            '<td style="text-align:center">' + i + '</td>' +
                                            '<td style="text-align:center">' + val['job_item_barcode'] + '</td>' +
                                            '<td style="text-align:center">' + val['job_item_name'] + '</td>' +
                                            '<td style="text-align:center">' + val['job_item_spcodes'] + '</td>' +
                                            '<td style="text-align:center">' + '<span style="color:blue;">' + add_qty + '</span >' + ' ' + '/' + ' ' + '<span style="color:green;">' + cost_qty + '</span >' + '</td>' +
                                            '<td class="d-none" style="text-align:center">' + '' + '</td>' +
                                            '<td style="text-align:center">' + val['job_item_unit'] + '</td>' +
                                            '</tr>'
                                        )

                                        i++

                                    });

                                    oTable = $('#tbl-list').DataTable({ "order": [[1, "asc"]], "pageLength": 100, "bDestroy": true, "columnDefs": [{ "targets": [1, 6], "width": "45px" }, { "targets": [3], "width": "350px" }, { "targets": [5], "width": "90px" }] });

                                    $('#frm_job').find('#gbarcode').focus();
                                    $('#frm_job').find('#job_detail_qty').val('1');
                                    $('#sum_qty_current').html(sum_qty_current).css("color", "#F39C12");
                                    $('#sum_qty_total').html(sum_qty_total).css("color", "#138D75");
                                    $('#sum_qty_item').html(i - 1);
                                    if (sum_qty_current === sum_qty_total) {
                                        toastr.warning('จำนวนสินค้าครบแล้ว')
                                        swal({
                                            title: 'จำนวนสินค้าครบแล้ว',
                                            type: 'warning',
                                            //timer: 1000,
                                            closeOnConfirm: false,
                                        })
                                    }
                                    //audio.play();
                                    $("#global-loader").fadeOut("slow");

                                } else {
                                    var audio = new Audio(BR_v2_s); audio.volume = 1; audio.play();
                                    $("#global-loader").fadeOut("slow");
                                    toastr.error('ไม่พบข้อมูล')
                                    $('#frm_job').find('#inv_number').val('');
                                }

                            });

                        }
                    }
                } else {
                    if (e.keyCode == 13) {
                        var audio = new Audio(BR_v2_s); audio.volume = 1; audio.play();
                        //console.log($(this).val().length);
                        $("#global-loader").fadeOut("slow");
                        toastr.error('ไม่พบข้อมูล')
                        $('#frm_job').find('#inv_number').val('');
                    }
                }
            });
        };

        $.Update = async function () {

            var full_mail = user.email;
            var name = full_mail.replace("@vskautoparts.com", "");

            $('#frm_job').find('#gbarcode').focus().keyup(async function (e) {

                e.preventDefault();

                $(document).keyup(function (e) {

                    if (e.keyCode == 9) {
                        $('#frm_job').find('#gbarcode').focus();
                    }

                });

                if ($(this).val().length >= 3) {

                    if (e.keyCode == 13) {

                        if ($(this).val() == 'RESETDATA000') {

                            window.history.pushState({}, document.title, "/" + "trp/check_iv_job");

                            location.reload();

                        } else {

                            let gbarcode = $('#frm_job').find('#gbarcode').val();

                            gbarcode = $.trim(gbarcode)

                            $('#frm_job').find('#gbarcode').prop('disabled', true);

                            let update_data = {
                                inv_number: $('#frm_job').find('#inv_number').val(),
                                keyword: gbarcode,
                                job_detail_qty: $('#frm_job').find('#job_detail_qty').val() > 1 ? $('#frm_job').find('#job_detail_qty').val() : 1,
                                updated_by: user_id,
                            };

                            var params = [];
                            for (const i in update_data) {
                                params.push(i + "=" + encodeURIComponent(update_data[i]));
                            }

                            fetch(url_ck_inv_update, {
                                method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                                // mode: 'no-cors', // no-cors, *cors, same-origin
                                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                                credentials: 'same-origin', // include, *same-origin, omit
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                                body: params.join("&"),
                            }).then(result => {
                                return result.json();
                            }).then(result => {
                                //console.log('data is', result.data);
                                if (result.status === 'Error') {

                                    toastr.error(data.error_message);
                                    //กรุณาลองใหม่อีกครั้ง
                                    var audio = new Audio(BR_v2_s); audio.volume = 1; audio.play();

                                } else {

                                    if ((result.data[0]['pMessage']) != null) {

                                        toastr.error(result.data[0]['pMessage'])

                                        if (result.data[0]['pMessage'] == 'จำนวนสินค้าครบแล้ว') {
                                            //จำนวนสินค้าครบแล้ว
                                            var audio = new Audio(BR_v3_s); audio.volume = 1; audio.play();

                                        } else {
                                            //ไม่พบรายการสินค้า
                                            var audio = new Audio(BR_v2_s); audio.volume = 1; audio.play();

                                        }

                                    } else {

                                        oTable.destroy();

                                        var audio = new Audio(BR_v1_s); audio.volume = 1; audio.play();

                                        $('#tbl-list tbody').empty();

                                        toastr.success('Save Successfully!', async function (sum_qty_current) {
                                            //$("#global-loader").fadeIn("slow");
                                            let i = 1;
                                            let bg_row;
                                            let tr_row = "block";

                                            $.each(result.data, function (key, val) {

                                                let add_qty = val['job_item_qty'];
                                                let cost_qty = val['job_item_trnqty'];

                                                if (add_qty == '0') {
                                                    bg_row = '#FFC0CB';
                                                } else if (add_qty < cost_qty) {
                                                    bg_row = '#FFFFCC';
                                                } else if (add_qty == cost_qty) {
                                                    bg_row = '#66FF99';
                                                } else {
                                                    alert('Erorr');
                                                }

                                                $('#tbl-list').find('tbody').append('<tr style="background-color: ' + bg_row + ';">' +
                                                    '<td class="d-none">' + val['job_detail_id'] + '</td>' +
                                                    '<td style="text-align:center">' + i + '</td>' +
                                                    '<td style="text-align:center">' + val['job_item_barcode'] + '</td>' +
                                                    '<td style="text-align:center">' + val['job_item_name'] + '</td>' +
                                                    '<td style="text-align:center">' + val['job_item_spcodes'] + '</td>' +
                                                    '<td style="text-align:center">' + '<span style="color:blue;">' + add_qty + '</span >' + ' ' + '/' + ' ' + '<span style="color:green;">' + cost_qty + '</span >' + '</td>' +
                                                    '<td class="d-none" style="text-align:center">' + '' + '</td>' +
                                                    '<td style="text-align:center">' + val['job_item_unit'] + '</td>' +
                                                    '</tr>'
                                                )

                                                i++

                                            });

                                        });
                                        oTable = $('#tbl-list').DataTable({ "order": [[1, "asc"]], "bDestroy": true, "pageLength": 100 });
                                        $('#sum_qty_current').html(parseFloat($('#sum_qty_current').html()) + parseFloat($('#job_detail_qty').val()));

                                    }
                                    $('#frm_job').find('#gbarcode').prop('disabled', false);
                                    $('#frm_job').find('#gbarcode').val("").focus();
                                    $('#frm_job').find('#job_detail_qty').val('1');
                                    //$("#global-loader").fadeOut("slow");
                                }

                            }).catch((error) => {
                                var audio = new Audio(BR_v2_s); audio.volume = 1; audio.play();
                                toastr.error(error, 'Error writing document');
                                $('#frm_job').find('#gbarcode').prop('disabled', false);
                                $('#frm_job').find('#gbarcode').val("").focus();
                                $('#frm_job').find('#job_detail_qty').val('1');

                            });

                        }

                        return false;
                    }

                } else {

                    if (e.keyCode == 13) {
                        var audio = new Audio(BR_v2_s); audio.volume = 1; audio.play();
                        toastr.error('ไม่พบข้อมูล')
                        $('#frm_job').find('#gbarcode').val('');
                        $("#global-loader").fadeOut("slow");
                    }

                }

            });

        };

        $(document).ready(async function () {

            await $.init();
            await $.Create();
            await $.Update();

        });


    } else {

        window.location.assign('./login');

    }

});