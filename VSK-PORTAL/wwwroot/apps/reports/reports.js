'use strict';

let fs = firebase.firestore();

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
const url_report_get = url_api + "/api/Report_Get";
const url_master_data_customer = url_api + "/api/MasterDataCustomer";
let username;
let tbl_report;
let objProfile = JSON.parse(localStorage.getItem('objProfile'));

firebase.auth().onAuthStateChanged(function (user) {

    if (user) {

        var full_mail = user.email;
        username = full_mail.replace("@vskautoparts.com", "");

        $.init = async function () {

            $(".card-body").LoadingOverlay("show", {
                image: '',
                custom: customElement
            });

            //$('#modal-stl_target').off('shown.bs.modal').on('shown.bs.modal', async function (e) {

            //    await $.carmodel_import();

            //});

            $('#modal-stl_target').off('hidden.bs.modal').on('hidden.bs.modal', async function () {

                await setTimeout(function () {

                    location.reload();

                }, 100);

            });

            $('#btn-search').on('click', async function (e) {

                e.preventDefault();

                await tbl_carmodel_list.destroy();

                await $.carmodel_list();

                $('.search_global_filter').removeClass('d-none');
                //await $.List('search');

            });

            $('.btn-reset').click(function (e) {

                e.preventDefault();

                $('.btn-gdishead-action').attr("data-action", "create");
                $('#frm_data').trigger('reset');
                $('#frm_data').find('input').val('').prop('disabled', false);
                $('#frm_data').find('select').val('').trigger('change.select2').prop('disabled', false);
                $("#frm_data").parsley().reset();

                $('.btn-ediscount-action').attr("data-action", "create");
                $('#frm_item').trigger('reset');
                $('#frm_item').find('input').val('').prop('disabled', false);
                $('#frm_item').find('select').val('').trigger('change.select2').prop('disabled', false);
                $("#frm_item").parsley().reset();

                $('.search_global_filter').addClass('d-none');
            });

            $.report_list()

            $(".card-body").LoadingOverlay("hide", true);
        };

        $.report_list = async function () {

            let url = new URL(url_report_get);

            url.search = new URLSearchParams({

                report_app: 'STL',
                report_pos: 'VSM',

            });

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (result) {

                tbl_report = $('#tbl-list').DataTable({
                    data: result.data,
                    dom: 't',
                    deferRender: true,
                    ordering: false,
                    pageLength: 10,
                    bDestroy: true,
                    columns: [
                        {
                            title: "<span style='font-size:11px;'>โปรเจค</span>",
                            data: "report_app",
                            class: "tx-center",
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '<span/>';
                            }
                        }, //0

                        {
                            title: "<span style='font-size:11px;'>สาขา</span>",
                            data: "report_pos",
                            class: "tx-center",
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;">' + data + '</span>';
                            }
                        }, //1
                        {
                            title: "<span style='font-size:11px;'>ชื่อรายงาน</span>",
                            data: "report_name",
                            class: "tx-center",
                            render: function (data, type, row, meta) {
                                return '<div data-placement="top" data-toggle="tooltip-primary">' + '<a href="' + row.report_link + '" target="_blank"><b>' + data + '<b></a></div>'
                            }
                        }, //2
                        {
                            title: "<span style='font-size:11px;'>ลิงค์</span>",
                            data: "report_link",
                            visible: false,
                            class: "tx-center",
                            render: function (data, type, row, meta) {
                                return '<div data-placement="top" data-toggle="tooltip-primary">' + '<a href="' + data + '" target="_blank"><b>' + data + '<b></a></div>'
                            }
                        }, //3
                        {
                            title: "<span style='font-size:11px;'>เวอร์ชั่น</span>",
                            data: "report_versions",
                            class: "tx-center",
                            render: function (data, type, row, meta) {
                                return '<span style="font-size:11px;  color:;">' + data + '</span>';
                            }
                        }, //4
                        {
                            title: "<span style='font-size:11px;'>สถานะ</span>",
                            data: "record_status",
                            class: "tx-center",
                            render: function (data, type, row, meta) {
                                if (data == 1) {
                                    return '<span class="label text-success">' + '<div class="dot-label bg-success mr-1"></div>' + 'ใช้งาน' + '</span >'

                                } else {
                                    return '<span class="label text-danger">' + '<div class="dot-label bg-danger  mr-1"></div>' + 'ไม่ใข้งาน' + '</span >'

                                }
                            }
                        }, //5
                    ],
                    "initComplete": async function (settings, json) {

                        $.contextMenu({
                            selector: '#tbl-list tbody tr',
                            callback: async function (key, options) {

                                let citem = tbl_report.row(this).data();

                                if (key === 'view') {
                                 
                                    $.modal(citem);

                                } else if (key === 'edit') {

                                } else if (key === 'delete') {

                                } else {

                                    alert('ERROR');

                                }

                            },
                            items: {

                                "view": { name: "View", icon: "fas fa-search" },

                            }

                        });

                    }

                });

            });

        };

        $.modal = async function (citem) {

            console.log('modal', citem)

            if (citem['report_id'] = '90DCBC40C-B32F-4F62-B412-B6C84F21Z2F3') {

                $.stl_target(citem);

            } else {

                console.log('ERORR')

            }

        };

        $.stl_target = async function (citem) {

            await $('#modal-stl_target').modal({
                keyboard: false,
                backdrop: 'static'
            });

            $.master_get();

            //$('#url_report').attr('src', "http://192.168.1.159/ReportServer/Pages/ReportViewer.aspx?%2fReport+Project1%2fRPT_STL_Customer_Target&rs:Command=Render&year=&sale=&area=&channel=")
            $('#url_report').attr('src', "http://192.168.1.159/ReportServer/Pages/ReportViewer.aspx?%2fReport+Project1%2fRPT_STL_Customer_Target&rs:Command=Render&sh_year=&sh_sale=&sh_area=&sh_channel=")

            $('#btn-save').off('click').on('click', function (evt) {

                evt.preventDefault();

                $(this).on('click', function (evt) {
                    evt.preventDefault();
                });

                let search_area = $('#frm_stl_target').find('#search_area').val()
                let search_sale = $('#frm_stl_target').find('#search_sale').val()
                let search_year = $('#frm_stl_target').find('#search_year').val()
                let search_channel = $('#frm_stl_target').find('#search_channel').val()

                $('#url_report').attr('src', "http://192.168.1.159/ReportServer/Pages/ReportViewer.aspx?%2fReport+Project1%2fRPT_STL_Customer_Target&rs:Command=Render&sh_year=" + search_year + "&sh_sale=" + search_sale + "&sh_area=" + search_area + "&sh_channel=" + search_channel + "")

                return false;
            });

        };

        $.master_get = function () {

            /*Channel*/
            let url_channel = new URL(url_master_data_customer);
          
            url_channel.search = new URLSearchParams({
                mode: 'Channel'
            });

            fetch(url_channel).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    $("#search_channel option").remove();
                    $("#search_channel").append("<option value=''>---select---</option>")

                    let dataSet = [];

                    $.each(result.data, function (key, val) {

                        dataSet.push({ id: val['channel'], text: val['channel'] });

                    });

                    $('#search_channel').select2({
                        width: '100%',
                        height: '40px',
                        data: dataSet,
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
            /*Channel*/

            /*Area*/
            let url_area = new URL(url_master_data_customer);

            url_area.search = new URLSearchParams({
                mode: 'Area'
            });

            fetch(url_area).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    $("#search_area option").remove();
                    $("#search_area").append("<option value=''>---select---</option>")

                    let dataSet = [];

                    $.each(result.data, function (key, val) {

                        dataSet.push({ id: val['area'], text: val['area'] });

                    });

                    $('#search_area').select2({
                        width: '100%',
                        height: '40px',
                        data: dataSet,
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
            /*Area*/

            /*Sale*/
            let url_sale = new URL(url_master_data_customer);

            url_sale.search = new URLSearchParams({
                mode: 'Sale'
            });

            fetch(url_sale).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    $("#search_sale option").remove();
                    $("#search_sale").append("<option value=''>---select---</option>")

                    let dataSet = [];

                    $.each(result.data, function (key, val) {

                        dataSet.push({ id: val['sales_representative'], text: val['sales_representative'] });

                    });

                    $('#search_sale').select2({
                        width: '100%',
                        height: '40px',
                        data: dataSet,
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
            /*Sale*/

            /*Year*/
            let url_year = new URL(url_master_data_customer);

            url_year.search = new URLSearchParams({
                mode: 'Year'
            });

            fetch(url_year).then(function (response) {
                return response.json();
            }).then(function (result) {

                if (result.status === 'Error') {

                    toastr.error('Oops! An Error Occurred');

                } else {

                    $("#search_year option").remove();
                    $("#search_year").append("<option value=''>---select---</option>")

                    let dataSet = [];

                    $.each(result.data, function (key, val) {

                        dataSet.push({ id: val['year'], text: val['year'] });

                    });

                    $('#search_year').select2({
                        width: '100%',
                        height: '40px',
                        data: dataSet,
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
            /*Year*/


        };

        $(document).ready(async function () {

            await $.init();

        });

    } else {

        window.location.assign('./login');

    }

});