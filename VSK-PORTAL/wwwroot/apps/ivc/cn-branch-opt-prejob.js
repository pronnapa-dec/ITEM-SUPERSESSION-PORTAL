'use strict';

let fs = firebase.firestore();
const objProfile = JSON.parse(localStorage.getItem('objAuth'));
const user_id = objProfile[0]['username'];

const url_api = "http://192.168.1.247/intranet/pur-api";
const url_api_uat = "http://localhost:49708";
//const url_api_uat = "http://192.168.1.247:8899/cn-branch-api";


const url_salefile_get = url_api_uat + '/v1/salefile_get';
const url_saletra_get = url_api_uat + '/v1/saletra_get';
const url_cn_branch_pre_job_get = url_api_uat + '/v1/Cn_Branch_Pre_Job_Get';
const url_cn_branch_pre_job_create = url_api_uat + '/v1/Cn_Branch_Pre_Job_Create';
const Cn_Branch_Lov_Get = url_api_uat + '/v1/Cn_Branch_Lov_Get';
const lists_get = url_api + '/v1/Cn_Pre_Job_Get';

let oTable = [];
let history_Table; //$('#tbl-list-history').DataTable({ "order": [[0, "desc"]], "pageLength": 50 });

let cn_pre_job_type_dataset = [];
let job_comment_dataSet = [];
let job_comment_dataSet_list = [];


