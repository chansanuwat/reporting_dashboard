// DOM Ready =============================================================
$(document).ready(function() {
    
    // Update summary title for data it displays
    $("#summaryTitle").text('Scenario Info:');

    // Update the content data title for data it displays
    $("#contentTitle").text('Test Results:');

    // Populate the scenario summary content on initial page load
    $.getJSON('/scenarios/' + scenarioId, function(data) {
        $('.headerTitle').text('Scenario: ' + data.name);
        populateScenarioDetail(data);
    });

    // Populate the data table with Test Data for the scenario
    populateResultsTable();

    // Update the nav with the parent project for the scenario
    $.getJSON('/scenarios/' + scenarioId + '/parent', function(data) {
        updateNav(data.name, '/projects/' + data._id + '/show')
    });

    // Process any clicks on data table rows
    $('#testResults table tbody').on('click', 'tr', trClick);
    
});

// Functions =============================================================

function populateResultsTable() {

    // Initialize the content string to empty
    var content = '';

    // Set the locator for the data table
    var locator = "#testResults table";

    // Get all results and related tests for the scenario
    $.getJSON('/scenarios/' + scenarioId + '/results', function(data) {
        
        var chartData = [];

        // Add a row for each test result
        $.each(data, function(i){
            // Set row class for alternating background colors
            var thisClass = (((i+1) % 2 === 0) ? 'even_row' : 'odd_row')

            // Add the row with data to use for the click events
            content += '<tr id="' + this._id + '" class="row ' + thisClass + '" rel="' + this.test._id + '" data-delete-object="results" data-delete-id="' + this._id + '">';
            
            // Choose which dot color to show based on the result
            if(this.result === 'failed') {
                var statusDot = 'fail_dot';
                var columnColor = 'red';
            }
            else if(this.result === 'passed'){
                var statusDot = 'pass_dot';
                var columnColor = 'green';
            }
            else {
                var statusDot = 'yellow_dot';
                var columnColor = 'yellow';
            }
            content += '<td width="20"><span class="dot ' + statusDot + '"></span></td>';

            // Fill in the columns with the test and result data
            content += '<td>' + this.test.name + ' <img class="info" src="/images/info.png"/></td>';
            content += '<td>' + this.message + '</td>';
            content += '<td>' + this.duration + '</td>';
            content += '<td class="no_cell">Last run ' + dateFromObjectId(this._id) + ' ago</td>';
            content += '<td class="no_cell"><span class="delete">delete</span>';

            // Finish this row
            content += '</tr>';

            chartData.unshift([this.test.name, this.duration, columnColor])
        });

        populateTestChart(chartData, '#e6e6e6');

        // Update the data table with all the results
        $(locator + " tbody").html(content);

    });
}

function openTestDetail(id) {

    // Position the testDetail div relative to the click
    $("#popup").css( {
        position:"absolute", 
        top:event.pageY, 
        left: event.pageX});

    // Get the test data
    $.getJSON( '/tests/' + id, function(data) { 
                
        // Populate test summary with the data from the response
        populateTestSummary('#summaryHolder', data)

        // Populate test details with the data from the response  
        populateTestDetail(data);

        // Add a link to the test
        $('#linkToTest').html('<a href="/tests/' + data._id + '/show">Go to test</a>')

        // Hide test info message that is used on the dashboard
        document.getElementById("testInfoMessage").style.display='none';

        // Display the test info content
        document.getElementById("testInfoContent").style.display='block';

        // show the popup div
        document.getElementById("popup").style.display='block';
    });
}

// Process clicks on table rows
function trClick(event){
    event.preventDefault();

    // If user clicked on the info image, show popup detail
    if(event.target.tagName === 'IMG'){
        openTestDetail($(this).attr('rel'));
    }

    // If user clicked on the delete link, remove the object and all it's children from Mongo
    else if(event.target.tagName === 'SPAN'){
        console.log('DELETE');
        deleteObject("/" + $(this).data('delete-object') + '/' + $(this).data('delete-id'),populateResultsTable);
    }

    // Otherwise, go to the detail page for the object
    else {
        console.log('ELSE');
        window.location.href = '/tests/' + $(this).attr('rel') + '/show';
    }
}