// Delete object
function deleteObject(path, callback) {

    // Pop up a confirmation dialog
    var confirmation = confirm("This will delete the object and all it's children.\nAre you sure?");

    // Check and make sure the user confirmed
    if (confirmation === true) {

        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            url: path
        }).done(function( response ) {
            alert(JSON.stringify(response));

            // Update the table
            callback();
        });
    }
    else {
        // If they said no to the confirm, do nothing
        return false;
    }

};

function populateHistoryChart(values, bgColor){
    
    // Load the Visualization API and the corechart package.
    google.charts.load('current', {'packages':['corechart']});

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(drawChart);

    // Callback that creates and populates a data table,
    // instantiates the pie chart, passes in the data and
    // draws it.
    function drawChart() {

        // Create the data table.
        var data = google.visualization.arrayToDataTable([
            ['Test Name',  'Passed', 'Failed', 'Skipped']
        ].concat(values));

        var options = {
            title: 'Last ' + values.length + ' Test Runs',
            legend: { position: 'bottom' },
            colors: ['green', 'red', 'yellow'],
            backgroundColor: bgColor,
            isStacked: true
        };

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.SteppedAreaChart(document.getElementById('historyChart'));
        chart.draw(data, options);
        
    }
};

function populateTestChart(values, bgColor){
    
    // Load the Visualization API and the corechart package.
    google.charts.load('current', {'packages':['corechart']});

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(drawChart);

    // Callback that creates and populates a data table,
    // instantiates the pie chart, passes in the data and
    // draws it.
    function drawChart() {

        // Create the data table.
        var data = google.visualization.arrayToDataTable([
            ['Scenario Name',  'Duration', {role: 'style'}]
        ].concat(values));

        var options = {
            title: 'Scenario Results',
            legend: { position: 'none' },
            vAxis: { title: 'Duration (seconds)'},
            backgroundColor: bgColor
        };

        // Instantiate and draw our chart, passing in some options.
        var chart = new google.visualization.ColumnChart(document.getElementById('resultChart'));
        chart.draw(data, options);

    }
};

// Populate test summary content
function populateTestSummary( locator, response ) {
    var content = '<span id="summary">';
    content += '<span id="scenarioCount" class="summary">' + response.summary.total + ' Scenarios</span>';
    content += ' (<span id="scenarioCount" class="summary pass">' + response.summary.passed + ' Passed</span>';
    content += ', <span id="scenarioCount" class="summary fail">' + response.summary.failed + ' Failed</span>';
    content += ', <span id="scenarioCount" class="summary skip">' + response.summary.skipped + ' Skipped</span>)';
    content += '</span>';
    $(locator).html(content);
};

// populate Test Detail content
function populateTestDetail( response ) {  
    $('#testName').text(response.name);
    $('#testDesc').text(response.description);
    $('#testEnv').text(response.environment);
    $('#testNotes').text(response.notes);
    $('#runTime').text(dateFromObjectId(response._id) + ' ago');
};

// populate Scenario Detail content
function populateScenarioDetail( response ) { 
    $('#scenarioName').text(response.name);
    $('#scenarioSteps').html(response.description.replace(/(?:\r\n|\r|\n)/g, '<br />'));
};

// Close Detail Popup
function closeDetail(locator,active) {
    $(locator).css({'display': 'none'});
    $(active + ' .active').removeClass("active");
};

// Update nav with passed path and link text
function updateNav(text, path) {
    $('#nav').append(' > <a href="' + path + '">' + text + '</a>')
}

// Get time ago from Mongo objectId
function dateFromObjectId(objectId) {
    return timeSince(new Date(parseInt(objectId.substring(0, 8), 16) * 1000));
};

function timeSince(date) {

    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}