firebase.auth().onAuthStateChanged(function (user) {

    if (user) {

        $.init = async function () {

            // $( "#cn_pre_job_type" ).replaceWith( '<select class="form-control select2-no-search" id="cn_pre_job_type" name="cn_pre_job_type" data-width="100%" required="" data-parsley-error-message="กรุณาเลือกการแจ้งรับ"> <option value="1">รับคืน</option></select>' );
            $("#cn_pre_job_type").append('<option value="1">รับคืน</option>')

            $('#created_by').val(user_id);

            $('.select2').select2({ minimumResultsForSearch: -1 });

            $('#branch').on('change', function () {
                $('#frm_data input:not(#job_status , #created_by)').val('')
                $('#frm_data select:not(#branch , #cn_pre_job_type)').val('').trigger('change')

                $(this).val() != '' ? $('#item_list, #salefile_number').prop('disabled', false) : $('#item_list #salefile_number').prop('disabled', true)
            })

            $('#item_list').select2({
                //tags: true,
                ajax: {
                    url: url_api_uat + '/v1/Cn_Branch_Item_Get',
                    dataType: 'json',
                    width: 'resolve',
                    dropdownAutoWidth: true,
                    minimumInputLength: 2,
                    minimumResultsForSearch: 50,
                    data: function (params) {
                        var query = {
                            branch_id: $('#branch').val(),
                            item_master: typeof params.term !== 'undefined' ? params.term : ''
                        }
                        //console.log(params);
                        return query;
                    },
                    matcher: function (params, data) {
                        return matchStart(params, data);
                    },
                    processResults: function (resulte, search) {
                        return {
                            results: $.map(resulte.data, function (item) {
                                return {
                                    text: item.text,
                                    id: item.id,
                                    spcode: item.SPCODES,
                                    name: item.name
                                }
                            })
                        };
                    },
                    cache: true
                }

            });

            $('#item_list').on('select2:select', function (e) {
                var data = e.params.data;
                $(this).attr({ 'data-spcode': data.spcode, 'data-name': data.name });
            });

            $.Load_comment();
            // $.Load_Case();
            $.History();

        };

        $.List = async function () {


            let get_data = {
                cn_pre_job_datetime_start: moment().format('YYYY-MM-DD') + ' 00:00',
                cn_pre_job_datetime_end: moment().format('YYYY-MM-DD') + ' 23:59',
                record_status: 1,
                Mode: 'Search'
            };

            var params = [];
            for (const i in get_data) {
                params.push(i + "=" + encodeURIComponent(get_data[i]));
            }

            fetch(url_cn_branch_pre_job_get + '?' + params.join("&")).then(function (response) {

                return response.json();

            }).then(function (result) {

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

                    oTable = $('#tbl-prejob_list').DataTable({
                        data: result.data,
                        //scrollX: true,
                        //scrollY: "410px",
                        scrollCollapse: true,
                        destroy: true,
                        paging: true,
                        //pageLength: 20,
                        columns: [{
                            title: "<span style='font-size:11px;'>เวลา</span>",
                            width: "7%",
                            class: "tx-center",
                            data: 'cn_pre_job_datetime',
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + moment(data).format('HH:mm') + '</span>';
                            }
                        },
                        {
                            title: "<span style='font-size:11px;'>เลยที่ใบงาน</span>",
                            class: "tx-center",
                            width: "9%",
                            data: 'cn_pre_job_jobno',
                            render: function (data, type, row, meta) {
                                return row.salefile_number != null ? row.salefile_number != '' ? data + '<br>' + '( ' + row.salefile_number + ' )' : data : data
                            }
                        }, //1
                        {
                            title: "<div class='tx-center'><span style='font-size:11px;'>สาขา</span></div>",
                            data: "cn_pre_job_branch",
                            width: "80px",
                            class: "tx-center",
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        }, //3
                        {
                            title: "<span style='font-size:11px;'>สถานะ</span>",
                            data: "cn_pre_job_status",
                            class: "tx-center job_status",
                            width: "50px",
                            visible: true,
                            render: function (data, type, row, meta) {
                                if (data == 'open') {
                                    return '<span style="color:red; font-size:11px;">Open</span>';
                                } else if (data == 'on_process') {
                                    return '<span style="color:orange; font-size:11px;">On Process</span>';
                                } else if (data == 'receive') {
                                    return '<span style="color:green; font-size:11px;">Receive</span>';
                                } else if (data == 'complete') {
                                    return '<span style="color:green; font-size:11px;">Complete</span>';
                                } else if (data == 'rejected') {
                                    return '<span style="color:red; font-size:11px;">Rejected</span>';
                                } else if (data == "change") {
                                    return '<span style="color:#00AEFF;">Change</span>';
                                } else if (data == "cancel") {
                                    return '<span style="color:#FFC300; font-size:11px;">Cancel</span>';
                                } else {
                                    return '<span style="color:#000; font-size:11px;">' + data + '</span>';

                                }

                            }
                        }, //4
                        {
                            title: "<div class='tx-center'> <spanstyle='font-size:11px;'>ข้อมูลสินค้า</span></div>",
                            data: "cn_pre_job_item_name",
                            class: "tx-left",
                            width: "30%",
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + row.cn_pre_job_item_barcode + " :" + data + "(" + row.cn_pre_job_item_spcode + ")" + '</span>';
                            }
                        }, //5
                        {
                            title: "<span style='font-size:11px;'>Qty.</span>",
                            width: "7%",
                            class: "tx-center",
                            data: 'cn_pre_job_qty',
                            render: function (data, type, row, meta) {
                                return data
                            }
                        }, //6
                        {
                            title: "<span style='font-size:11px;'>การรับแจ้ง</span>",
                            data: "cn_pre_job_type",
                            width: "11%",
                            class: "tx-center",
                            render: function (data, type, row, meta) {
                                return data === '1' ? '<span class="badge badge-info">รับคืน</span>' : '<span class="badge badge-success">หน้างาน</span>'
                            }
                        }, //7
                        {
                            title: "<span style='font-size:11px;'>สาเหตุ</span>",
                            data: "cn_pre_job_comment",
                            width: "25%",
                            class: "tx-center",
                            render: function (data, type, row, meta) {
                                return '<div class="tx-left">' + data + '</div>'
                            }
                        }, //8
                        {
                            title: "<span style='font-size:11px;'>โดย</span>",
                            data: "created_by",
                            width: "70px",
                            //visible: false,
                            class: "tx-center",
                            render: function (data, type, row, meta) {
                                return '<div class="tx-left">' + data + '</div>'
                            }
                        }],

                        order: [
                            [1, 'asc'],
                        ],

                        "order": [[0, "asc"]],
                        "initComplete": function (settings, json) {


                            $("#tbl-list-book-taxnum tr  th #select-all").parents('th').removeClass('sorting_asc');

                            // Handle click on "Select all" control
                            $('#select-all').on('click', function () {
                                // Get all rows with search applied
                                var rows = oTable.rows({ 'search': 'applied' }).nodes();
                                // Check/uncheck checkboxes for all rows in the table
                                $('input[type="checkbox"]', rows).prop('checked', this.checked);
                            });

                            // Handle click on checkbox to set state of "Select all" control
                            $('#tbl-list-book-taxnum tbody').on('change', 'input[type="checkbox"]', function () {
                                // If checkbox is not checked
                                if (!this.checked) {
                                    var el = $('#select-all').get(0);
                                    // If "Select all" control is checked and has 'indeterminate' property
                                    if (el && el.checked && ('indeterminate' in el)) {
                                        // Set visual state of "Select all" control
                                        // as 'indeterminate'
                                        el.indeterminate = true;
                                    }
                                }
                            });

                            // Handle form submission event
                            $("#global-loader").fadeOut("slow");

                            $('#tbl-list-book-taxnum tbody tr').hover(function () {
                                $(this).css('cursor', 'pointer');
                            });

                            $.contextMenu({
                                selector: '#tbl-list-book-taxnum tbody tr',
                                callback: async function (key, options) {

                                    let data = oTable.row(this).data();

                                    let dataSet = {
                                        id: data['id'],
                                        inv_tax_header_number: data['inv_tax_header_number'],
                                        mode: data['mode'],
                                        number: data['number'],
                                        pMessage: data['pMessage'],
                                        record_status: data['record_status'],
                                        start_date: data['start_date'],
                                        end_date: data['end_date'],
                                        status: data['status'],
                                        created_by: data['created_by'],
                                        created_date: data['created_date'],
                                        updated_by: data['updated_by'],
                                        updated_datetime: data['updated_datetime']

                                    }

                                    console.log('dataSet', dataSet)

                                    $('#modal-frm_tax_number').modal({

                                        keyboard: false,
                                        backdrop: 'static'

                                    });

                                    if (key === 'edit') {

                                        $.Details(dataSet);
                                        $.Edit(dataSet);

                                    } else if (key === 'view') {

                                        $.Details(dataSet);

                                    } else {

                                        alert('ERROR');

                                    }

                                },

                                items: {

                                    "view": { name: "View", icon: "fas fa-search" },
                                    "edit": { name: "Edit", icon: "edit edit-detail" },
                                }

                            });

                        },


                    });



                    $("#global-loader").fadeOut("slow");

                }

            });

        };

        $.Create = async function () {

            var today = new Date();
            var dd = today.getDate();

            var mm = today.getMonth() + 1;
            var yyyy = today.getFullYear();
            if (dd < 10) {
                dd = '0' + dd;
            }

            if (mm < 10) {
                mm = '0' + mm;
            }

            today = dd + '/' + mm + '/' + yyyy;

            $('#tiltle-table').html("รายการ รับคืนประจำวัน" + "   " + today)
            $('#last_update').html(moment().format('DD/MM/YYYY HH:mm:ss'))

            let salefile_invcode = ''
            let salefile_invname = ''
            let salefile_datetime;

            let flex_iv = 0;

            $('#salefile_number').on('keypress keyup blur', function (e) {

                //e.preventDefault();
                $(this).val($(this).val().toUpperCase());

                if ($(this).val().length === 12) {

                    if (e.which >= 65 && e.which <= 105) {

                        $("#global-loader").fadeIn("slow");

                        $('#btn-htr-iv').removeClass('d-none');
                        $('#item_list').empty();

                        $('.saletra_item_list').removeClass('d-none')
                        $('#saletra_item_list').attr('required')

                        $('.item_list').addClass('d-none')
                        $('#item_list').removeAttr('required')

                        fetch(url_salefile_get + '?number=' + $(this).val() + '&branch_id=' + $('#branch').val()).then(function (response) {

                            return response.json();

                        }).then(function (result) {
                            $("#global-loader").fadeOut("slow");

                            if (result.length > 0) {

                                $('#saletra_item_list').empty();
                                $('#item_list').empty();
                                salefile_invcode = '';
                                salefile_invname = '';
                                salefile_datetime = '';

                                $('.saletra_item_list').removeClass('d-none')
                                $('#saletra_item_list').attr('required')
                                $('#saletra_item_list').prop("disabled", false);

                                $('.item_list').addClass('d-none')
                                $('#item_list').removeAttr('required')


                                $.each(result.data, function (key, val) {

                                    salefile_invcode = val['invcode'];
                                    salefile_invname = val['invname'];
                                    salefile_datetime = val['startdate']
                                });

                                fetch(url_saletra_get + '?number=' + $('#salefile_number').val() + '&branch_id=' + $('#branch').val()).then(function (response) {

                                    return response.json();

                                }).then(function (result) {

                                    flex_iv = 1;

                                    $('#saletra_item_list').empty();

                                    $.each(result.data, function (key, val) {

                                        $('#saletra_item_list').append('<option value="' + $.trim(val['gbarcode']) + '" data-gbarcode="' + $.trim(val['gbarcode']) + '"data-name="' + $.trim(val['stkname']) + '"data-spcode="' + $.trim(val['spcodes']) + '" data-whdiscode="' + $.trim(val['whdiscode']) + '" data-trnqty="' + $.trim(val['trnqty']) + '">' + $.trim(val['gbarcode']) + ' : ' + $.trim(val['stkname']) + ' (' + $.trim(val['spcodes']) + ')</option>')

                                    });
                                    $("#saletra_qty").attr({ "max": $("[name=saletra_item_list]").find(':selected').data("trnqty") });

                                });

                            } else {

                                flex_iv = 0;

                                console.log('No Data');

                                salefile_invcode = '';
                                salefile_invname = '';
                                salefile_datetime = '';

                                $('#saletra_item_list').prop("disabled", false);
                                $('#item_list').prop("disabled", false);
                                swal({
                                    type: 'error',
                                    title: 'ไม่พบเลขที่ใบเสร็จ',
                                    text: 'กรุณาตรวจสอบเลขที่ใบเสร็จอีกครั้ง!',
                                }, function (isConfirmed) {
                                    // if (isConfirmed) {

                                    //     

                                    // }
                                })

                            }

                        });

                    }

                } else if ($(this).val().length > 12) {
                    flex_iv = 0;

                    salefile_invcode = '';
                    salefile_invname = '';
                    salefile_datetime = '';

                    swal({
                        type: 'error',
                        title: 'เลขที่ใบเสร็จไม่ถูกต้อง',
                        text: 'กรุณาตรวจสอบเลขที่ใบเสร็จอีกครั้ง!',
                    }, function (isConfirmed) {
                        // if (isConfirmed) {

                        //     location.reload();

                        // }
                    })

                } else {

                    flex_iv = 0;

                    salefile_invcode = '';
                    salefile_invname = '';
                    salefile_datetime = '';



                    $('#btn-htr-iv').addClass('d-none');

                    $('#saletra_item_list').empty();
                    $('#item_list').empty();
                    $('#salefile_invcode').val("");
                    $('#salefile_invname').val("");

                    $('.saletra_item_list').addClass('d-none')
                    $('#saletra_item_list').removeAttr('required')

                    $('.item_list').removeClass('d-none')
                    $('#item_list').attr('required')
                    $("#saletra_qty").attr({ "max": "500" });

                    if ($(this).val().length === 0) {

                        $('#item_list').prop("disabled", false);
                    } else {
                        $('#saletra_item_list').prop("disabled", true);
                        $('#item_list').prop("disabled", true);
                    }


                }

            });

            $("#saletra_qty").on("keypress keyup blur", function (event) {
                $(this).val($(this).val().replace(/[^\d].+/, ""));
                if ((event.which < 48 || event.which > 57)) {
                    event.preventDefault();
                } /// numeric only

                let max = parseInt($(this).attr('max'));
                let min = parseInt($(this).attr('min'));

                if ($("#saletra_qty").val() > max) {
                    $("#saletra_qty").val(max);
                }
                else if ($("#saletra_qty").val() < min) {
                    $("#saletra_qty").val(min);
                }
            });

            $("[name=saletra_item_list]").change(function () {
                let trnqty = $(this).find(':selected').data("trnqty");
                $("#saletra_qty").val("");
                $("#saletra_qty").attr({ "max": trnqty });
            });

            $('#btn-save_form').click(function (e) {

                $('#frm_data').parsley().on('form:submit', function () {

                    $('#btn-save_form').prop('disabled', true);

                    // oTable.destroy();

                    let uuid = $.uuid();

                    // Model & Repo ไปเปลี่ยนเอาเอง
                    let add_data = {
                        cn_pre_job_branch: $('#frm_data').find('#branch').val(),
                        cn_pre_job_item_barcode: flex_iv == 0 ? $('#frm_data').find('#item_list').val() : $('#frm_data').find('#saletra_item_list').val(),
                        cn_pre_job_item_name: flex_iv == 0 ? $('#frm_data').find('#item_list').attr("data-name") : $('#saletra_item_list').find('option:selected').attr("data-name"),
                        cn_pre_job_item_spcode: flex_iv == 0 ? $('#frm_data').find('#item_list').attr("data-spcode") : $('#saletra_item_list').find('option:selected').attr("data-spcode"),
                        //salefile_datetime: flex_iv == 1 ? salefile_datetime : '1900-01-01 00:00:00.000',
                        salefile_datetime: flex_iv == 1 ? salefile_datetime : '',
                        cn_pre_job_qty: $('#frm_data').find('#saletra_qty').val(),
                        cn_pre_job_type: $('#frm_data').find('#cn_pre_job_type').val(),
                        cn_pre_job_comment: $('#frm_data').find('#job_comment').val(),
                        cn_pre_job_detail_remark: $('#frm_data').find('#cn_pre_job_detail_remark').val(),
                        salefile_number: flex_iv == 1 ? $('#frm_data').find('#salefile_number').val() : '',
                        salefile_invcode: flex_iv == 1 ? salefile_invcode : '',
                        record_status: '1',
                        created_by: user_id
                    };

                    var params = [];
                    for (const i in add_data) {
                        params.push(i + "=" + encodeURIComponent(add_data[i]));
                    }

                    var resStatus = 0;

                    fetch(url_cn_branch_pre_job_create, {
                        method: 'PUT', // *GET, POST, PUT, DELETE, etc.
                        // mode: 'no-cors', // no-cors, *cors, same-origin
                        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                        credentials: 'same-origin', // include, *same-origin, omit
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                        body: params.join("&"),
                    }).then(data => {
                        resStatus = data.status
                        return data.json();
                    }).then(data => {
                        resStatus = data.status;

                        if (data.status === 'Error') {
                            toastr.error(data.error_message);

                        } else {

                            toastr.success('Save Successfully!', async function () {

                                $.List();

                                $('#frm_data input:not(#job_status , #created_by)').val('')
                                $('#frm_data select').val('').trigger('change')
                                $('#cn_pre_job_type').val('1').trigger('change.select2');
                                $('#btn-save_form').prop('disabled', false);

                                $('#saletra_item_list').empty();
                                $('#item_list').empty();

                                $('.saletra_item_list').addClass('d-none')
                                $('#saletra_item_list').removeAttr('required')

                                $('.item_list').removeClass('d-none')
                                $('#item_list').attr('required')
                                $("#saletra_qty").attr({ "max": "500" });
                                flex_iv = 0;


                            });
                        }

                    }).catch((error) => {
                        toastr.error(error, 'Error writing document');
                        console.error('Error:', error);
                    });

                    return false;

                });

            });
        };

        $.History = async function () {

            $('#modal-frm_history').on('shown.bs.modal', function () {

                let url = new URL(url_cn_branch_pre_job_get);
                var CNdate_start = '2020-11-01 00:00:00.0';
                var CNdate_end = moment().format('YYYY-MM-DD') + ' 23:59:00.0';
                url.search = new URLSearchParams({
                    cn_pre_job_datetime_start: CNdate_start,
                    cn_pre_job_datetime_end: CNdate_end,
                    salefile_number: $('#salefile_number').val(),
                    saletra_item_barcode: '',
                    cn_pre_job_comment: '',
                    created_by: '',
                    cn_pre_job_status: '',
                    cn_pre_job_jobno: '',
                    cn_pre_job_assige: '',
                    record_status: '1',
                    mode: 'search'
                });

                fetch(url).then(function (response) {
                    return response.json();
                }).then(function (result) {
                    $('#tbl-list-history').css({ "width": "100%" });

                    history_Table = $('#tbl-list-history').DataTable({
                        data: result.data,
                        //scrollX: true,
                        //scrollCollapse: true,
                        // autoWidth: true,
                        destroy: true,
                        paging: true,
                        columns: [
                            {
                                title: "<span style='font-size:11px;'>วันที่/เวลา</span>",
                                data: "cn_pre_job_datetime",
                                width: "70px",
                                //visible: false,
                                class: "tx-center",
                                render: function (data, type, row, meta) {
                                    return '<span style="font-size:11px;">' + moment(data).format('DD/MM/YYYY') + '  ' + moment(data).format('HH:mm') + '<span/>';
                                }
                            }, //1
                            {
                                title: "<span style='font-size:11px;'>สถานะ</span>",
                                data: "cn_pre_job_status",
                                width: "70px",
                                //visible: false,
                                class: "tx-center",
                                render: function (data, type, row, meta) {

                                    if (data == 'open') {
                                        return '<span style="color:red; ">Open</span>';
                                    } else if (data == "on_process") {
                                        return '<span style="color:orange;">On Process</span>';
                                    } else if (data == "receive") {
                                        return '<span style="color:green;">Receive</span>';
                                    } else if (data == "complete") {
                                        return '<span style="color:green;">Complete</span>';
                                    } else if (data == "rejected") {
                                        return '<span style="color:red;">Rejected</span>';
                                    } else if (data == "change") {
                                        return '<span style="color:#00AEFF;">Change</span>';
                                    } else if (data == "cancel") {
                                        return '<span style="color:#FFC300">Cancel</span>';
                                    } else {
                                        return '<span style="color:#000">' + data + '</span>';
                                    }

                                }
                            }, //2
                            {
                                title: "<span style='font-size:11px;'>ข้อมูลสินค้า</span>",
                                data: "cn_pre_job_item_name",
                                //width: "70px",
                                //visible: false,
                                class: "tx-center",
                                render: function (data, type, row, meta) {
                                    return '<span>' + data + '</span>';
                                }
                            }, //3
                            {
                                title: "<span style='font-size:11px;'>QTY</span>",
                                data: "cn_pre_job_qty",
                                //width: "70px",
                                //visible: false,
                                class: "tx-center",
                                render: function (data, type, row, meta) {
                                    return '<span>' + data + '</span>';
                                }
                            }, //4
                            {
                                title: "<span style='font-size:11px;'>WH</span>",
                                data: "saletra_item_whdiscode",
                                //width: "70px",
                                visible: false,
                                class: "tx-center",
                                render: function (data, type, row, meta) {
                                    if (data === 'ST') {
                                        return '<span class="badge badge-success">' + data + '</span>';
                                    } else {
                                        return '<span class="badge badge-danger">' + data + '</span>';

                                    }
                                }
                            }, //5
                            {
                                title: "<span style='font-size:11px;'>การแจ้งรับ</span>",
                                data: "cn_pre_job_type",
                                //width: "70px",
                                //visible: false,
                                class: "tx-center",
                                render: function (data, type, row, meta) {
                                    if (data == '1') {
                                        return '<span>' + 'รับคืน' + '</span>';
                                    } else {
                                        return '<span>' + 'หน้างาน' + '</span>';

                                    }
                                }
                            }, //6
                            {
                                title: "<span style='font-size:11px;'>โดย</span>",
                                data: "created_by",
                                width: "70px",
                                //visible: false,
                                class: "tx-center",
                                render: function (data, type, row, meta) {
                                    return '<span>' + data + '</span>';
                                }
                            }, //7


                        ],

                    });

                });


            });

            $('#modal-frm_history').on('hidden.bs.modal', function () {


            });

        }

        $.Load_comment = function () {
            let Get_comment = new URL(Cn_Branch_Lov_Get);

            Get_comment.search = new URLSearchParams({
                lov_type: 'Pre Job Code'
            });

            fetch(Get_comment).then(function (response) {
                return response.json();
            }).then(function (result) {
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

                    $.each(result.data, function (key, val) {
                        job_comment_dataSet.push({ id: val['lov_code'], text: val['lov_code'] + ' : ' + val['lov1'] });
                        job_comment_dataSet_list.push({ id: val['lov_code'], text: val['lov1'] });

                    });

                    $('#job_comment').select2({
                        width: '100%',
                        height: '40px',
                        data: job_comment_dataSet,
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


        }

        $.Load_Case = function () {
            let Get_comment = new URL(Cn_Branch_Lov_Get);

            Get_comment.search = new URLSearchParams({
                lov_type: 'Case Type'
            });

            fetch(Get_comment).then(function (response) {
                return response.json();
            }).then(function (result) {
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

                    $.each(result.data, function (key, val) {
                        cn_pre_job_type_dataset.push({ id: val['lov_code'], text: val['lov1'] });

                    });

                    $('#cn_pre_job_type').select2({
                        width: '100%',
                        minimumResultsForSearch: Infinity,
                        data: cn_pre_job_type_dataset,
                        placeholder: '-- เลือกการแจ้งรับ --',
                        templateResult: function (data) {
                            return data.text;
                        },
                        sorter: function (data) {
                            return data.sort(function (a, b) {
                                return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
                            });
                        }
                    });


                    $('#cn_pre_job_type').val('1').trigger('change.select2');
                }

            });


        }



        $(document).ready(async function () {

            await $("#global-loader").css('opacity', '0.5').fadeIn("slow");
            await $.init();
            await $.List();
            await $.Create();

        });


    } else {

        window.location.assign('./login');

    }

});