$.uuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

//function numformat(n) {
//    return n.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,");
//}

function numformat(a) {
    var i = a.indexOf(".");
    var f = (parseFloat("0" + a.substring(i)).toFixed(2)).toString();
    return a.substring(0, i) + "." + f.substring(2, f.length);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



$.dynamicSort = function (property) {

    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a, b) {


        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;



    };

};

$.getParams = function () {

    // Get the Full href of the page e.g. http://www.google.com/files/script.php?v=1.8.7&country=india
    var href = window.location.href;

    // Get the protocol e.g. http
    var protocol = window.location.protocol + "//";

    // Get the host name e.g. www.google.com
    var hostname = window.location.hostname;

    // Get the pathname e.g. /files/script.php
    var pathname = window.location.pathname;

    // Remove protocol part
    var queries = href.replace(protocol, '');

    // Remove host part
    queries = queries.replace(hostname, '');

    // Remove pathname part
    queries = queries.replace(pathname, '');

    // Presently, what is left in the variable queries is : ?v=1.8.7&country=india

    // Perform query functions if present
    if (queries != "" && queries != "?") {

        // Remove question mark '?'
        queries = queries.slice(1);

        // Split all the different queries
        queries = queries.split("&");

        // Get the number of queries
        var length = queries.length;

        // Declare global variables to store keys and elements
        $_GET_Params = new Array();
        $_GET = {};

        // Perform functions per query
        for (var i = 0; i < length; i++) {

            // Get the present query
            var key = queries[i];

            // Split the query and the value
            key = key.split("=");

            // Assign value to the $_GET variable
            $_GET[key[0]] = [key[1]];

            // Assign value to the $_GET_Params variable
            $_GET_Params[i] = key[0];
        }
    }
}

$.addLogEvent = function (event_ref, domain_id, action, screen_name, status) {

    firebase.auth().onAuthStateChanged(function (user) {

        if (user) {

            let fs = firebase.firestore();
            let collection = 'log_events';
            let uuid = $.uuid();

            const objProfile = JSON.parse(localStorage.getItem('objProfile'));

            $.each(objProfile.auth_role, function (key, val) {

                let citem = {
                    event_id: uuid,
                    event_date: new Date(),
                    domain_id: domain_id,
                    application_id: val['application_id'],
                    session_id: user.uid,
                    user_name: user.email,
                    screen_name: screen_name,
                    event_ref: event_ref,
                    event_name: action,
                    event_status: status,
                };

                fs.collection(collection).doc(uuid).set(citem).then(function () {

                    console.log('addLogEvent', new Date(), collection);

                }).catch(function (error) {

                    console.error("Error writing document: ", error);

                });
            });

        }

    });

}

$.addLogError = function (event_ref, domain_id, action, screen_name, status) {

    firebase.auth().onAuthStateChanged(function (user) {

        if (user) {

            let fs = firebase.firestore();
            let collection = 'log_error';
            let uuid = $.uuid();

            const objProfile = JSON.parse(localStorage.getItem('objProfile'));

            $.each(objProfile.auth_role, function (key, val) {

                let citem = {
                    event_id: uuid,
                    event_date: new Date(),
                    domain_id: domain_id,
                    application_id: val['application_id'],
                    session_id: user.uid,
                    user_name: user.email,
                    screen_name: screen_name,
                    event_ref: event_ref,
                    event_name: action,
                    event_status: status,
                };

                fs.collection(collection).doc(uuid).set(citem).then(function () {

                    console.log('addLogEvent', new Date(), collection);

                }).catch(function (error) {

                    console.error("Error writing document: ", error);

                });
            });

        }

    });

}

$.numformat = function (str) {
    var parts = (str + "").split("."),
        main = parts[0],
        len = main.length,
        output = "",
        first = main.charAt(0),
        i;

    if (first === '-') {
        main = main.slice(1);
        len = main.length;
    } else {
        first = "";
    }
    i = len - 1;
    while (i >= 0) {
        output = main.charAt(i) + output;
        if ((len - i) % 3 === 0 && i > 0) {
            output = "," + output;
        }
        --i;
    }
    // put sign back
    output = first + output;
    // put decimal part back
    if (parts.length > 1) {
        output += "." + parts[1];
    }
    return parseFloat(output).toFixed(2);
}

function ReplaceNumberWithCommas(yourNumber) {
    //Seperates the components of the number
    var n = yourNumber.toString().split(".");
    //Comma-fies the first part
    n[0] = n[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    //Combines the two sections
    return n.join(".");
}

function isEmpty(value) {
    return typeof value == 'string' && !value.trim() || typeof value == 'undefined' || typeof value === null || value == '0001-01-01T00:00:00';
}

$.addCommas = function (nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
        //console.log("x1", x1);
    }
    //return x1 + (isNaN(parseFloat(x2).toFixed(2)) === true ? '' : parseFloat(x2).toFixed(2));
    return x1 + (isNaN(parseFloat(x2).toFixed(2)) === true ? '' : x2);
}

function toUpperCase(val) {
    if(val)
    var value = val.toUpperCase();
    //document.getElementById("demo").innerHTML = res;
    return value;

}

function importFile(evt) {

    var f = evt.target.files[0];
    console.log("importFile");

    if (f) {
        var r = new FileReader();
        r.onload = e => {
            var contents = processExcel(e.target.result);
            //console.log(contents)
            return contents;
        }
        r.readAsBinaryString(f);
    } else {
        console.log("Failed to load file");
    }
}

function processExcel(data) {

    console.log("processExcel");

    var workbook = XLSX.read(data, {
        type: 'binary'
    });

    var firstSheet = workbook.SheetNames[0];
    var data = to_json(workbook);
    return data
}

function to_json(workbook) {

    console.log("to_json");

    var result = {};
    workbook.SheetNames.forEach(function (sheetName) {
        var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
            header: 1
        });
        if (roa.length) result[sheetName] = roa;
    });
    //return JSON.stringify(result, 2, 2);
    return result;
}


// Set a Cookie
function setCookie(cName, cValue, expDays) {
    let date = new Date();
    date.setTime(date.getTime() + (expDays * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = cName + "=" + cValue + "; " + expires + "; path=/";
}

function getCookie(cName) {
    const name = cName + "=";
    const cDecoded = decodeURIComponent(document.cookie); //to be careful
    const cArr = cDecoded.split('; ');
    let res;
    cArr.forEach(val => {
        if (val.indexOf(name) === 0) res = val.substring(name.length);
    })
    return res;
}

$.DateToDB = function (value) {

    var temp_date = value.split("/");

    if (temp_date[2] === undefined || temp_date[2] === null) {

        return "";

    } else {

        return temp_date[2] + "-" + temp_date[1] + "-" + temp_date[0]

    }

}

$(document).ready(function () {

 

})
