$LogEventCreate = function (event_name,event_status,event_data) {

    console.log('LogEventCreate', new Date(), event_data);

    const objPermission = JSON.parse(localStorage.getItem('objAuth'));
    let event_id = $.uuid();
    
    $.ajax({
        //url: 'http://localhost:49705/v2/LogEventCreate',
        url: 'http://192.168.1.247:8089/v2/LogEventCreate',
        type: 'POST',
        data: {
            event_id: event_id,
            app_name: objPermission[0]['application'],
            user_id: objPermission[0]['username'],
            screen_name: location.pathname,
            event_name: event_name,
            event_status: event_status,
            event_data: event_data
        },
        success: function (result) {

            console.log('LogEventCreate', new Date(), result)

        }
    });

  
}