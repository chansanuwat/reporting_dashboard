// DOM Ready =============================================================
$(document).ready(function() {
    
    // Update summary title for data it displays
    $("#summaryTitle").text('Project Info:');

    // Update the content data title for data it displays
    $("#contentTitle").text('Test Summaries:');

    // Populate the project summary content on initial page load
    $.getJSON('/projects/' + projectId, function(data) {
        $('.headerTitle').text('Project: ' + data.name);
        $('#projectDescription').text(data.description);
    });

    // Populate the data table with Test Data for the project
    populateTestsTable();

    // Populate the history chart
    showHistory();

    // Process any clicks on data table rows
    $('table tbody').on('click', 'tr', trClick);

});

// Functions =============================================================

function showHistory(){
    // Populate the history chart
    $.getJSON('/projects/' + projectId + '/history/10', function(results){
        if(results.length > 0){
            data = [];
            $.each(results, function(){
                data.unshift([this.name, this.summary.passed, this.summary.failed, this.summary.skipped]);
            });
            populateHistoryChart(data, '#e6e6e6');
        }
    });
}

function populateTestsTable(locator,data) {
    
    // Initialize the content string to empty
    var content = '';

    // Set the locator for the data table
    var locator = "#tests table";

    // Get JSON for list of tests related to the project
    $.getJSON('/projects/' + projectId + '/tests', function(data) {

        // For each test, add a row to the table
        $.each(data, function(i){

            // Set row class for alternating background colors
            var thisClass = (((i+1) % 2 === 0) ? 'even_row' : 'odd_row')

            // Add the row with data to use for the click events
            content += '<tr id="' + this._id + '" class="row ' + thisClass + '" rel="' + this._id + '" data-delete-object="tests" data-delete-id="' + this._id + '">';
           
           // Choose which dot color to show based on results summary
            if(this.summary.failed > 0) {
                var statusDot = 'fail_dot';
            }
            else if(this.summary.passed > 0){
                var statusDot = 'pass_dot';
            }
            else {
                var statusDot = 'yellow_dot';
            }
            content += '<td width="20"><span class="dot ' + statusDot + '"></span></td>';

            // Fill in the columns with the test data
            content += '<td>' + this.name + '</td>';
            content += '<td>' + this.description + '</td>';
            content += '<td>' + this.environment + '</td>';
            content += '<td class="center">' + this.summary.total + '</td>';
            content += '<td class="center">' + this.summary.passed + '</td>';
            content += '<td class="center">' + this.summary.failed + '</td>';
            content += '<td class="center">' + this.summary.skipped + '</td>';
            content += '<td class="no_cell">Last run ' + dateFromObjectId(this._id) + ' ago</td>';
            content += '<td class="no_cell"><span class="delete">delete</span>';

            // Finish this row
            content += '</tr>';
        });

        // Update the data table with all the results
        $(locator + " tbody").html(content);

    });
}


// Process clicks on table rows
function trClick(event){
    event.preventDefault();

    // If user clicked on the info image, show popup detail
    if(event.target.tagName === 'IMG'){
        showResultDetail($(this).data('id'));
    }

    // If user clicked on the delete link, remove the object and all it's children from Mongo
    else if(event.target.tagName === 'SPAN'){
        console.log('DELETE');
        deleteObject("/" + $(this).data('delete-object') + '/' + $(this).data('delete-id'),populateTestsTable);
    }

    // Otherwise, go to the detail page for the object
    else {
        window.location.href = '/tests/' + $(this).attr('rel') + '/show';
    }
}