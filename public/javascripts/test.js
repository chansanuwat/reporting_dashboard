// DOM Ready =============================================================
$(document).ready(function() {

    // Update summary title for data it displays
    $("#summaryTitle").text('Test Info:');

    // Update the content data title for data it displays
    $("#contentTitle").text('Test Results:');

    // Populate the test summary content on initial page load
    $.getJSON('/tests/' + testId, function(data) {
        $('.headerTitle').text('Test: ' + data.name);

        // Add the test summary to the header
        populateTestSummary('#header .headerMessage', data);

        // populate the summary detail
        populateTestDetail(data);
    });

    // Populate the data table with scenario data for the test
    populateResultsTable();

    // Update the nav with the parent project for the test
    $.getJSON('/tests/' + testId + '/parent', function(data) {
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

    // Get all scenarios and related results for the test
    $.getJSON('/tests/' + testId + '/results', function(data) {
        var chartData = []
        // Add a row for each scenario result
        $.each(data, function(i){
            // Set row class for alternating background colors
            var thisClass = (((i+1) % 2 === 0) ? 'even_row' : 'odd_row')

            // Add the row with data to use for the click events
            content += '<tr id="' + this._id + '" class="row ' + thisClass + '" rel="' + this.scenario._id + '" data-delete-object="results" data-delete-id="' + this._id + '">';
            
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

            // Fill in the columns with the scenario and result data
            content += '<td>' + this.scenario.name + ' <img class="info" src="/images/info.png"/></td>';
            content += '<td>' + this.message + '</td>';
            content += '<td>' + this.duration + '</td>';
            content += '<td class="no_cell"><span class="delete">delete</span>';

            // Finish this row
            content += '</tr>';

            chartData.push([this.scenario.name, this.duration, columnColor]);
        });

        populateTestChart(chartData, '#e6e6e6');

        // Update the data table with all the scenarios and results
        $(locator + " tbody").html(content);

    });
}

function showResultDetail( id ) {

    // Position the testDetail div relative to the click
    $("#popup").css( {
        position:"absolute", 
        top:event.pageY, 
        left: event.pageX});

    // Get the result and scenario data
    $.getJSON( '/results/' + id, function(data) {

        // Add a link to the scenario
        $('#linkToScenario').html('<a href="/scenarios/' + data.scenario._id + '/show">Go to Scenario</a>')

        // Populate the scenario details
        $('#scenarioName').text(data.scenario.name);
        $('#scenarioSteps').html(data.scenario.description.replace(/(?:\r\n|\r|\n)/g, '<br />'));
        $('#scenarioMessage').text(data.message);

        // Change the colore of the scenario message based on it's result
        if(data.result === 'passed') {
            $('#scenarioMessage').css({color: "green"});
        }
        else if (data.result === 'failed') {
            $('#scenarioMessage').css({color: "darkred"})
        }
        else {
            $('#scenarioMessage').css({color: "darkblue"})
        }

        // Split lines in notes if notes exist
        if(data.notes) {
            $('#scenarioNotes .notes').html((data.notes.replace(/(?:\r\n|\r|\n)/g, '<br />')) || '' );
        }
        else {
            $('#scenarioNotes .notes').text( '' );
        };

        // Show the popup
        document.getElementById("popup").style.display='block';

    });
};

// Process clicks on table rows
function trClick(event){
    event.preventDefault();

    // If user clicked on the info image, show popup detail
    if(event.target.tagName === 'IMG'){
        showResultDetail($(this).attr('id'));
    }

    // If user clicked on the delete link, remove the object and all it's children from Mongo
    else if(event.target.tagName === 'SPAN'){
        console.log('DELETE');
        deleteObject("/" + $(this).data('delete-object') + '/' + $(this).data('delete-id'),populateResultsTable);
    }

    // Otherwise, go to the detail page for the object
    else {
        window.location.href = '/scenarios/' + $(this).attr('rel') + '/show';
    }
}