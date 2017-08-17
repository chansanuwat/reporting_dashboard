// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the project cards on initial page load
    showProjectCards();

    // Show Latest Test Detail
    $('#projectCards').on('click', 'div.card', openTestDetail);

    // Delete Project link click
    $('#popup').on('click', 'a.delete', deleteProject);

});

// Functions =============================================================

// Fill dashboard with cards
function showProjectCards() {

    document.getElementById("popup").style.display='none';

    var cardContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/projects/', function( data ) {

        // For each item in our JSON, add a card to content string
        $.each(data, function(){

            var projectId = this._id;
            cardContent += '<div id="' + projectId + '" class="card" data-id="' + projectId + '">';
            cardContent += '<div class="title">' + this.name + '<div class="dot"></div></div>';
            cardContent += '<div class="cardContainer">' + this.description + '</div>';
            cardContent += '<div class="updated"></div>';
            cardContent += '</div>';

            // Get last run data and update the dot and timestamp
            $.getJSON( '/projects/' + projectId + '/last_run', function( response ) {
                if(!jQuery.isEmptyObject(response)) {
                    if(response.summary.failed > 0) {
                        $('#' + projectId + ' .title div').attr({'class':'dot fail_dot'});
                    }
                    else if(response.summary.passed > 0) {
                        $('#' + projectId + ' .title div').attr({'class':'dot pass_dot'});
                    }
                    else {
                        $('#' + projectId + ' .title div').attr({'class':'dot yellow_dot'});
                    };
                    $('#' + projectId + ' .updated').text('Last run ' + dateFromObjectId(response._id) + ' ago');
                }
                else {
                    $('#' + projectId + ' .updated').text('No test results recorded');
                }
            });
        });

        // Inject the whole content string into the project cards container
        $('#projectCards').html(cardContent);
    });
};

// Display the test detail div and get test data
function openTestDetail() {
    var projectId = $(this).data('id');
    $('#linkToProject').html('<a href="/projects/' + $(this).data('id') + '/show">Go to Project</a>')

    // Deactivate any previously active cards
    $('#projectCards .active').removeClass("active");

    // Set the clicked card as active
    $('#' + $(this).data('id')).addClass("active");

    // Position the testDetail div relative to the click
    $("#popup").css( {
        position:"absolute", 
        top:event.pageY, 
        left: event.pageX});

    // Get last run data for the clicked project
    $.getJSON( '/projects/' + $(this).data('id') + '/last_run', function(data) { 
        // Display messaging if there are no tests associated to the project
        if (jQuery.isEmptyObject(data)) {
            $('#testDetail .chart').text('No history found')
            $('#testInfoMessage').text("No tests were found for this Project");
            document.getElementById("testInfoMessage").style.display='block';
            document.getElementById("testInfoContent").style.display='none';
        }
        // Otherwise, enable the history chart and test detail content
        else {
            // $('#testDetail .chart').html('<img src="images/chart.png">');   
            
            // Populate test summary with the data from the response
            populateTestSummary('#summaryHolder', data)

            // Populate test details with the data from the response  
            populateTestDetail(data);
            $('#linkToTest').html('<a href="/tests/' + data._id + '/show">Go to test</a>')
            document.getElementById("testInfoMessage").style.display='none';
            document.getElementById("testInfoContent").style.display='block';
        };
        $('#linkToDelete').html('<a href="#" class="delete" data-delete-id="' + projectId + '">Delete Project</a>')

        // Populate the history chart
        $.getJSON('projects/' + projectId + '/history/5', function(results){
            data = [];
            $.each(results, function(){
                data.unshift([this.name, this.summary.passed, this.summary.failed, this.summary.skipped]);
            });
            populateHistoryChart(data, '#f2f2f2');
        });

        // show the testDetail div
        document.getElementById("popup").style.display='block';
    });
};

function deleteProject(event){
    event.preventDefault();
    deleteObject('/projects/' + $(this).data('delete-id'),showProjectCards);
}

